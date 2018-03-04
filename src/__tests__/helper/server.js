const { server, router } = require("./app")
const { AcceptRouter } = require("../../express_router")
const ACCEPT_CONFIG = require("../../../config")
router.use(
  AcceptRouter({
    hmac_secret: ACCEPT_CONFIG.hmac_secret,
    onNotification(req) {
      console.log("Notification", req.body)
    },
    onResponse(req) {
      console.log("Response", req.query)
      return { message: "success" }
    },
  })
)

server.listen(process.env.PORT, () => {
  console.log(`started server on port ${process.env.PORT}`)
  process.send && process.send("started")
})
