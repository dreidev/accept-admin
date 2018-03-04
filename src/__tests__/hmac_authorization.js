import Hmac512 from "crypto-js/hmac-sha512"
import faker from "faker"
import {
  authorizeDeliveryStatus,
  authorizeTransaction,
  authorizeResponse,
  authorizeToken,
  computeHmac,
  RESPONSE_HMAC_FIELDS,
  TOKEN_HMAC_FIELDS,
  TRANSACTION_HMAC_FIELDS,
  DELIVERY_HMAC_FIELDS,
} from "../hmac_authorization"
import {
  RESPONSE_HMAC_FIELDS_DATA,
  TRANSACTION_HMAC_FIELDS_DATA,
  DELIVERY_HMAC_FIELDS_DATA,
} from "./helper/hmac_fields_data"

const hmac_secret = faker.random.alphaNumeric()

test("computeHmac", () => {
  let hmac = Hmac512("abcdefg", hmac_secret).toString()
  expect(
    computeHmac({ hmac_secret, data: { a: "a", b: "bcd", d: "efg" } })
  ).toEqual(hmac)
})

test("authorizeResponse", () => {
  const data = RESPONSE_HMAC_FIELDS_DATA
  let hmac = Hmac512(
    RESPONSE_HMAC_FIELDS.map(() => 1).join(""),
    hmac_secret
  ).toString()
  expect(authorizeResponse({ hmac_secret, hmac, data })).toBe(true)
})

test("authorizeDeliveryStatus", () => {
  const data = DELIVERY_HMAC_FIELDS_DATA
  let hmac = Hmac512(
    DELIVERY_HMAC_FIELDS.map(() => 1).join(""),
    hmac_secret
  ).toString()
  expect(authorizeDeliveryStatus({ hmac_secret, hmac, data })).toBe(true)
})

test("authorizeToken", () => {
  const data = TOKEN_HMAC_FIELDS.reduce(
    (m, field) => ({ ...m, [field]: field }),
    {}
  )
  let hmac = Hmac512(TOKEN_HMAC_FIELDS.join(""), hmac_secret).toString()
  expect(authorizeToken({ hmac_secret, hmac, data })).toBe(true)
})
test("authorizeTransaction", () => {
  const data = TRANSACTION_HMAC_FIELDS_DATA
  let hmac = Hmac512(
    TRANSACTION_HMAC_FIELDS.map(() => 1).join(""),
    hmac_secret
  ).toString()
  expect(authorizeTransaction({ hmac_secret, hmac, data })).toBe(true)
})
