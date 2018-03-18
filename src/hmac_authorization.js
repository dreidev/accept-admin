const Hmac512 = require("crypto-js/hmac-sha512")

const RESPONSE_HMAC_FIELDS = [
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

const TOKEN_HMAC_FIELDS = [
  "card_subtype",
  "created_at",
  "email",
  "id",
  "masked_pan",
  "merchant_id",
  "order_id",
  "token",
]

const TRANSACTION_HMAC_FIELDS = [
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

const DELIVERY_HMAC_FIELDS = [
  "id",
  "order.id",
  "merchant",
  "created_at",
  "status",
  "extra_description",
  "gps_long",
  "gps_lat",
]

function authorizeDeliveryStatus({ hmac_secret, hmac, data }) {
  return (
    hmac === computeHmac({ hmac_secret, data, fields: DELIVERY_HMAC_FIELDS })
  )
}
function authorizeTransaction({ hmac_secret, hmac, data }) {
  return (
    hmac === computeHmac({ hmac_secret, data, fields: TRANSACTION_HMAC_FIELDS })
  )
}
function authorizeToken({ hmac_secret, hmac, data }) {
  // console.log("TOKEN authorization with ", hmac)
  // console.log("AND data", data)
  // console.log("Selecting fields", TOKEN_HMAC_FIELDS)

  return hmac === computeHmac({ hmac_secret, data, fields: TOKEN_HMAC_FIELDS })
}
function authorizeResponse({ hmac_secret, hmac, data }) {
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
function computeHmac({
  hmac_secret,
  data = {},
  fields,
  useLiteralKeys = false,
}) {
  try {
    const message = (fields || Object.keys(data)).reduce((secrert, key) => {
      let val = useLiteralKeys ? data[key] : getVal(data, key)
      return secrert + "" + val
    }, "")
    return Hmac512(message, hmac_secret).toString()
  } catch (error) {
    console.log(error.message)
    return false
  }
}

/**
 * walk through object using keys seperated by dots
 * @param {*} object any javascript object
 * @param {*} key a key of the form "key.subkey.subsubkey"
 */
function getVal(object, key) {
  return key.split(".").reduce((subObject, subkey) => subObject[subkey], object)
}

exports.computeHmac = computeHmac
exports.authorizeResponse = authorizeResponse
exports.authorizeToken = authorizeToken
exports.authorizeTransaction = authorizeTransaction
exports.authorizeDeliveryStatus = authorizeDeliveryStatus
exports.DELIVERY_HMAC_FIELDS = DELIVERY_HMAC_FIELDS
exports.TRANSACTION_HMAC_FIELDS = TRANSACTION_HMAC_FIELDS
exports.TOKEN_HMAC_FIELDS = TOKEN_HMAC_FIELDS
exports.RESPONSE_HMAC_FIELDS = RESPONSE_HMAC_FIELDS
