import { BASE_URL } from "src/constants"

export default [
  {
    method: "put",
    url: `${BASE_URL}/ecommerce/integrations/:integration_id?token`,
    response: (req, res) => {
      return res.status(200).body({})
    },
  },
  {
    method: "get",
    url: `${BASE_URL}/ecommerce/integrations/:integration_id?token`,
    response: (req, res) => {
      return res.status(200).body({})
    },
  },
  {
    method: "post",
    url: `${BASE_URL}/auth/tokens`,
    response: (req, res) => {
      return res.status(200).body({ profile: { token: "blablabla" } })
    },
  },
  {
    method: "post",
    url: `${BASE_URL}/acceptance/void_refund/void?token`,
    response: (req, res) => {
      return res.status(200).body({})
    },
  },
  {
    method: "post",
    url: `${BASE_URL}/acceptance/void_refund/refund?token`,
    response: (req, res) => {
      return res.status(200).body({})
    },
  },
  {
    method: "post",
    url: `${BASE_URL}/acceptance/payments/pay`,
    response: (req, res) => {
      return res.status(200).body({})
    },
  },
  {
    method: "post",
    url: `${BASE_URL}/acceptance/tokenization?payment_token`,
    response: (req, res) => {
      return res.status(200).body({
        id: 10,
        token: "d20d94...8000687835c3f1a9da9",
        masked_pan: "xxxx-xxxx-xxxx-2346",
        merchant_id: 1,
        card_subtype: "MasterCard",
        created_at: "2016-12-26T06:49:18.017207Z",
        email: "test@email.com",
        order_id: "55",
      })
    },
  },
  {
    method: "post",
    url: `${BASE_URL}/acceptance/payment_keys?token`,
    response: (req, res) => {
      return res.status(200).body({})
    },
  },
]
