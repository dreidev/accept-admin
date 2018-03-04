import cp from "child_process"

let server

export const startServer = ({ PORT, NODE_ENV = "test", silent = false }) => {
  server = cp.fork(`${__dirname}/server.js`, {
    env: {
      PORT,
      NODE_ENV,
    },
    silent,
  })

  return new Promise((resolve, reject) => {
    server.on("message", (m, obj) => {
      if (m === "started") {
        resolve(server)
      }
    })
    // server.stdout.on("data", data => console.log(data.toString()))
    // server.stderr.on("data", data => {
    //   console.log(data.toString())
    //   reject(data.toString())
    // })
  })
}

export const closeServer = () => server.kill("SIGHUP")
