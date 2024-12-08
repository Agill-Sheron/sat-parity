import { getCurrencyRates } from '@/lib/api'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { CurrencyRate } from '@/lib/types'

export const revalidate = 60 // Revalidate data every minute

function CurrencyCard({ currency }: { currency: CurrencyRate }) {
  return (
    <div className="p-4 rounded-lg border bg-card dark:bg-card/80">
      <div className="flex items-start justify-between">
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
          <div className="flex flex-col items-end gap-2">
            <p className="font-mono font-medium">
              {currency.satsPerUnit.toFixed(2)} sats
            </p>

            {/* Since users come from a bitcoin community, we show the change in a positive or negative direction */}
            <span className={`flex items-center ${currency.change24h < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {currency.change24h < 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span className="ml-1 text-xs">{Math.abs(currency.change24h).toFixed(2)}%</span>
            </span>
          </div>
         
        </div>
      </div>
    </div>
  )
}

export default async function Home() {
  const { mainCurrencies, parityAchieved, nearestToParity } = await getCurrencyRates()

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Sat Parity Tracker</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          

          <div>
            <h2 className="text-xl font-semibold mb-4">Sat Parity Achieved</h2>
            <div className="space-y-4">
              {parityAchieved.length > 0 ? (
                parityAchieved.map((currency) => (
                  <CurrencyCard key={currency.code} currency={currency} />
                ))
              ) : (
                <p className="text-muted-foreground">No currencies have achieved sat parity yet</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Major Currencies</h2>
            <div className="space-y-4">
              {mainCurrencies.map((currency) => (
                <CurrencyCard key={currency.code} currency={currency} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Closest to Parity</h2>
            <div className="space-y-4">
              {nearestToParity.map((currency) => (
                <CurrencyCard key={currency.code} currency={currency} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
