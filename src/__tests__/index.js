import ACCEPT_CONFIG from "../../config"
import { DEFAULT_CREDENTIALS, DEFAULT_INTEGRATION } from "../constants"
import Accept, { AcceptAdmin } from "../index"

// import { mockAllAPIs, removeAPIMock } from "./helper/api_mock"
// const { NODE_ENV, PORT } = process.env
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000
// let url

describe("Accept admin instance creation", () => {
  /**
   * Accept is a singlton that is created on import
   * import Accept from "accept-admin"
   * and that will most probably be used most of the time
   */
  test("Accept singlton is and Accept Admin Instace", () => {
    expect(Accept).toBeInstanceOf(AcceptAdmin)
  })
  /**
   * it is possible to create other instaces by importing the AcceptAdmin class
   * import { AcceptAdmin } from 'accept-admin'
   */
  test("create Accept Admin Instaces", () => {
    const otherAccept = new AcceptAdmin(ACCEPT_CONFIG)
    expect(otherAccept).toBeInstanceOf(AcceptAdmin)
    expect(otherAccept).not.toBe(Accept)
  })
  /**
   * it is also possible to create other instaces by using the create method availbe in every instance
   * import Accept from 'accept-admin'
   * Accept.create()
   */
  test("create Accept Admin Instaces", () => {
    const otherAccept = Accept.create(ACCEPT_CONFIG)
    expect(otherAccept).toBeInstanceOf(AcceptAdmin)
    expect(otherAccept).not.toBe(Accept)
  })
})

describe("Accept Admin configuration", () => {
  /**
   * Accept Admin is configured on creation or through the config method
   * this sets the user credentials, default shipping_data, and billing used when abscent.
   */
  test("config Accept Admin", () => {
    expect(Accept.credentials).toEqual(DEFAULT_CREDENTIALS)
    Accept.config(ACCEPT_CONFIG)
    expect(Accept.credentials).toEqual(ACCEPT_CONFIG.credentials)
  })
})

describe("Accept Admin Authorization", () => {
  beforeAll(() => {
    Accept.config(ACCEPT_CONFIG)
  })
  /**
   * Accept Admin has a ogin method that when called will use the provided or instance credentials
   * to update credentials and fetch a token as well as the merchant _id
   */
  test("login", async () => {
    expect(Accept.token).toBe(null)
    expect(Accept.merchant_id).toBe(null)
    await Accept.login(/* credentials */)
    expect(Accept.token).not.toBe(null)
    expect(Accept.merchant_id).not.toBe(null)
  })
  /**
   * Accept Admin has refreshToken method that will re login and update the instance token
   * it returns the new token
   */
  test("refreshToken", async () => {
    expect(Accept.token).not.toBe(null)
    const oldToken = Accept.token
    const newToken = await Accept.refreshToken(/* credentials */)
    expect(Accept.token).not.toEqual(oldToken)
    expect(Accept.token).toEqual(newToken)
  })
  /**
   * Accept Admin has getNewToken method that will generate a new Token and return it
   * it can take credentials (acting as a pure function) or use instance credentials if non provided
   */
  test("getNewToken", async () => {
    expect(Accept.token).not.toBe(null)
    const oldToken = Accept.token
    const newToken = await Accept.getNewToken(/* credentials */)
    expect(Accept.token).toEqual(oldToken)
    expect(Accept.token).not.toEqual(newToken)
  })
  /**
   * Accept Admin has isloggedIn
   * checkes if token is set in the instance
   */
  test("isLoggedIn", async () => {
    expect(Accept.token).not.toBe(null)
    expect(Accept.isloggedIn()).toBe(true)
  })
  /**
   * Accept Admin has logout
   * which resets the instance tokena and merchan_id to null
   */
  test("isLoggedIn", async () => {
    expect(Accept.token).not.toBe(null)
    Accept.logout()
    expect(Accept.token).toBe(null)
    expect(Accept.merchant_id).toBe(null)
    expect(Accept.isloggedIn()).toBe(false)
  })
})

describe("Accept Integration", () => {
  /**
   * Accept Admin works by charging transaction against the integrations in your account
   * typicaly as part of your credentials when you sign up you are provided with one test integration id
   * in these integrations you setup a response and notification (called process) hook that links back to your server
   * in order to react to transactions when they occure
   * Every Accept instance manages one integration_id included in it's credentials object
   *
   * you can use Accept admin to set the transaction callback hooks endpoints using setIntegrationHooks
   */
  beforeAll(async () => {
    Accept.config(ACCEPT_CONFIG)
    await Accept.login()
  })

  const host = "https://example.com"
  const notification_callback_url = `/donotaccept/notifcation`

  test("setIntegration", () => {
    let integration_id = ACCEPT_CONFIG.integration_id
    expect(Accept.integration).toEqual({
      ...DEFAULT_INTEGRATION,
      id: integration_id,
    })
    Accept.setIntegration({
      host,
      notification_callback_url,
    })
    expect(Accept.integration).toEqual({
      host,
      notification_callback_url,
      response_callback_url: DEFAULT_INTEGRATION.response_callback_url,
      id: integration_id,
    })
  })
  test("setIntegrationHooks", async () => {
    expect(Accept.token).not.toBe(null)
    const data = await Accept.setIntegrationAndUpdateHooks({
      /* token: can be included to use as a pure method */
      /* credentials: can be included to use as a pure method */
      /* integration_id: can be included to use as a pure method */
      /* transaction_processed_callback: `${host}/api/accept/notification`,  */
      /* transaction_response_callback: `${host}/api/accept/response`,  */
    })
    expect(data.transaction_processed_callback).toEqual(
      `${host}${notification_callback_url}`
    )
    expect(data.transaction_response_callback).toEqual(
      `${host}${DEFAULT_INTEGRATION.response_callback_url}`
    )
  })
  test("getIntegrationHooks", async () => {
    expect(Accept.token).not.toBe(null)
    const data = await Accept.getIntegrationHooks(/* token, integration_id, credentials */)
    expect(data.transaction_processed_callback).toEqual(
      `${host}${notification_callback_url}`
    )
    expect(data.transaction_response_callback).toEqual(
      `${host}${DEFAULT_INTEGRATION.response_callback_url}`
    )
  })
})

describe("Accept Order and Payment Key", () => {
  let order_id, payment_token
  /**
   * In order to pay or tokenize with a credit card you must first generate an order and a payment key
   */
  beforeAll(async () => {
    Accept.config(ACCEPT_CONFIG)
    await Accept.login()
  })
  /**
   * the minimum requirement for creating an order is an amount in cents
   * accept admin will fill in the rest of the details with mock and default data
   * token does not need to be provided if instance is already loggedin or credentials is set
   */
  test("registerOrder should throw without amount_cents", async () => {
    expect.assertions(2)
    expect(Accept.token).not.toBe(null)
    await expect(Accept.registerOrder()).rejects.toBeInstanceOf(Error)
  })
  test("registerOrder should", async () => {
    expect(Accept.token).not.toBe(null)
    const order = await Accept.registerOrder({ amount_cents: 100 })
    order_id = order.id
    expect(order.id).not.toBe(null)
  })
  /**
   * the minimum requirement for creating a payment key is an order_id and amount in cents
   * if order_id is not provided one will be generated from amount_cents
   * token does not need to be provided if instance is already loggedin or credentials is set
   * the payment key is used to get a payment token in order to tokenize or pay with credit card
   */
  test("paymentKeyRequest with order_id", async () => {
    expect(Accept.token).not.toBe(null)
    const paymentKey = await Accept.paymentKeyRequest({
      order_id,
      amount_cents: 100,
    })
    expect(paymentKey.token).not.toBe(null)
  })
  test("paymentKeyRequest with amount_cents", async () => {
    expect(Accept.token).not.toBe(null)
    const paymentKey = await Accept.paymentKeyRequest({ amount_cents: 100 })
    payment_token = paymentKey.token
    expect(paymentKey.token).not.toBe(null)
  })
  /**
   * while the paymentKey endpoint only returns an object with token
   * this function is the one used to handle getting a payment token
   * it takes the same parameters the expection is that if already a payment token is present it returns
   * and will throw an error if amount_cents is not provided
   */
  test("getPaymentToken with payment_token provided", async () => {
    expect(Accept.token).not.toBe(null)
    const token = await Accept.getPaymentToken({ payment_token })
    expect(token).toBe(payment_token)
  })
  test("getPaymentToken without amount should throw", async () => {
    expect.assertions(2)
    expect(Accept.token).not.toBe(null)
    await expect(Accept.getPaymentToken()).rejects.toBeInstanceOf(Error)
  })
  test("getPaymentToken with amount_cents and order_id", async () => {
    expect(Accept.token).not.toBe(null)
    const token = await Accept.getPaymentToken({ amount_cents: 100, order_id })
    expect(token).not.toBe(null)
  })
  /**
   * for tokenization we need a payment_token, email, and order_id in addition to the credit card details
   * this function will return the order_id, payment_token, email
   * token does not need to be provided if instance is already loggedin or credentials is set
   * if any is already present none is recomputed
   */
  test("getPaymentClaimsForTokenization", async () => {
    expect(Accept.token).not.toBe(null)
    const paymentClaims = await Accept.getPaymentClaimsForTokenization(/* { order_id, payment_token } */)
    expect(paymentClaims.order_id).not.toBe(null)
    expect(paymentClaims.payment_token).not.toBe(null)
    expect(paymentClaims.email).not.toBe(null)
  })
})
