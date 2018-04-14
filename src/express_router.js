const { Router } = require("express")
const {
  authorizeDeliveryStatus,
  authorizeTransaction,
  authorizeResponse,
  authorizeToken,
} = require("./hmac_authorization")

const DEFAULT_NOTIFICATION_ENDPOINT = `/accept/notification`
const DEFAULT_RESPONSE_ENDPOINT = `/accept/response`

exports.DEFAULT_NOTIFICATION_ENDPOINT = DEFAULT_NOTIFICATION_ENDPOINT
exports.DEFAULT_RESPONSE_ENDPOINT = DEFAULT_RESPONSE_ENDPOINT

const DEFAULT_ACTION = async () => {}

function ConfigureAcceptRouter({
  hmac_secret,
  onResponse,
  onNotification,
  notificationEndpoint = DEFAULT_NOTIFICATION_ENDPOINT,
  responseEndpoint = DEFAULT_RESPONSE_ENDPOINT,
}) {
  const router = Router()

  router.post(
    notificationEndpoint,
    hasMatchingNotificationHookWithHmacSecret(hmac_secret),
    hookWrapper(onNotification)
  )
  router.get(
    responseEndpoint,
    hasMatchingResponseHookWithHmacSecret(hmac_secret),
    hookWrapper(onResponse)
  )

  return router
}

function hasMatchingNotificationHookWithHmacSecret(hmac_secret) {
  if (!hmac_secret)
    throw new Error(
      `You must spicify hmac_secret in order to validate callback hooks got ${
        hmac_secret
      }`
    )
  return function hasMatchingNotificationHookHmac(req, res, next) {
    const Authorize = {
      TRANSACTION: authorizeTransaction,
      TOKEN: authorizeToken,
      DELIVERY_STATUS: authorizeDeliveryStatus,
    }
    if (
      Authorize[req.body.type]({
        hmac_secret,
        hmac: req.query.hmac,
        data: req.body.obj,
      })
    ) {
      next()
    } else {
      res.status(401)
      next({ status: 401, message: "Unauthorized" })
    }
  }
}

function hasMatchingResponseHookWithHmacSecret(hmac_secret) {
  if (!hmac_secret)
    throw new Error(
      `You must spicify hmac_secret in order to validate callback hooks got ${
        hmac_secret
      }`
    )
  return function hasMatchingResponseHookHmac(req, res, next) {
    if (
      authorizeResponse({ hmac_secret, hmac: req.query.hmac, data: req.query })
    ) {
      next()
    } else {
      res.status(401)
      next({ status: 401, message: "Unauthorized" })
    }
  }
}

function hookWrapper(customAction = DEFAULT_ACTION) {
  return async function(req, res, next) {
    try {
      const response = await customAction(req, res)
      if (!res.headersSent) {
        delete req.query.hmac
        res
          .status(200)
          .send(response || req.query.api_source === "IFRAME" ? {} : req.query)
      }
    } catch (error) {
      next(error)
    }
  }
}

exports.AcceptRouter = ConfigureAcceptRouter

exports.hasMatchingNotificationHookWithHmacSecret = hasMatchingNotificationHookWithHmacSecret
exports.hasMatchingResponseHookWithHmacSecret = hasMatchingResponseHookWithHmacSecret
exports.hookWrapper = hookWrapper
