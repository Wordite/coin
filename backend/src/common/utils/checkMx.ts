import * as dns from 'dns'

async function checkMx(domain: string): Promise<boolean> {
  return new Promise((resolve) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err || addresses.length === 0) resolve(false)
      else resolve(true)
    })
  })
}

export { checkMx }
