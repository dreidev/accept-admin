# Accept Admin

Package for managing inegration with the accept payment service provided by
paymobsolutions for lack of an offical one.

## Getting Started

```sh
npm install accept-admin
```

Include your paymob accept credentials in a gitingnored `.env` or configuration
file

```js
const ACCEPT_CREDENTIALS: {
  username: process.env.ACCEPT_USERNAME,
  password: process.env.ACCEPT_PASSWORD,
  hmac_secret: process.env.ACCEPT_HMAC_SECRET,
  integration_id: process.env.ACCEPT_INTEGRATION_ID ,
},
```

Import the accept admin instance and configure it

```js
import AcceptAdmin from "accept-admin"

AcceptAdmin.configure(ACCEPT_CREDENTIALS)

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

see tests for other available functions

This package has partial coverage of the accept admin API but is mainly meant
for manging payment and an tokanization of credit cards.
