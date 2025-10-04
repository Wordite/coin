import * as bcrypt from 'bcrypt'

export const hash = async (password: string) => {
  return await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS)!)
}

export const compare = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash)
}