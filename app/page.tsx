import { getCurrencyRates } from '@/lib/api'
import { ArrowUp, ArrowDown } from 'lucide-react'

export const revalidate = 60 // Revalidate data every minute

export default async function Home() {
  const currencies = await getCurrencyRates()

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <main className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Sat Parity Tracker</h1>
        
        <div className="space-y-4">
          {currencies.map((currency) => (
            <div
              key={currency.code}
              className="p-4 rounded-lg border bg-card dark:bg-card/80"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currency.flag}</span>
                  <div>
                    <p className="font-medium">{currency.name}</p>
                    <p className="text-sm text-muted-foreground uppercase">
                      {currency.code}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <p className="font-mono font-medium">
                      {currency.satsPerUnit.toFixed(2)} sats
                    </p>
                    <span className={`flex items-center ${currency.change24h < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {currency.change24h < 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      <span className="ml-1">{Math.abs(currency.change24h).toFixed(2)}%</span>
                    </span>
                  </div>
                  {currency.satParity && (
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Sat parity achieved! 🎉
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
