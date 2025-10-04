const PayCoin = {
  SOL: 'SOL',
  USDT: 'USDT',
} as const

type PayCoin = (typeof PayCoin)[keyof typeof PayCoin]

export { PayCoin }
export type { PayCoin }
