import { CurrencyRate, CoingeckoResponse } from './types'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

// Main currencies will always be shown in the first column
const MAIN_CURRENCIES = [
  { code: 'usd', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'eur', flag: '🇪🇺', name: 'Euro' },
  { code: 'jpy', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'gbp', flag: '🇬🇧', name: 'British Pound' },
  { code: 'cny', flag: '🇨🇳', name: 'Chinese Yuan' },
  { code: 'chf', flag: '🇨🇭', name: 'Swiss Franc' },
  { code: 'cad', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'aud', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'nzd', flag: '🇳🇿', name: 'New Zealand Dollar' },
  { code: 'sgd', flag: '🇸🇬', name: 'Singapore Dollar' },
]

const CURRENCY_META: Record<string, { flag: string; name: string }> = {
  // Americas
  usd: { flag: '🇺🇸', name: 'US Dollar' },
  cad: { flag: '🇨🇦', name: 'Canadian Dollar' },
  mxn: { flag: '🇲🇽', name: 'Mexican Peso' },
  brl: { flag: '🇧🇷', name: 'Brazilian Real' },
  ars: { flag: '🇦🇷', name: 'Argentine Peso' },
  clp: { flag: '🇨🇱', name: 'Chilean Peso' },
  bmd: { flag: '🇧🇲', name: 'Bermudian Dollar' },
  vef: { flag: '🇻🇪', name: 'Venezuelan Bolívar' },

  // Europe
  eur: { flag: '🇪🇺', name: 'Euro' },
  gbp: { flag: '🇬🇧', name: 'British Pound' },
  chf: { flag: '🇨🇭', name: 'Swiss Franc' },
  nok: { flag: '🇳🇴', name: 'Norwegian Krone' },
  sek: { flag: '🇸🇪', name: 'Swedish Krona' },
  dkk: { flag: '🇩🇰', name: 'Danish Krone' },
  pln: { flag: '🇵🇱', name: 'Polish Złoty' },
  czk: { flag: '🇨🇿', name: 'Czech Koruna' },
  huf: { flag: '🇭🇺', name: 'Hungarian Forint' },
  uah: { flag: '🇺🇦', name: 'Ukrainian Hryvnia' },

  // Asia & Pacific
  jpy: { flag: '🇯🇵', name: 'Japanese Yen' },
  cny: { flag: '🇨🇳', name: 'Chinese Yuan' },
  hkd: { flag: '🇭🇰', name: 'Hong Kong Dollar' },
  krw: { flag: '🇰🇷', name: 'South Korean Won' },
  inr: { flag: '🇮🇳', name: 'Indian Rupee' },
  twd: { flag: '🇹🇼', name: 'New Taiwan Dollar' },
  sgd: { flag: '🇸🇬', name: 'Singapore Dollar' },
  idr: { flag: '🇮🇩', name: 'Indonesian Rupiah' },
  myr: { flag: '🇲🇾', name: 'Malaysian Ringgit' },
  thb: { flag: '🇹🇭', name: 'Thai Baht' },
  vnd: { flag: '🇻🇳', name: 'Vietnamese Dong' },
  php: { flag: '🇵🇭', name: 'Philippine Peso' },
  pkr: { flag: '🇵🇰', name: 'Pakistani Rupee' },
  bdt: { flag: '🇧🇩', name: 'Bangladeshi Taka' },
  nzd: { flag: '🇳🇿', name: 'New Zealand Dollar' },
  aud: { flag: '🇦🇺', name: 'Australian Dollar' },
  lkr: { flag: '🇱🇰', name: 'Sri Lankan Rupee' },
  mmk: { flag: '🇲🇲', name: 'Myanmar Kyat' },

  // Middle East & Africa
  aed: { flag: '🇦🇪', name: 'UAE Dirham' },
  sar: { flag: '🇸🇦', name: 'Saudi Riyal' },
  ils: { flag: '🇮🇱', name: 'Israeli New Shekel' },
  try: { flag: '🇹🇷', name: 'Turkish Lira' },
  zar: { flag: '🇿🇦', name: 'South African Rand' },
  bhd: { flag: '🇧🇭', name: 'Bahraini Dinar' },
  kwd: { flag: '🇰🇼', name: 'Kuwaiti Dinar' },
  ngn: { flag: '🇳🇬', name: 'Nigerian Naira' },
  gel: { flag: '🇬🇪', name: 'Georgian Lari' },
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
  }).filter(rate => !isNaN(rate.satsPerUnit))

  const mainCurrencies = MAIN_CURRENCIES.map(main => 
    allRates.find(rate => rate.code === main.code)!
  )

  const parityAchieved = allRates
    .filter(rate => rate.satParity)
    .sort((a, b) => a.satsPerUnit - b.satsPerUnit)

  const nearestToParity = allRates
    .filter(rate => !rate.satParity && !MAIN_CURRENCIES.find(m => m.code === rate.code))
    .sort((a, b) => a.satsPerUnit - b.satsPerUnit)
    .slice(0, 10)

  return {
    mainCurrencies,
    parityAchieved,
    nearestToParity
  }
} 