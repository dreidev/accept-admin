import AcceptAdmin from "./index"
import { Router } from "express"

export const DEFAULT_NOTIFICATION_ENDPOINT = `/api/accept/notification`
export const DEFAULT_RESPONSE_ENDPOINT = `/api/accept/response`
const DEFAULT_ACTION = async () => {}

let onTransactionProcessNotification = DEFAULT_ACTION
let onTransactionResponse = DEFAULT_ACTION

export const router = Router()
export let host

export default function ConfigureAcceptRouter({
  host,
  notificationEndpoint = DEFAULT_NOTIFICATION_ENDPOINT,
  responseEndpoint = DEFAULT_RESPONSE_ENDPOINT,
  onNotification,
  onResponse,
  ...config
}) {
  const Accept = config.AcceptInstance || AcceptAdmin
  config.AcceptInstance = Accept

  Accept.config(config)

  // this is an async process but we won't have it block the configuration
  setTransactionCallbackHooks({
    host,
    notificationEndpoint,
    responseEndpoint,
    Accept,
  })

  setOnNotification(onNotification)
  setOnResponse(onResponse)

  configureRouter({
    notificationEndpoint,
    responseEndpoint,
  })

  return router
}

function configureRouter({ notificationEndpoint, responseEndpoint }) {
  router.post(
    notificationEndpoint,
    hasMatchingNotificationHookHmac,
    hookWrapper(onTransactionProcessNotification)
  )
  router.get(
    responseEndpoint,
    hasMatchingResponseHookHmac,
    hookWrapper(onTransactionResponse)
  )
}

export async function setTransactionCallbackHooks({
  host,
  notificationEndpoint,
  responseEndpoint,
  Accept,
}) {
  if (host) {
    Accept.setIntegrationHooks({
      integration: {
        transaction_processed_callback: host + notificationEndpoint,
        transaction_response_callback: host + responseEndpoint,
      },
    })
      .then(() => {
        console.log("AcceptAdmin: callback hooks were set")
      })
      .catch(error => {
        console.log("AcceptAdmin: Error Occured while setting callbacks")
        console.log(error)
      })
  } else {
    console.warn(
      "AcceptAdmin: Transaction Callback hooks were not set as no host was provided"
    )
  }
}

export function setOnNotification(action) {
  onTransactionProcessNotification = action
}
export function setOnResponse(action) {
  onTransactionResponse = action
}

export function hasMatchingNotificationHookHmac(req, res, next) {
  const Autherize = {
    TRANSACTION: AcceptAdmin.authorizeTransaction,
    TOKEN: AcceptAdmin.authorizeToken,
    DELIVERY_STATUS: AcceptAdmin.authorizeDeliveryStatus,
  }
  if (Autherize[req.body.type]({ hmac: req.query.hmac, data: req.body.obj })) {
    next()
  } else {
    res.status(401)
    next({ status: 401, message: "Unauthorized" })
  }
}

export function hasMatchingResponseHookHmac(req, res, next) {
  if (
    AcceptAdmin.authorizeResponse({ hmac: req.query.hmac, data: req.query })
  ) {
    next()
  } else {
    res.status(401)
    next({ status: 401, message: "Unauthorized" })
  }
}

export function hookWrapper(customAction) {
  return async (req, res, next) => {
    try {
      const response = await customAction(req)
      res.status(200).send(response)
    } catch (error) {
      next(error)
    }
  }
}
