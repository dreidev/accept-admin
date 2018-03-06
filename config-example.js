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
}
