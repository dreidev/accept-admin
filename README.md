# Accept Admin

Package for managing inegration with the accept payment service provided by
paymobsolutions for lack of an offical one.

## Getting Started

```sh
npm install accept-admin
```

Include your paymob accept credentials in a gitingnored `.env` or configuration
file

```json
// config.json
{
  "credentials": {
    "username": process.env.ACCEPT_USERNAME,
    "password": process.env.ACCEPT_PASSWORD,
    "expiration": 36000
  },
  "hmac_secret": process.env.ACCEPT_HMAC_SECRET,
  "integration_id": process.env.ACCEPT_INTEGRATION_ID,
  "host": "https://example.com/api",
  "notification_callback_url": "accept/notification",
  "response_callback_url": "accept/response"
}
```

Import the accept admin instance and configure it

```js
import AcceptAdmin from "accept-admin"

AcceptAdmin.configure(ACCEPT_CONFIG)

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
const { AcceptRouter } = require("accept-admin/express_router")

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
const AcceptAdmin = require("./accept-admin")
const ACCEPT_CONFIG = require("./config")

AcceptAdmin.config(ACCEPT_CONFIG)

(async () => {
  await AcceptAdmin.init() // get auth_token and set integration callback hooks like in config
  app.listend(process.env.PORT, ()=> console.log("server started"))
})()
```

See tests for the rest of the available functions, like tokenization, refunding and voiding transactions

This package has partial coverage of the accept admin API but is mainly meant
for manging payment and an tokanization of credit cards.

The package is maintianed by DREIDEV and is not an offical paymobsolutions/accept package

Licence MIT
