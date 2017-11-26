import Hmac512 from "crypto-js/hmac-sha512"

export const RESPONSE_HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
]

export const TOKEN_HMAC_FIELDS = [
  "id",
  "token",
  "masked_pan",
  "merchant_id",
  "card_subtype",
  "created_at",
  "order_id",
  "email",
]

export const TRANSACTION_HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order.id",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
]

export const DELIVERY_HMAC_FIELDS = [
  "id",
  "order.id",
  "merchant",
  "created_at",
  "status",
  "extra_description",
  "gps_long",
  "gps_lat",
]

export function authorizeDeliveryStatus({ hmac_secret, hmac, data }) {
  return (
    hmac === computeHmac({ hmac_secret, data, fields: DELIVERY_HMAC_FIELDS })
  )
}
export function authorizeTransaction({ hmac_secret, hmac, data }) {
  return (
    hmac === computeHmac({ hmac_secret, data, fields: TRANSACTION_HMAC_FIELDS })
  )
}
export function authorizeToken({ hmac_secret, hmac, data }) {
  return hmac === computeHmac({ hmac_secret, data, fields: TOKEN_HMAC_FIELDS })
}
export function authorizeResponse({ hmac_secret, hmac, data }) {
  let useLiteralKeys = true
  return (
    hmac ===
    computeHmac({
      hmac_secret,
      data,
      fields: RESPONSE_HMAC_FIELDS,
      useLiteralKeys,
    })
  )
}

/**
 * compute hmac based on fields selected from data object
 * @param {Object} options {
 *  hmac_secret String,
    data [Object] object contianins key value map to be hashed for by the hmac function
    fields [String] fields to select from data
    literalKeys Boolean if true keys in fields would not be walked but taken as is otherwise a . in the key string signafies that the object 
 * } 
 */
export function computeHmac({
  hmac_secret,
  data,
  fields,
  literalKeys = false,
}) {
  let message = (fields || Object.keys(data)).reduce((secrert, key) => {
    let val = literalKeys ? data[key] : getVal(data, key)
    return secrert + "" + val
  }, "")

  return Hmac512(message, hmac_secret).toString()
}

/**
 * walk through object using keys seperated by dots
 * @param {*} object any javascript object
 * @param {*} key a key of the form "key.subkey.subsubkey"
 */
export function getVal(object, key) {
  return key.split(".").reduce((subObject, subkey) => subObject[subkey], object)
}
