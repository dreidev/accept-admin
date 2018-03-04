// import { startTunnel, closeTunnel } from "./helper/localtunnel"
// import { startServer, closeServer, router } from "./helper/server"

import request from "supertest"

import ACCEPT_CONFIG from "../../config"
import { AcceptRouter } from "../express_router"
import { app, router } from "./helper/app"

import Hmac512 from "crypto-js/hmac-sha512"
import { RESPONSE_HMAC_FIELDS_DATA } from "./helper/hmac_fields_data"
import { RESPONSE_HMAC_FIELDS, TOKEN_HMAC_FIELDS } from "../hmac_authorization"

describe("configure router", () => {
  const hmac_secret = ACCEPT_CONFIG.hmac_secret

  const notificationData = TOKEN_HMAC_FIELDS.reduce(
    (m, field) => ({ ...m, [field]: field }),
    {}
  )
  const notificationHmac = Hmac512(
    TOKEN_HMAC_FIELDS.join(""),
    hmac_secret
  ).toString()

  let responseQuery = RESPONSE_HMAC_FIELDS_DATA
  const responseHmac = Hmac512(
    RESPONSE_HMAC_FIELDS.map(() => 1).join(""),
    hmac_secret
  ).toString()
  responseQuery.hmac = responseHmac

  router.use(
    AcceptRouter({
      hmac_secret,
      onNotification(req) {
        expect(req.body.type).toEqual("TOKEN")
        expect(req.body.obj).toEqual(notificationData)
      },
      onResponse(req) {
        expect(Object.keys(req.query)).toEqual(Object.keys(responseQuery))
      },
    })
  )

  test("router should trigger 401 on response hook if hmac does not match", () => {
    return request(app)
      .get("/accept/response")
      .query({ hmac: "not a thing" })
      .expect(401)
  })

  test("router should trigger response hook", () => {
    return request(app)
      .get("/accept/response")
      .query(responseQuery)
      .expect(200)
  })

  test("router should trigger 401 on notification hook if hmac does not match", () => {
    return request(app)
      .post("/accept/notification")
      .query({ hmac: "not a thing" })
      .send({ type: "TOKEN", obj: {} })
      .expect(401)
  })

  test("router should trigger notification hook", () => {
    return request(app)
      .post("/accept/notification")
      .query({ hmac: notificationHmac })
      .send({ type: "TOKEN", obj: notificationData })
      .expect(200)
  })
})
