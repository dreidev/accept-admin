require("dotenv").config()

module.exports = {
  credentials: {
    username: process.env.ACCEPT_USERNAME,
    password: process.env.ACCEPT_PASSWORD,
    expiration: 36000,
  },
  hmac_secret: process.env.ACCEPT_HMAC_SECRET,
  integration_id: process.env.ACCEPT_INTEGRATION_ID,
  host: "https://example.com/api",
  notification_callback_url: "/accept/notification",
  response_callback_url: "/accept/response",
  REAL_CARD: {
    identifier: process.env.REAL_CARD_IDENTIFIER,
    sourceholder_name: process.env.REAL_CARD_NAME,
    expiry_month: process.env.REAL_CARD_EXPIERY_MONTH,
    expiry_year: process.env.REAL_CARD_EXPIERY_YEAR,
    cvn: process.env.REAL_CARD_CVV,
  },
}