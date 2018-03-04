const cp = require("child_process")

export let localtunnel

export function startTunnel(port) {
  localtunnel = cp.spawn("lt", ["--port", port], { shell: true })

  return new Promise((resolve, reject) => {
    localtunnel.stdout.on("data", data => {
      if (/your url is: (.*)\n/.test(data.toString())) {
        resolve(data.toString().match(/your url is: (.*)\n/)[1])
      }
    })
    localtunnel.stderr.on("data", data => {
      console.log(data.toString())
      reject(data.toString())
    })
  })
}

export function closeTunnel() {
  localtunnel.kill("SIGINT")
}
