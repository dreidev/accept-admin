// import MockAdapter from "axios-mock-adapter"

export let mock

export function removeAPIMock() {
  mock.restore()
}
export function mockAllAPIs(mock) {
  api_mocks.forEach(({ method, url, response }) => {
    method =
      "on" +
      method.toLowerCase()[0].toUpperCase() +
      method.toLowerCase().substr(1)
    mock[method](url).reply(response)
  })
}
const api_mocks = [
  {
    method: "put",
    url: /\/ecommerce\/integrations/,
    response: (req, res) => {
      // req.body()
      return [
        200,
        {
          transaction_processed_callback: `https://example.com/api/accept/notification`,
          transaction_response_callback: `https://example.com/api/accept/response`,
        },
      ]
    },
  },
  {
    method: "post",
    url: /\/ecommerce\/integrations/,
    response: (req, res) => {
      // req.body()
      return [
        200,
        {
          currency: "EGP",
          gateway_type: "VPC", // for creditcard and UIG for WAllet
          transaction_processed_callback: `https://example.com/api/accept/notification`,
          transaction_response_callback: `https://example.com/api/accept/response`,
        },
      ]
    },
  },
  {
    method: "get",
    url: /\/ecommerce\/integrations/,
    response: (req, res) => {
      // req.body()
      return [
        200,
        {
          is_live: false,
          host: null,
          created_at: "2017-04-25T13:26:41.485953",
          gateway_type: "VPC",
          transaction_processed_callback:
            "https://example.com/api/accept/notification",
          transaction_response_callback:
            "https://example.com/api/accept/response",
          is_deprecated: false,
          id: 68,
          merchant_id: 1,
          currency: "EGP",
        },
      ]
    },
  },
  {
    method: "get",
    url: /\/acceptance\/iframes\/\d{1,5}\?payment_token/,
    response: (req, res) => {
      // req.body()
      return [200, "HTML Content"]
    },
  },
  {
    method: "delete",
    url: /\/acceptance\/iframes\/\d{1,5}/,
    response: (req, res) => {
      // req.body()
      return [200, {}]
    },
  },
  {
    method: "put",
    url: /\/acceptance\/iframes\/\d{1,5}/,
    response: (req, res) => {
      // req.body()
      return [
        200,
        {
          id: 1,
          html_content: "",
          css_content: "",
          javascript_content: "",
          name: "",
          description: "",
        },
      ]
    },
  },
  {
    method: "post",
    url: /\/acceptance\/iframes/,
    response: (req, res) => {
      // req.body()
      return [
        200,
        [
          {
            id: 1,
            html_content: "",
            css_content: "",
            javascript_content: "",
            name: "",
            description: "",
          },
        ],
      ]
    },
  },
  {
    method: "post",
    url: /\/auth\/tokens/,
    response: (req, res) => {
      return [200, { profile: { token: "blablabla" } }]
    },
  },
  {
    method: "post",
    url: /\/acceptance\/void_refund\/void/,
    response: (req, res) => {
      // req.body()
      return [200, {}]
    },
  },
  {
    method: "post",
    url: /\/acceptance\/void_refund\/refund/,
    response: (req, res) => {
      // req.body()
      return [200, {}]
    },
  },
  {
    method: "post",
    url: /\/acceptance\/payments\/pay/,
    response: (req, res) => {
      return [
        200,
        {
          id: 49991,
          pending: "false",
          amount_cents: 300,
          success: "true",
          is_auth: "false",
          is_capture: "false",
          is_standalone_payment: "true",
          is_voided: "false",
          is_refunded: "false",
          is_3d_secure: "false",
          integration_id: 68,
          profile_id: 68,
          has_parent_transaction: "false",
          order: 91002,
          created_at: "2017-11-29T10:16:04.378703",
          currency: "EGP",
          is_void: "false",
          is_refund: "false",
          error_occured: "false",
          refunded_amount_cents: 0,
          captured_amount: 0,
          owner: 76,
          parent_transaction: "",
          "data.message": "Approved",
          "source_data.type": "card",
          "source_data.pan": "2346",
          "source_data.sub_type": "MasterCard",
          hmac:
            "9323277ab3c64b12c16fc281a4773d1e43fca2e97a64e576aff40f53620887e1401d42af725fa1382c085432615405ed21b6f3412e4540c7e6a290c4800612a4",
          use_redirection: false,
          redirection_url: "ok",
          merchant_response:
            '<!doctype html>\n<html>\n<head>\n    <title>Example Domain</title>\n\n    <meta charset="utf-8" />\n    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <styletype="text/css">\n    body {\n        background-color: #f0f0f2;\n        margin: 0;\n        padding: 0;\n        font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;\n        \n    }\n    div {\n        width: 600px;\n        margin: 5em auto;\n        padding: 50px;\n        background-color: #fff;\n        border-radius: 1em;\n    }\n    a:link, a:visited {\n        color: #38488f;\n        text-decoration: none;\n    }\n    @media (max-width: 700px) {\n        body {\n            background-color: #fff;\n        }\n        div {\n            width: auto;\n            margin: 0 auto;\n            border-radius: 0;\n            padding: 1em;\n        }\n    }\n    </style>    \n</head>\n\n<body>\n<div>\n    <h1>Example Domain</h1>\n    <p>This domain is established to be used for illustrative examples in documents. You may use this\n    domain in examples without prior coordination or asking for permission.</p>\n    <p><a href="http://www.iana.org/domains/example">Moreinformation...</a></p>\n</div>\n</body>\n</html>\n',
          bypass_step_six: false,
        },
      ]
    },
  },
  {
    method: "post",
    url: /\/acceptance\/tokenization/,
    response: (req, res) => {
      return [
        200,
        {
          id: 10,
          token: "d20d94...8000687835c3f1a9da9",
          masked_pan: "xxxx-xxxx-xxxx-2346",
          merchant_id: 1,
          card_subtype: "MasterCard",
          created_at: "2016-12-26T06:49:18.017207Z",
          email: "test@email.com",
          order_id: "55",
        },
      ]
    },
  },
  {
    method: "post",
    url: /\/acceptance\/payment_keys/,
    response: (req, res) => {
      // req.body()
      return [
        200,
        {
          token:
            "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnZjbVJsY2w5cFpDSTZPRGs1TkRVc0luTm9hWEJ3YVc1blgyUmhkR0VpT25zaVptbHljM1JmYm1GdFpTSTZJa3B2YUc0aUxDSnNZWE4wWDI1aGJXVWlPaUpFYjJVaUxDSnpkSEpsWlhRaU9pSkdZV3hoYTJraUxDSmlkV2xzWkdsdVp5STZJalFpTENKbWJHOXZjaUk2SWpRaUxDSmhjR0Z5ZEcxbGJuUWlPaUkwTURRaUxDSmphWFI1SWpvaVEyRnBjbThpTENKemRHRjBaU0k2SWtOaGFYSnZJaXdpWTI5MWJuUnllU0k2SWtWbmVYQjBJaXdpWlcxaGFXd2lPaUpxYjJodUxtUnZaVUJsZUdGdGNHeGxMbU52YlNJc0luQm9iMjVsWDI1MWJXSmxjaUk2SWpBd01qQXhNak0wTlRZM09Ea3dJaXdpY0c5emRHRnNYMk52WkdVaU9pSXhNak0wTlNJc0ltVjRkSEpoWDJSbGMyTnlhWEIwYVc5dUlqb2lJQ0lzSW5Ob2FYQndhVzVuWDIxbGRHaHZaQ0k2SWxWT1N5SjlMQ0poYlc5MWJuUmZZMlZ1ZEhNaU9qRXdNQ3dpWTNWeWNtVnVZM2tpT2lKRlIxQWlMQ0pqWVhKa1gybHVkR1ZuY21GMGFXOXVYMmxrSWpvMk9Dd2laWGh3SWpveE5URXhPREkxTVRjeExDSjFjMlZ5WDJsa0lqbzNObjAuYjBQVjEyd2hSX1UxQmpSYjVqVkRKc1NzMDNnRWd1VURnamwtemluVWxoaG9GdE5keDVlTkpfOHAzNDk3bGM3N3Y1dDdKLWhZN1Awdjg3amlZY2k5dUE=",
        },
      ]
    },
  },
  {
    method: "post",
    url: /\/ecommerce\/orders/,
    response: (req, res) => {
      // req.body()
      return [
        200,
        {
          id: 200202,
          created_at: "2017-11-22T13:49:07.811088",
          delivery_needed: false,
          merchant: {
            id: 1,
            created_at: "2017-03-20T17:46:41.345323",
            phones: [],
            company_emails: [],
            company_name: "Example",
            state: "cairo",
            country: "egypt",
            city: "cairo",
            postal_code: "123456",
            street: "cairo",
          },
          collector: null,
          amount_cents: 100,
          shipping_data: {
            id: 60644,
            first_name: "First",
            last_name: "Name",
            street: "Place",
            building: "1",
            floor: "1",
            apartment: "1",
            city: "Cairo",
            state: "Cairo",
            country: "EGYPT",
            email: "some@mail.com",
            phone_number: "+201000000002",
            postal_code: "12345",
            extra_description: " ",
            shipping_method: "PKG",
            order_id: 87478,
            order: 87478,
          },
          currency: "EGP",
          is_payment_locked: false,
          merchant_order_id: null,
          wallet_notification: null,
          paid_amount_cents: 100,
          notify_user_with_email: false,
          items: [],
          order_url: "https://accept.paymobsolutions.com/invoice?token=",
          commission_fees: 0,
          delivery_fees: 0,
        },
      ]
    },
  },
]
export default api_mocks
