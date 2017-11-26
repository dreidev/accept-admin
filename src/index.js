import {
  authorizeDeliveryStatus,
  authorizeTransaction,
  authorizeResponse,
  authorizeToken,
} from "./hmac_authorization"

import {
  voidTransaction,
  refundTransaction,
  pay,
  tokenize,
  createPaymentKey,
  createOrder,
  updateIntegration,
  getIntegration,
  getUser,
} from "./api"

import { DEFAULT_TOKEN_EXPIRATION_TIME } from "./constants"

const defaultCredentials = {
  username: null,
  password: null,
  hmac_secret: null,
  integration_id: null,
  expiration: "" + DEFAULT_TOKEN_EXPIRATION_TIME,
}

const defaultShippingData = {
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  street: "Falaki",
  building: "4",
  floor: "4",
  apartment: "404",
  city: "Cairo",
  state: "Cairo",
  country: "Egypt",
  phone_number: "00201234567890",
  postal_code: "12345",
}

export class AcceptAdmin {
  token = null
  merchant_id = null
  credentials = defaultCredentials
  shipping_data = defaultShippingData

  constructor(config = {}) {
    this.config(config)
  }

  create(config) {
    return new AcceptAdmin(config)
  }

  config(config) {
    this.credentials = Object.assign({}, this.credentials, config.credentials)
    this.shipping_data = this.billing = Object.assign(
      {},
      this.shipping_data,
      config.shipping_data
    )
    return this
  }

  async login(credentials = this.credentials) {
    let profile = await getUser(credentials)
    this.token = profile.token
    this.merchant_id = profile.id
    return profile
  }

  async refreshToken(credentials = this.credentials) {
    this.token = await this.getToken(credentials)
    return this.token
  }

  async getToken(credentials = this.credentials) {
    let profile = await getUser(credentials)
    return profile.token
  }

  isloggedIn() {
    return !!this.token
  }

  logout() {
    this.token = this.merchant_id = null
    return this
  }

  @refreshTokenOnceIfExpired
  async voidTransaction(config) {
    let { token } = await this._processCredentials(config)
    return voidTransaction({ token, ...config })
  }

  @refreshTokenOnceIfExpired
  async refundTransaction(config) {
    let { token } = await this._processCredentials(config)
    return refundTransaction({ token, ...config })
  }

  /**
    Send a payment to paymob's server
    You can pay either using credit card info or via token that you already tokenized

    @param config: {
      amount_cents: Number amount in cents to charge from credit card
      payment_token: (optional) token aquired from a previouse request replaces the need for amount
      billing: (optional) billing address for credit card similar to one set for shipping
      card_token: (optional) tokonized card token if included no need to include source
      source: {
        "identifier": "5123456789012346",  // card number, will be card token in case of saved card
        "sourceholder_name": "Test Account", // OPTIONAL when subtype: TOKEN
        "subtype": "CARD",  // will be TOKEN in case of saved card
        "expiry_month": "05", // OPTIONAL when subtype: TOKEN
        "expiry_year": "17", // OPTIONAL when subtype: TOKEN
        "cvn": "123" // OPTIONAL when subtype: TOKEN
      }
    }
    @return Promise<Payment> data from Payment response
   */
  async pay(config) {
    let source = _processCreditCardSource(config)
    let payment_token = await this.getPaymentToken(config)

    let res = await pay({
      source,
      billing: Object.assign({}, this.billing, config.billing),
      payment_token,
      api_source: config.api_source || "IFRAME", // setting IFRAME has a consistent response for both mobile and iframe
    })
    return res.data
  }

  /**
   * tokenize a credit card based on source
   * amount_cents defaults to 2 EGP, it is recomended to void the transaction after tokenization is successful
   * TODO: In fact an option is enabled by default in the express notification hook that voids transactions of type TOKEN
   * @param {*} config {
      "pan": "5123456789012346", card number to be tokenized
      "cardholder_name": "Test Account",
      "expiry_month": "05",
      "expiry_year": "17",
      "cvn": "123",

      "email": "som@place.com", // optional
      "order_id": 23, // order id needed to associated with payment token
      "payment_token": String // optional one can be generated

      in case order_id is not supplied then an order and payment key will be generated from amount_cents which default to 200 cents

      token is then required or credentails and other means of getting token must then be supplied
      
      amount_cents: (optional) amount to charge the card while tokenizing default to 200
      
      source: { // and API simialr to pay in order to have similar test data
        "identifier": "5123456789012346",  // card number, will be card token in case of saved card
        "sourceholder_name": "Test Account",
        "expiry_month": "05", // OPTIONAL when subtype: TOKEN
        "expiry_year": "17", // OPTIONAL when subtype: TOKEN
        "cvn": "123" // OPTIONAL when subtype: TOKEN
      }
    }
   */
  async tokenize(config) {
    let source = config.source
    let payment_key_claims = await this.getPaymentClaimsForTokenization(config)
    let info = payment_key_claims.shipping_data
      ? payment_key_claims.shipping_data
      : payment_key_claims.billing_data

    let res = await tokenize({
      payment_token: payment_key_claims.token,
      pan: config.pan || source.identifier,
      expiry_month: config.expiry_month || source.expiry_month,
      expiry_year: config.expiry_year || source.expiry_year,
      cardholder_name: config.cardholder_name || source.sourceholder_name,
      order_id: config.order_id || payment_key_claims.order_id,
      email: config.email || info.email,
    })
    return res.data
  }

  /**
    create a payment token given amount_cents or order
    if config already has payment_token then return that immidiatly
    @param config: {
      amount_cents: Number amount in cents to charge from credit card
      payment_token: (optional) token aquired from a previouse request replaces the need for amount
      order: (optional) indecate that this payment token is for this order
      order_id: (optional)  the id of the order that is to be made
    }
  */
  async getPaymentToken(config) {
    if (config.payment_token) {
      return config.payment_token
    } else if (config.amount_cents !== undefined) {
      return (await this.paymentKeyRequest(
        Object.assign(
          config,
          config.order
            ? {}
            : {
                shipping_data: config.billing,
              }
        )
      )).token
    }
    throw new Error(
      `You must supply either payment_token, amount_cents, order, or order_id to charge, got input ${JSON.stringify(
        config
      )}`
    )
  }

  async getPaymentClaimsForTokenization(config) {
    return config.order_id && config.payment_token
      ? {
          order_id: config.order_id,
          payment_token: config.payment_token,
          shipping_data: defaultShippingData,
        }
      : this.paymentKeyRequest({
          ...config,
          amount_cents: config.amount_cents || 200,
        })
  }

  @refreshTokenOnceIfExpired
  async paymentKeyRequest({
    token,
    credentials,
    integration_id,
    shipping_data,
    amount_cents = 100,
    order_id,
    currency = "EGP",
    expiration = DEFAULT_TOKEN_EXPIRATION_TIME,
  }) {
    ;({ token, integration_id } = await this._processCredentials({
      token,
      credentials,
      integration_id,
    }))

    shipping_data = this._getShippingData({ shipping_data })

    order_id =
      order_id ||
      (await this.registerOrder({
        token,
        shipping_data,
        amount_cents,
      })).id

    let res = await createPaymentKey({
      token,
      amount_cents,
      order_id,
      expiration,
      currency,
      integration_id,
      shipping_data,
    })

    return res.data
  }

  @refreshTokenOnceIfExpired
  async registerOrder({
    credentials,
    token,
    amount_cents,
    shipping_data,
    ...options
  }) {
    ;({ token } = await this._processCredentials({
      token,
      credentials,
    }))
    shipping_data = this._getShippingData({ shipping_data })

    if (!amount_cents) {
      throw new Error(`key amount_cents is required, got ${amount_cents}`)
    }

    let res = await createOrder({
      token,
      shipping_data,
      amount_cents,
      ...options,
    })

    return res.data
  }

  /**
    set Integration hooks for testing purposes
    config: {
      token: token aquired from previouse request
      credentials: credentials provided by paymob
                   optional if you already supplied the credentials
      integration_id: (OPTIONAL) id of integration to update
      integration: {
        transaction_processed_callback: hook for recieving notifications
        transaction_response_callback: hook for responding to transaction
      }
    }
   */
  @refreshTokenOnceIfExpired
  async setIntegrationHooks({
    token,
    integration_id,
    credentials,
    integration,
  }) {
    ;({ token, integration_id } = await this._processCredentials({
      credentials,
      token,
      integration_id,
    }))
    let res = await updateIntegration({ integration_id, token, integration })

    return res.data
  }

  @refreshTokenOnceIfExpired
  async getIntegrationHooks({
    token,
    integration_id,
    credentials,
    integration,
  }) {
    ;({ token, integration_id } = await this._processCredentials({
      credentials,
      token,
      integration_id,
    }))
    let res = await getIntegration({ integration_id, token })
    return res.data
  }

  async _processCredentials({ credentials, token, integration_id }) {
    if (credentials) {
      token = await this.getToken(credentials)
      integration_id =
        credentials.integration_id || this.credentials.integration_id
    } else {
      token = token || this.token || (await this.refreshToken())
      integration_id = integration_id || this.credentials.integration_id
    }

    if (!token) {
      throw Error(
        `Token is required got ${token} you must supply credentials or login`
      )
    }

    return { token, integration_id }
  }

  _getShippingData({ shipping_data = {} }) {
    shipping_data = Object.assign({}, this.shipping_data, shipping_data)
    return shipping_data
  }

  /**
   *
   *
   * @param {String} hmac hash of values based on hmac_secert
   * @param {any} data object from accept transaction hook body
   * @returns Boolean wether the hmac value in data matches the other fields
   * @memberof AcceptAdmin
   *
   */

  authorizeDeliveryStatus = (hmac, data) => {
    return authorizeDeliveryStatus({
      hmac_secret: this.credentials.hmac_secret,
      hmac,
      data,
    })
  }
  authorizeTransaction = (hmac, data) => {
    return authorizeTransaction({
      hmac_secret: this.credentials.hmac_secret,
      hmac,
      data,
    })
  }
  authorizeToken = (hmac, data) => {
    return authorizeToken({
      hmac_secret: this.credentials.hmac_secret,
      hmac,
      data,
    })
  }
  authorizeResponse = (hmac, query) => {
    return authorizeResponse({
      hmac_secret: this.credentials.hmac_secret,
      hmac,
      data: query,
    })
  }
}

function refreshTokenOnceIfExpired(fn) {
  return async function(...args) {
    try {
      return await fn(...args)
    } catch (error) {
      if (error.status === 401) {
        await AcceptAdmin.refreshToken()
        return fn(...args)
      } else {
        throw error
      }
    }
  }
}

function _processCreditCardSource({ source, card_token }) {
  if (!source) {
    if (card_token) {
      source = {
        identifier: card_token,
        subtype: "TOKEN",
      }
    } else {
      throw new Error(
        `You must supply either credit card info in key source or key card_token got input ${JSON.stringify(
          { source, card_token }
        )}`
      )
    }
  }
  return source
}

export default new AcceptAdmin()
