export const BASE_URL = "https://accept.paymobsolutions.com/api"
export const NOTIFICATION_CALLBACK_URL = "/accept/notification"
export const RESPONSE_CALLBACK_URL = "/accept/response"
export const DEFAULT_TOKEN_EXPIRATION_TIME = 36000 // 36000 is one hour
export const DEFAULT_CREDENTIALS = {
  username: null,
  password: null,
  expiration: "" + DEFAULT_TOKEN_EXPIRATION_TIME,
}
export const DEFAULT_INTEGRATION = {
  host: "https://example.com/api",
  notification_callback_url: NOTIFICATION_CALLBACK_URL,
  response_callback_url: RESPONSE_CALLBACK_URL,
  id: null,
}
export const DEFAULT_SHIPPING_DATA = {
  email: "john.doe@example.com",
  first_name: "John",
  last_name: "Doe",
  street: "Falaki",
  building: "4",
  floor: "4",
  apartment: "404",
  city: "Cairo",
  state: "Cairo",
  country: "Egypt",
  phone_number: "00201234567890",
  postal_code: "12345",
}
export const MASTER_CARD = {
  identifier: "5123456789012346",
  sourceholder_name: "Test Account",
  expiry_month: "05",
  expiry_year: "21",
  cvn: "123",
}
export const FALSE_CARD = {
  identifier: "5123456789012346",
  sourceholder_name: "False Account",
  expiry_month: "01",
  expiry_year: "22",
  cvn: "123",
}
export const VISA_CARD = {
  identifier: "4987654321098769",
  sourceholder_name: "Test Account",
  expiry_month: "05",
  expiry_year: "21",
  cvn: "123",
}
