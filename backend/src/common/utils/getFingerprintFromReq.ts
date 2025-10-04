import { fingerprintKey } from "./fingerprint"
import { Request } from "express"


const getFingerprintFromReq = (req: Request, fingerprint: string) => {
    const ip = req.ip || 'unknown'
    const ua = req.get('user-agent') || 'unknown'
    const key = fingerprintKey(fingerprint, ip, ua)
    return key
}

export default getFingerprintFromReq