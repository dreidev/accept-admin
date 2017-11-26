const axios = require("axios")
const { startTunnel, closeTunnel } = require("./localtunnel")
const { startServer, closeServer } = require("./server")
const AcceptAdmin = require("../index")

const { PAYMOB_CREDENTIALS, NODE_ENV, PORT } = process.env

axios.defaults.baseURL = "https://accept.paymobsolutions.com/api"
axios.defaults.headers.common["Accept"] = "application/json"
axios.defaults.headers.common["Content-Type"] = "application/json"
axios.defaults.headers.common["X-CSRFToken"] = null

let url

beforeAll(async function() {
  ;[url] = await Promise.all([
    startTunnel(PORT).then(([lt, url]) => {
      return url
    }),
    startServer({ PORT, NODE_ENV }),
  ])
  console.log(`started child server on port ${PORT}`)
  console.log(`started localtunnel at ${url}`)
  console.log(`got paymob token`)
  console.log(``)
})

afterAll(() => {
  closeServer()
  closeTunnel()
})

describe("Unit Tests", () => {
  describe("credential", async () => {})
})

describe("Integration Tests", async () => {
  let token
  //  transaction_processed_callback, transaction_response_callback
  beforeAll(async () => {
    AcceptAdmin.config({ credentials: PAYMOB_CREDENTIALS })

    token = await AcceptAdmin.getToken()
    // ;({
    //   transaction_processed_callback,
    //   transaction_response_callback,
    // } = await AcceptAdmin.getIntegrationHooks({ token }))

    await AcceptAdmin.setIntegrationHooks({
      token,
      integration: {
        transaction_processed_callback: `${url}/api/v3/accept/notification`,
        transaction_response_callback: `${url}/api/v3/accept/response`,
      },
    })
  })

  test("should be able to make payment and recieve resposne", async () => {
    let res = await AcceptAdmin.pay({
      credentials: PAYMOB_CREDENTIALS,
      amount: 20,
      source: {
        identifier: "5123456789012346",
        sourceholder_name: "Test Account",
        subtype: "CARD",
        expiry_month: "05",
        expiry_year: "19",
        cvn: "123",
      },
    })
    expect(res.amount_cents).toEqual("2000")
  })

  afterAll(async () => {
    // await AcceptAdmin.setIntegrationHooks({
    //   token,
    //   integration: {
    //     transaction_processed_callback: PAYMOB_NOTIFICATION_URL,
    //     transaction_response_callback: PAYMOB_RESPONSE_URL,
    //   },
    // })
  })
})
