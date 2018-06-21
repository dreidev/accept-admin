# Accept Admin

Package for managing integration with the accept payment service provided by
paymobsolutions for lack of an offical one.

[![Coverage Status](https://coveralls.io/repos/github/dreidev/accept-admin/badge.svg?branch=master)](https://coveralls.io/github/dreidev/accept-admin?branch=master) [![NSP Status](https://nodesecurity.io/orgs/dreidev/projects/7c551c3c-8957-4bcd-b0f5-9ddc5e9173bf/badge)](https://nodesecurity.io/orgs/dreidev/projects/7c551c3c-8957-4bcd-b0f5-9ddc5e9173bf)

## Getting Started

```sh
npm install accept-admin
```

Include your paymob accept credentials in a gitingnored `.env` or configuration file

```js
// config.js
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
```

Import the accept admin instance and configure it

```js
import AcceptAdmin from "accept-admin"
// or in node < 10 you can
// const { Accept } = require("accept-admin")
// const AcceptAdmin = require("accept-admin").default

AcceptAdmin.config(ACCEPT_CONFIG)

//... later in your code

await AcceptAdmin.pay({
  // credentials: ACCEPT_CREDENTIALS, // include if you want to pay having not called configuration prior
  amount: 20,
  source: {
    "identifier": "5123456789012346",
    "sourceholder_name": "Test Account",
    "subtype": "CARD",
    "expiry_month": "05",
    "expiry_year": "21",
    "cvn": "123"
  }
})
```

Package includes a router and middelware functions to deal with Hmac validation

one possible workflow with express

```js
// app.js
const express = require("express")
const { AcceptRouter } = require("accept-admin")
// or
// const { AcceptRouter } = require("accept-admin/lib/express_router")

const app = express()

app.use(AcceptRouter({
  hmac_secret: process.env.ACCEPT_HMAC_SECRET, // or get from a config file
  notificationEndpoint: '/accept/notifaction', // default
  responseEndpoint: '/accept/response', // default
  onNotification(req, res) { // if not set will default to simply responding with 200
    console.log("Notification", req.body)
  },
  onResponse(req, res) { // if not set will default to simply responding with 200
    console.log("Response", req.query)
    return { message: "success" } // instead of res.status(200).send({ message: "success" })
  },
}))
```

and when starting your server

```js
// server.js
const app = require("./app")
const { Accept } = require("./accept-admin")
const ACCEPT_CONFIG = require("./config")

Accept.config(ACCEPT_CONFIG)

(async () => {
  // get auth_token and assign it ot the instance 
  // and set integration callback hooks to
  // integration.host + integration.response_callback_url as configured
  await Accept.init()
  // then start app
  app.listen(process.env.PORT, ()=> console.log("server started"))
})()
```

See tests for the rest of the available functions, like tokenization, refunding and voiding transactions

This package has partial coverage of the accept admin API but is mainly meant
for manging payment and an tokanization of credit cards.

The package is maintianed by DREIDEV and is not an offical paymobsolutions/accept package

Licence MIT
