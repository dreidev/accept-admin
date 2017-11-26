const cp = require("child_process")

let localtunnel

function start(port) {
  localtunnel = cp.spawn("lt", ["--port", port], { shell: true })

  return Promise.all([
    localtunnel,
    new Promise((resolve, reject) => {
      localtunnel.stdout.on("data", data => {
        if (/your url is: (.*)\n/.test(data.toString())) {
          resolve(data.toString().match(/your url is: (.*)\n/)[1])
        }
      })
      localtunnel.stderr.on("data", data => {
        console.log(data.toString())
        reject(data.toString())
      })
    }),
  ])
}

function close() {
  localtunnel.kill()
}

exports.startTunnel = start
exports.closeTunnel = close
