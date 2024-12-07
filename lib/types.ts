export interface CurrencyRate {
  code: string
  flag: string
  name: string
  satsPerUnit: number
  satParity: boolean
  change24h: number
}

export interface CoingeckoResponse {
  bitcoin: {
    [key: string]: number
  }
} 