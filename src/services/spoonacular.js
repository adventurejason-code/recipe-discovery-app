const BASE = 'https://api.spoonacular.com'

class SpoonacularError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export async function complexSearch(apiKey, params) {
  const query = new URLSearchParams()
  query.set('apiKey', apiKey)
  query.set('number', '10')

  const mappings = {
    query:        'query',
    ingredients:  'includeIngredients',
    diet:         'diet',
    intolerances: 'intolerances',
    cuisine:      'cuisine',
    type:         'type',
    sort:         'sort',
    minCalories:  'minCalories',
    maxCalories:  'maxCalories',
    minProtein:   'minProtein',
    maxProtein:   'maxProtein',
    minCarbs:     'minCarbs',
    maxCarbs:     'maxCarbs',
    minFat:       'minFat',
    maxFat:       'maxFat',
  }

  for (const [key, apiParam] of Object.entries(mappings)) {
    const val = params[key]
    if (val !== undefined && val !== null && val !== '') {
      query.set(apiParam, String(val))
    }
  }

  const res = await fetch(`${BASE}/recipes/complexSearch?${query}`)

  if (!res.ok) {
    throw new SpoonacularError(res.status, `complexSearch failed: ${res.status}`)
  }

  const data = await res.json()
  return data.results ?? []
}

export async function getRecipeInfo(apiKey, id) {
  const query = new URLSearchParams({
    apiKey,
    includeNutrition: 'true',
  })

  const res = await fetch(`${BASE}/recipes/${id}/information?${query}`)

  if (!res.ok) {
    throw new SpoonacularError(res.status, `getRecipeInfo failed: ${res.status}`)
  }

  return res.json()
}
