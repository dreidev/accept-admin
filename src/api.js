import Axios from "axios"
import { BASE_URL, DEFAULT_TOKEN_EXPIRATION_TIME } from "./constants"

const API = Axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-CSRFToken": null,
  },
})
export default API

export async function voidTransaction({ token, transaction_id }) {
  return API.post(`/acceptance/void_refund/void?token=${token}`, {
    transaction_id,
  })
}

export async function refundTransaction({
  token,
  transaction_id,
  amount_cents,
}) {
  return API.post(`/acceptance/void_refund/refund?token=${token}`, {
    amount_cents,
    transaction_id,
  })
}

export function pay({ source, billing, payment_token, api_source = "IFRAME" }) {
  return API.post(`/acceptance/payments/pay`, {
    source,
    billing,
    payment_token,
    api_source,
  })
}

export function tokenize({
  payment_token,
  pan,
  expiry_month,
  expiry_year,
  cardholder_name,
  order_id,
  email,
}) {
  return API.post(`/acceptance/tokenization?payment_token=${payment_token}`, {
    pan,
    expiry_month,
    expiry_year,
    cardholder_name,
    order_id,
    email,
  })
}

export function createPaymentKey({
  token,
  amount_cents,
  order_id,
  integration_id,
  shipping_data,
  expiration = DEFAULT_TOKEN_EXPIRATION_TIME,
  currency = "EGP",
}) {
  return API.post(`/acceptance/payment_keys?token=${token}`, {
    amount_cents,
    order_id,
    expiration,
    currency,
    card_integration_id: integration_id,
    shipping_data,
  })
}

export function createOrder({
  token,
  amount_cents,
  shipping_data,
  delivery_needed = "false",
  currency = "EGP",
  items = [],
}) {
  return API.post(`/ecommerce/orders?token="${token}"`, {
    delivery_needed,
    amount_cents,
    currency,
    items,
    shipping_data,
  })
}

export function updateIntegration({ integration_id, token, integration }) {
  return API.put(
    `/ecommerce/integrations/${integration_id}?token=${token}`,
    integration
  )
}

export function getIntegration({ integration_id, token }) {
  return API.get(`/ecommerce/integrations/${integration_id}?token=${token}`)
}

export async function getUser({
  username,
  password,
  expiration = DEFAULT_TOKEN_EXPIRATION_TIME,
}) {
  if (!(username && password)) {
    throw new Error("You must set paymob credentials { username, password }")
  }
  return API.post(`/auth/tokens`, { username, password, expiration })
}
