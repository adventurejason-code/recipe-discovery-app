import { useState } from 'react'

const LABELS = {
  calories: 'Calories',
  protein:  'Protein',
  carbs:    'Carbohydrates',
  fat:      'Fat',
}

export default function PriorityRankModal({ preferredKeys, onConfirm, onCancel }) {
  // ranked: ordered array of keys, starting from priority 1
  const [ranked, setRanked] = useState([...preferredKeys])

  function moveUp(index) {
    if (index === 0) return
    setRanked(prev => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }

  function moveDown(index) {
    if (index === ranked.length - 1) return
    setRanked(prev => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Rank your preferences</h2>
        <p className="text-sm text-gray-500 mb-5">
          Drag or use the arrows to set priority order. Results will be sorted with top-ranked targets weighted most.
        </p>

        <ol className="space-y-2 mb-6">
          {ranked.map((key, i) => (
            <li key={key} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-gray-700">{LABELS[key]}</span>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveUp(i)}
                  disabled={i === 0}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none px-1"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(i)}
                  disabled={i === ranked.length - 1}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-xs leading-none px-1"
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(ranked)}
            className="flex-1 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Search with this ranking
          </button>
        </div>
      </div>
    </div>
  )
}
