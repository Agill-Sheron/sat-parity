import { CurrencyRate, CoingeckoResponse } from './types'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

// Main currencies will always be shown in the first column
const MAIN_CURRENCIES = [
  { code: 'usd', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'eur', flag: '🇪🇺', name: 'Euro' },
  { code: 'jpy', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'gbp', flag: '🇬🇧', name: 'British Pound' },
  { code: 'cny', flag: '🇨🇳', name: 'Chinese Yuan' },
]

// Currency code to flag and name mapping
const CURRENCY_META: Record<string, { flag: string; name: string }> = {
  usd: { flag: '🇺🇸', name: 'US Dollar' },
  eur: { flag: '🇪🇺', name: 'Euro' },
  jpy: { flag: '🇯🇵', name: 'Japanese Yen' },
  gbp: { flag: '🇬🇧', name: 'British Pound' },
  cny: { flag: '🇨🇳', name: 'Chinese Yuan' },
  aud: { flag: '🇦🇺', name: 'Australian Dollar' },
  cad: { flag: '🇨🇦', name: 'Canadian Dollar' },
  chf: { flag: '🇨🇭', name: 'Swiss Franc' },
  inr: { flag: '🇮🇳', name: 'Indian Rupee' },
  krw: { flag: '🇰🇷', name: 'South Korean Won' },
  brl: { flag: '🇧🇷', name: 'Brazilian Real' },
  rub: { flag: '🇷🇺', name: 'Russian Ruble' },
  try: { flag: '🇹🇷', name: 'Turkish Lira' },
  ngn: { flag: '🇳🇬', name: 'Nigerian Naira' },
  idr: { flag: '🇮🇩', name: 'Indonesian Rupiah' },
  php: { flag: '🇵🇭', name: 'Philippine Peso' },
  mxn: { flag: '🇲🇽', name: 'Mexican Peso' },
  thb: { flag: '🇹🇭', name: 'Thai Baht' },
  vnd: { flag: '🇻🇳', name: 'Vietnamese Dong' },
  pkr: { flag: '🇵🇰', name: 'Pakistani Rupee' },
  egp: { flag: '🇪🇬', name: 'Egyptian Pound' },
  clp: { flag: '🇨🇱', name: 'Chilean Peso' },
  pln: { flag: '🇵🇱', name: 'Polish Złoty' },
  czk: { flag: '🇨🇿', name: 'Czech Koruna' },
  huf: { flag: '🇭🇺', name: 'Hungarian Forint' },
  ils: { flag: '🇮🇱', name: 'Israeli New Shekel' },
  sar: { flag: '🇸🇦', name: 'Saudi Riyal' },
  aed: { flag: '🇦🇪', name: 'UAE Dirham' },
  pen: { flag: '🇵🇪', name: 'Peruvian Sol' },
  cop: { flag: '🇨🇴', name: 'Colombian Peso' },
  myr: { flag: '🇲🇾', name: 'Malaysian Ringgit' },
  zar: { flag: '🇿🇦', name: 'South African Rand' },
  // Add more currencies as needed
}

const SATS_PER_BTC = 100_000_000

export async function getCurrencyRates(): Promise<{
  mainCurrencies: CurrencyRate[]
  parityAchieved: CurrencyRate[]
  nearestToParity: CurrencyRate[]
}> {
  // First, get all supported currencies from CoinGecko
  const response = await fetch(
    `${COINGECKO_API_URL}/simple/supported_vs_currencies`
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch supported currencies')
  }

  const supportedCurrencies: string[] = await response.json()

  // Filter out cryptocurrencies and keep only fiat currencies with metadata
  const fiatCurrencies = supportedCurrencies.filter(code => 
    CURRENCY_META[code] !== undefined
  )

  // Fetch rates for all supported fiat currencies
  const ratesResponse = await fetch(
    `${COINGECKO_API_URL}/simple/price?ids=bitcoin&vs_currencies=${fiatCurrencies.join(',')}&include_24hr_change=true`
  )
  
  if (!ratesResponse.ok) {
    throw new Error('Failed to fetch currency rates')
  }

  const data: CoingeckoResponse = await ratesResponse.json()
  
  const allRates = fiatCurrencies.map(code => {
    const btcRate = data.bitcoin[code]
    const satsPerUnit = SATS_PER_BTC / btcRate
    const change24h = data.bitcoin[`${code}_24h_change`] || 0
    const meta = CURRENCY_META[code]
    
    return {
      code,
      flag: meta.flag,
      name: meta.name,
      satsPerUnit,
      satParity: satsPerUnit <= 1,
      change24h: -change24h
    }
  }).filter(rate => !isNaN(rate.satsPerUnit)) // Filter out any invalid rates

  const mainCurrencies = MAIN_CURRENCIES.map(main => 
    allRates.find(rate => rate.code === main.code)!
  )

  const parityAchieved = allRates
    .filter(rate => rate.satParity)
    .sort((a, b) => a.satsPerUnit - b.satsPerUnit)

  const nearestToParity = allRates
    .filter(rate => !rate.satParity && !MAIN_CURRENCIES.find(m => m.code === rate.code))
    .sort((a, b) => a.satsPerUnit - b.satsPerUnit)
    .slice(0, 10) // Show top 10 closest to parity

  return {
    mainCurrencies,
    parityAchieved,
    nearestToParity
  }
} 