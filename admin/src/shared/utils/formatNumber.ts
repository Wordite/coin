/**
 * Безопасное форматирование чисел с защитой от null/undefined
 */
export const formatNumber = (
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
  locale: string = 'en-US'
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0'
  }
  
  try {
    return value.toLocaleString(locale, options)
  } catch (error) {
    console.warn('Error formatting number:', error)
    return String(value)
  }
}

/**
 * Безопасное форматирование валюты
 */
export const formatCurrency = (
  value: number | null | undefined,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return formatNumber(value, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }, locale)
}

/**
 * Безопасное форматирование процентов
 */
export const formatPercentage = (
  value: number | null | undefined,
  locale: string = 'en-US'
): string => {
  return formatNumber(value, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }, locale)
}
