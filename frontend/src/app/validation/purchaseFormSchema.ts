import * as yup from 'yup'

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })
}

export const createPurchaseFormSchema = (
  minBuyAmount: number = 0.001,
  maxBuyAmount: number = 1000000
) => {
  return yup.object({
    payCoin: yup.string().required('Please select a payment coin'),
    pay: yup
      .number()
      .typeError('Must be a number')
      .required('Payment amount is required')
      .test('is-number', 'Amount must be a number', (value) => {
        if (!value) return false
        const num = value
        return !isNaN(num) && num > 0
      }),
    receive: yup
      .number()
      .typeError('Must be a number')
      .required('Receive amount is required')
      .test('min-amount', `Minimum amount is ${formatNumber(minBuyAmount)}`, (value) => {
        if (value === undefined || value === null) return false
        console.log('value', value)
        const num = value
        return num >= minBuyAmount
      })
      .test('max-amount', `Maximum amount is ${formatNumber(maxBuyAmount)}`, (value) => {
        if (value === undefined || value === null) return false
        const num = value
        return num <= maxBuyAmount
      }),
  })
}

export const purchaseFormSchema = createPurchaseFormSchema()

export interface PurchaseFormData {
  payCoin: string
  pay: number
  receive?: number
}
