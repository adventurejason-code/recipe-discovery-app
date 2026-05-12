const NUTRIENT_PATHS = {
  calories: (r) => r.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount ?? null,
  protein:  (r) => r.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount ?? null,
  carbs:    (r) => r.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount ?? null,
  fat:      (r) => r.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount ?? null,
}

// Also support summary-level calories from complexSearch results
function getCalories(recipe) {
  if (recipe.nutrition?.nutrients) {
    return NUTRIENT_PATHS.calories(recipe)
  }
  return recipe.calories ?? null
}

function getNutrientValue(recipe, key) {
  if (key === 'calories') return getCalories(recipe)
  return NUTRIENT_PATHS[key]?.(recipe) ?? null
}

function targetScore(value, min, max) {
  if (value === null) return 0
  const hasMin = min !== '' && min !== null && min !== undefined
  const hasMax = max !== '' && max !== null && max !== undefined

  if (!hasMin && !hasMax) return 1

  const lo = hasMin ? Number(min) : -Infinity
  const hi = hasMax ? Number(max) : Infinity

  if (value >= lo && value <= hi) return 1

  const range = hasMin && hasMax ? (hi - lo) : (hasMin ? lo : hi)
  if (range <= 0) return 0

  const distance = value < lo ? lo - value : value - hi
  return Math.max(0, 1 - distance / range)
}

export function computeScores(recipes, preferredTargets, ranking) {
  // ranking: array of nutrient keys in priority order (index 0 = highest priority)
  // preferredTargets: { calories: {min, max}, protein: {min, max}, ... }
  const n = ranking.length
  if (n === 0) return recipes.map(r => ({ recipe: r, score: null }))

  const weights = ranking.map((_, i) => n - i)
  const totalWeight = weights.reduce((a, b) => a + b, 0)

  const scored = recipes.map(recipe => {
    let composite = 0
    ranking.forEach((key, i) => {
      const { min, max } = preferredTargets[key] || {}
      const val = getNutrientValue(recipe, key)
      composite += weights[i] * targetScore(val, min, max)
    })
    return { recipe, score: composite / totalWeight }
  })

  return scored.sort((a, b) => b.score - a.score)
}

export function scorePercent(score) {
  if (score === null) return null
  return Math.round(score * 100)
}
