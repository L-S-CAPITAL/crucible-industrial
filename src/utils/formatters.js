export function formatAUD(val) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(val || 0)
}

export function formatTonnes(val, decimals = 2) {
  return `${Number(val).toFixed(decimals)} t`
}

export function formatPercent(val, decimals = 0) {
  return `${Number(val).toFixed(decimals)}%`
}
