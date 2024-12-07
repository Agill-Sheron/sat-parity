import { CurrencyRate, CoingeckoResponse } from './types'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

const TOP_CURRENCIES = [
  { code: 'usd', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'eur', flag: '🇪🇺', name: 'Euro' },
  { code: 'jpy', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'gbp', flag: '🇬🇧', name: 'British Pound' },
  { code: 'aud', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'cad', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'chf', flag: '🇨🇭', name: 'Swiss Franc' },
  { code: 'cny', flag: '🇨🇳', name: 'Chinese Yuan' },
  { code: 'inr', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'krw', flag: '🇰🇷', name: 'South Korean Won' },
]

const SATS_PER_BTC = 100_000_000

export async function getCurrencyRates(): Promise<CurrencyRate[]> {
  const currencies = TOP_CURRENCIES.map(c => c.code).join(',')
  const response = await fetch(
    `${COINGECKO_API_URL}/simple/price?ids=bitcoin&vs_currencies=${currencies}&include_24hr_change=true`
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch currency rates')
  }

  const data: CoingeckoResponse = await response.json()
  
  return TOP_CURRENCIES.map(currency => {
    const btcRate = data.bitcoin[currency.code]
    const satsPerUnit = SATS_PER_BTC / btcRate
    const change24h = data.bitcoin[`${currency.code}_24h_change`] || 0
    
    return {
      ...currency,
      satsPerUnit,
      satParity: satsPerUnit <= 1,
      change24h: -change24h
    }
  })
} 