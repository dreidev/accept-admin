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

import {
  DEFAULT_CREDENTIALS,
  DEFAULT_SHIPPING_DATA,
  DEFAULT_INTEGRATION,
} from "./constants"

export class AcceptAdmin {
  token = null
  merchant_id = null
  credentials = DEFAULT_CREDENTIALS
  shipping_data = DEFAULT_SHIPPING_DATA
  integration = DEFAULT_INTEGRATION
  hmac_secret = null

  constructor(config = {}) {
    this.config(config)
  }

  create(config) {
    return new AcceptAdmin(config)
  }

  config(options) {
    const { credentials = {}, shipping_data = {} } = options
    this.credentials = { ...this.credentials, ...credentials }
    this.shipping_data = {
      ...this.shipping_data,
      ...shipping_data,
    }
    this.integration = this._processIntegrationHookConfig(options)
    this.hmac_secret = options.hmac_secret
    return this
  }

  async init({ credentials, integration } = {}) {
    await this.login(credentials)
    await this.setIntegrationAndUpdateHooks(integration)
  }

  async refreshToken(credentials) {
    await this.login(credentials)
    return this.token
  }

  async login(credentials) {
    this.credentials = { ...this.credentials, ...credentials }
    const profile = (await getUser(this.credentials)).data
    this.token = profile.token
    this.merchant_id = profile.id
    return profile
  }

  async getNewToken(credentials) {
    credentials = { ...this.credentials, ...credentials }
    const profile = (await getUser(credentials)).data
    return profile.token
  }

  isloggedIn() {
    return !!this.token
  }

  logout() {
    this.token = this.merchant_id = null
    return this
  }

  async setIntegrationAndUpdateHooks(integration) {
    this.setIntegration(integration)
    return this.setIntegrationCallbackHooks()
  }

  setIntegration(integration = {}) {
    this.integration = {
      ...this.integration,
      ...integration,
    }
  }

  async setIntegrationCallbackHooks(
    {
      transaction_processed_callback = this.integration.host +
        this.integration.notification_callback_url,
      transaction_response_callback = this.integration.host +
        this.integration.response_callback_url,
      integration_id = this.integration.id,
      ...options
    } = {}
  ) {
    try {
      let res = await this.setIntegrationHooks({
        ...options,
        integration_id,
        integration: {
          transaction_processed_callback,
          transaction_response_callback,
        },
      })
      console.log(
        `AcceptAdmin: callback hooks were set to ${
          transaction_response_callback
        } and ${transaction_processed_callback}`
      )
      return res
    } catch (error) {
      console.log("AcceptAdmin: Error Occured while setting callback hooks")
      console.log(error)
    }
  }

  /**
    set Integration hooks for testing purposes
    optons: {
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
  async setIntegrationHooks({ integration, ...options } = {}) {
    const { token, integration_id } = await this._processCredentials(options)
    const res = await updateIntegration({ integration_id, token, integration })
    return res.data
  }

  @refreshTokenOnceIfExpired
  async getIntegrationHooks(options = {}) {
    const { token, integration_id } = await this._processCredentials(options)
    let res = await getIntegration({ integration_id, token })
    return res.data
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
  async pay(options) {
    const source = _processCreditCardSource(options)
    const billing = this._getShippingData(options)
    const payment_token = await this.getPaymentToken(options)

    let res = await pay({
      source,
      billing,
      payment_token,
      api_source: options.api_source, // setting IFRAME has a consistent response for both mobile and iframe
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
  async tokenize(options) {
    const card = _processCreditCardForTokenization(options)
    const paymentClaims = await this.getPaymentClaimsForTokenization(options)

    let res = await tokenize({
      ...card,
      ...paymentClaims,
    })
    return res.data
  }

  async getPaymentClaimsForTokenization(options = { amount_cents: 200 }) {
    let { order_id, payment_token, email, amount_cents = 200 } = options
    order_id =
      order_id || (await this.registerOrder({ ...options, amount_cents })).id
    payment_token = await this.getPaymentToken({
      ...options,
      order_id,
      amount_cents,
    })
    return {
      order_id,
      payment_token,
      email: email || this.shipping_data.email,
    }
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
  async getPaymentToken({ payment_token, ...options } = {}) {
    if (payment_token) {
      return payment_token
    }
    return (await this.paymentKeyRequest(options)).token
  }

  @refreshTokenOnceIfExpired
  async paymentKeyRequest({ order_id, ...options }) {
    const { token, integration_id } = await this._processCredentials(options)
    const shipping_data = this._getShippingData(options)
    order_id = order_id || (await this.registerOrder(options)).id

    let res = await createPaymentKey({
      token,
      integration_id,
      shipping_data,
      order_id,
      ...options,
    })
    return res.data
  }

  @refreshTokenOnceIfExpired
  async registerOrder({ amount_cents, ...options } = {}) {
    if (!amount_cents) {
      throw new Error(`key amount_cents is required, got ${amount_cents}`)
    }

    const { token } = await this._processCredentials(options)
    const shipping_data = this._getShippingData(options)

    let res = await createOrder({
      token,
      shipping_data,
      amount_cents,
      ...options,
    })

    return res.data
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

  async _processCredentials({
    credentials,
    token,
    integration_id = this.integration.id,
  }) {
    if (credentials) {
      token = await this.getNewToken(credentials)
    } else {
      token = token || this.token || (await this.refreshToken())
    }

    if (!token) {
      throw Error(
        `Token is required got ${token} you must supply credentials or login`
      )
    }

    return { token, integration_id }
  }

  _getShippingData({ shipping_data = {}, billing = {} }) {
    shipping_data = Object.assign(
      {},
      this.shipping_data,
      shipping_data,
      billing
    )
    return shipping_data
  }

  _processIntegrationHookConfig({
    integration,
    host,
    integration_id,
    notification_callback_url,
    response_callback_url,
  }) {
    return {
      ...this.integration,
      ...integration,
      host,
      id: integration_id,
      notification_callback_url,
      response_callback_url,
    }
  }
}

function refreshTokenOnceIfExpired(fn) {
  return async function(...args) {
    this.name = fn.name
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

function _processCreditCardForTokenization({ source, ...options }) {
  return {
    pan: options.pan || source.identifier,
    expiry_month: options.expiry_month || source.expiry_month,
    expiry_year: options.expiry_year || source.expiry_year,
    cardholder_name: options.cardholder_name || source.sourceholder_name,
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
