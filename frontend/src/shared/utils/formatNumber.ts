/**
 * Formats a number to a specified number of decimal places
 * Avoids floating point precision issues
 */
export const formatNumber = (value: number, decimals: number = 6): string => {
  if (isNaN(value) || !isFinite(value)) return '0'
  
  // Use toFixed to avoid floating point precision issues
  const formatted = value.toFixed(decimals)
  
  // Remove trailing zeros
  return parseFloat(formatted).toString()
}

/**
 * Formats a number with proper decimal places for display
 */
export const formatDisplayNumber = (value: number, decimals: number = 6): string => {
  if (isNaN(value) || !isFinite(value)) return '0'
  
  // Use toFixed to avoid floating point precision issues
  return value.toFixed(decimals)
}

/**
 * Calculates receive amount with proper precision
 */
export const calculateReceive = (
  payAmount: number, 
  rate: number, 
  decimals: number = 6
): number => {
  if (isNaN(payAmount) || isNaN(rate) || payAmount <= 0 || rate <= 0) return 0
  
  // Multiply and round to avoid floating point issues
  const result = payAmount * rate
  
  // Round to the specified decimal places
  const multiplier = Math.pow(10, decimals)
  return Math.round(result * multiplier) / multiplier
}
