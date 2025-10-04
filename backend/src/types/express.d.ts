import { UserPayload } from './user-payload.type'

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload
    }
  }
}
