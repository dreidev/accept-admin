// const cp = require("child_process")
const localtunnel = require("localtunnel")

export let tunnel

export function startTunnel(port, opts) {
  // localtunnel = cp.spawn("lt", ["--port", port], { shell: true })

  return new Promise((resolve, reject) => {
    tunnel = localtunnel(port, opts, (err, tunnel) => {
      if (err) return reject(err)
      resolve(tunnel)
    })
    // localtunnel.stdout.on("data", data => {
    //   if (/your url is: (.*)\n/.test(data.toString())) {
    //     resolve(data.toString().match(/your url is: (.*)\n/)[1])
    //   }
    // })
    // localtunnel.stderr.on("data", data => {
    //   console.log(data.toString())
    //   reject(data.toString())
    // })
  })
}

export function closeTunnel() {
  tunnel.close()
}
