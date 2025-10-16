import * as dns from 'dns'

// Resolve MX with a more robust strategy suitable for containers and production
async function checkMx(domain: string): Promise<boolean> {
  // Allow disabling MX checks via environment variable
  if (process.env.MX_CHECK_DISABLE === 'true') return true

  // Common public resolvers - avoids issues with Docker's internal DNS
  const resolversEnv = process.env.MX_CHECK_DNS_SERVERS || '8.8.8.8,1.1.1.1'
  const resolver = new dns.Resolver()
  resolver.setServers(resolversEnv.split(',').map((s) => s.trim()).filter(Boolean))

  // Helper with timeout to avoid hanging
  const withTimeout = <T>(p: Promise<T>, ms = 2000): Promise<T> =>
    new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('dns-timeout')), ms)
      p.then((v) => {
        clearTimeout(t)
        resolve(v)
      }).catch((e) => {
        clearTimeout(t)
        reject(e)
      })
    })

  try {
    const records = await withTimeout(
      new Promise<dns.MxRecord[]>((resolve, reject) => {
        resolver.resolveMx(domain, (err, addresses) => {
          if (err) reject(err)
          else resolve(addresses || [])
        })
      })
    )
    if (records.length > 0) return true
  } catch (_) {
    // fall through to fallback
  }

  // Fallback: if the domain itself resolves (A/AAAA), assume valid mail server configuration
  try {
    const lookup = await withTimeout(
      new Promise<dns.LookupAddress[]>((resolve, reject) => {
        dns.lookup(domain, { all: true }, (err, addresses) => {
          if (err) reject(err)
          else resolve(addresses || [])
        })
      })
    )
    if (lookup.length > 0) return true
  } catch (_) {
    // ignore
  }

  // As a last resort, allow-list popular email providers to prevent false negatives
  const allowList = (process.env.MX_CHECK_ALLOWLIST || 'gmail.com,outlook.com,hotmail.com,live.com,icloud.com,yahoo.com,proton.me,protonmail.com').split(',')
    .map((d) => d.trim().toLowerCase()).filter(Boolean)
  if (allowList.includes(domain.toLowerCase())) return true

  return false
}

export { checkMx }
