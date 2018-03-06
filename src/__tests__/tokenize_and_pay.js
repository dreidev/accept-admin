import Accept from "../index"
import { MASTER_CARD } from "../constants"
import ACCEPT_CONFIG from "../../config"
import { startTunnel, closeTunnel } from "./helper/localtunnel"
import { startServer, closeServer } from "./helper/util"

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000

describe("Accept Pay and Tokenize", async () => {
  let card_token = null
  let void_transaction_id = null
  let refund_transaction_id = null
  beforeAll(async () => {
    const PORT = 3209

    const [{ url: host }] = await Promise.all([
      startTunnel(PORT),
      startServer({ PORT }),
    ])

    console.log(host)
    console.log(`started localtunnel at ${host}`)

    Accept.config({ ...ACCEPT_CONFIG, host: `${host}` })

    console.log(`initializing accept instance`)
    await Accept.init()

    let data = await Accept.getIntegrationHooks()

    expect(data.transaction_response_callback).toEqual(
      `${host}${Accept.integration.response_callback_url}`
    )

    console.log(`initialized accept instance`)
  })

  afterAll(async () => {
    console.log("closing tunnel and server")
    closeTunnel()
    closeServer()
  })

  /**
   * using the tokenize function
   * this function will return the order_id, payment_token, email
   * token does not need to be provided if instance is already loggedin or credentials is set
   * if any is already present none is recomputed
   */
  test("tokenize", async () => {
    expect(Accept.token).not.toBe(null)
    console.log(`tokenizing`)
    const res = await Accept.tokenize({
      source: MASTER_CARD,
    })
    console.log(`tokenized`, res)
    expect(res.token).not.toBe(null)
    card_token = res.token
  })

  /**
   * using the pay function
   * this function will return the order_id, payment_token, email
   * token does not need to be provided if instance is already loggedin or credentials is set
   * if any is already present none is recomputed
   */
  test("pay", async () => {
    expect(Accept.token).not.toBe(null)
    console.log(`paying`)
    const res = await Accept.pay({
      source: { ...MASTER_CARD, subtype: "CARD" },
      amount_cents: 300,
    })
    void_transaction_id = res.id
    expect(res.amount_cents).toEqual(300)
  })

  /**
   * using the pay function with card token collected from the tokenization test
   * just setting card_token should substitute for including the card source
   */
  test("paying with token", async () => {
    expect(Accept.token).not.toBe(null)
    expect(card_token).not.toBe(null)
    console.log(`paying with token`)
    const res = await Accept.pay({
      card_token,
      amount_cents: 400,
    })
    refund_transaction_id = res.id
    expect(res.amount_cents).toEqual(400)
  })

  /**
   * paritally refunding transaction using transaction_id from last payment
   * refund is never full as the payment processor fees are still applied
   */
  test("refund transaction", async () => {
    expect(Accept.token).not.toBe(null)
    expect(refund_transaction_id).not.toBe(null)
    const res = await Accept.refundTransaction({
      transaction_id: refund_transaction_id,
      amount_cents: 300,
    })
    expect(res.status).toEqual(201)
    expect(res.data.amount_cents).toEqual(300)
    // expect(res.data.id).toEqual(refund_transaction_id)
  })

  /**
   * void transaction using transaction_id from last payment
   * this can only be used within the first 24 hours of a tranasction
   * voiding a transaction refunds it completly with no extra charge
   */
  test("void transaction", async () => {
    expect(Accept.token).not.toBe(null)
    expect(void_transaction_id).not.toBe(null)
    const res = await Accept.voidTransaction({
      transaction_id: void_transaction_id,
    })
    expect(res.status).toEqual(201)
    // expect(res.data.id).toEqual(void_transaction_id)
  })
})
