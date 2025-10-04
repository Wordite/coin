import crypto from 'crypto'

function fingerprintKey(fp: string, ip: string, ua: string) {
  const s = `${fp}||${ip || ''}||${ua || ''}`
  return crypto.createHash('sha256').update(s).digest('hex')
}

export { fingerprintKey }