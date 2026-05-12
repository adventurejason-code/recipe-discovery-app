import { useBudget } from '../context/BudgetContext'

export default function BudgetBanner() {
  const { remaining } = useBudget()

  if (remaining > 75) {
    return (
      <div className="bg-gray-100 text-gray-600 text-center text-sm py-1 px-4">
        {remaining} API calls remaining today
      </div>
    )
  }

  if (remaining > 38) {
    return (
      <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-800 text-center text-sm py-2 px-4 font-medium">
        ⚠️ {remaining} API calls remaining today — use sparingly
      </div>
    )
  }

  if (remaining > 0) {
    return (
      <div className="bg-orange-100 border-b border-orange-400 text-orange-800 text-center text-sm py-2 px-4 font-semibold">
        🔶 Only {remaining} API calls remaining today — searches are limited
      </div>
    )
  }

  return (
    <div className="bg-red-600 text-white text-center text-sm py-3 px-4 font-bold">
      🚫 Daily API limit reached. Search will resume tomorrow.
    </div>
  )
}
