const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")

const router = express.Router()
const app = express()
const server = require("http").createServer(app)

exports.router = router
exports.server = server
exports.app = app

const { NODE_ENV } = process.env

app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"))
app.use(morgan("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(router)

app.use(function(req, res, next) {
  var err = new Error("Not Found")
  err.status = 404
  next(err)
})

app.use(function(err, req, res, next) {
  console.log(err)
  res.status(err.status || 500)
  res.send(
    err.data || {
      message: err.message,
      error: err,
    }
  )
})
