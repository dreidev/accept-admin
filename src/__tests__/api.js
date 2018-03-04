import MockAdapter from "axios-mock-adapter"
import faker from "faker"
import { mockAllAPIs } from "./helper/api_mock"
import API, {
  voidTransaction,
  refundTransaction,
  pay,
  tokenize,
  createPaymentKey,
  createOrder,
  updateIntegration,
  getIntegration,
  getUser,
} from "../api"

const mock = new MockAdapter(API)
beforeAll(async () => {
  mockAllAPIs(mock)
})
afterAll(async () => mock.restore())

test("API pay", async () => {
  const requestData = {
    source: {},
    payment_token: faker.random.alphaNumeric(),
    billing: {},
    api_source: "IFRAME",
  }
  const res = await pay(requestData)
  expect(res.status).toEqual(200)
})
test("API tokenize", async () => {
  const requestData = {
    payment_token: faker.random.alphaNumeric(),
    pan: "5123456789012346",
    expiry_month: "05",
    expiry_year: "21",
    cardholder_name: "Test Account",
    order_id: faker.random.number(),
    email: faker.internet.email(),
  }
  const res = await tokenize(requestData)
  expect(res.status).toEqual(200)
})
test("API createPaymentKey", async () => {
  const requestData = {
    token: faker.random.alphaNumeric(),
    amount_cents: faker.random.number(),
    order_id: faker.random.number(),
    integration_id: faker.random.number(),
    shipping_data: {},
    expiration: faker.random.number(),
    currency: "EGP",
  }
  const res = await createPaymentKey(requestData)
  expect(res.status).toEqual(200)
})
test("API createOrder", async () => {
  const requestData = {
    token: faker.random.alphaNumeric(),
    amount_cents: faker.random.number(),
    shipping_data: {},
    delivery_needed: "false",
    currency: "EGP",
    items: [],
  }
  const res = await createOrder(requestData)
  expect(res.status).toEqual(200)
})
test("API voidTransaction", async () => {
  const requestData = {
    token: faker.random.alphaNumeric(),
    transaction_id: faker.random.number(),
  }
  const res = await voidTransaction(requestData)
  expect(res.status).toEqual(200)
})
test("API refundTransaction", async () => {
  const requestData = {
    token: faker.random.alphaNumeric(),
    transaction_id: faker.random.number(),
  }
  const res = await refundTransaction(requestData)
  expect(res.status).toEqual(200)
})
test("API updateIntegration", async () => {
  const requestData = {
    token: faker.random.alphaNumeric(),
    transaction_id: faker.random.number(),
    integration: {},
  }
  const res = await updateIntegration(requestData)
  expect(res.status).toEqual(200)
})
test("API getIntegration", async () => {
  const requestData = {
    token: faker.random.alphaNumeric(),
    transaction_id: faker.random.number(),
  }
  const res = await getIntegration(requestData)
  expect(res.status).toEqual(200)
})
test("API getUser", async () => {
  const requestData = {
    username: faker.name.findName(),
    password: faker.internet.password(),
    expiration: faker.random.number(),
  }
  const res = await getUser(requestData)
  expect(res.status).toEqual(200)
})
