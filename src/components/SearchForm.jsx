import { useState } from 'react'
import { useBudget } from '../context/BudgetContext'

const DIETS = [
  'vegetarian', 'vegan', 'gluten free', 'ketogenic', 'paleo',
  'pescetarian', 'primal', 'whole30', 'lacto-vegetarian', 'ovo-vegetarian',
]

const INTOLERANCES = [
  'dairy', 'egg', 'gluten', 'grain', 'peanut', 'seafood',
  'sesame', 'shellfish', 'soy', 'sulfite', 'tree nut', 'wheat',
]

const CUISINES = [
  '', 'African', 'American', 'British', 'Cajun', 'Caribbean', 'Chinese',
  'Eastern European', 'European', 'French', 'German', 'Greek', 'Indian',
  'Irish', 'Italian', 'Japanese', 'Jewish', 'Korean', 'Latin American',
  'Mediterranean', 'Mexican', 'Middle Eastern', 'Nordic', 'Southern',
  'Spanish', 'Thai', 'Vietnamese',
]

const MEAL_TYPES = [
  '', 'main course', 'side dish', 'dessert', 'appetizer', 'salad',
  'bread', 'breakfast', 'soup', 'beverage', 'sauce', 'marinade',
  'fingerfood', 'snack', 'drink',
]

const NUTRIENT_LABELS = {
  calories: 'Calories (kcal)',
  protein:  'Protein (g)',
  carbs:    'Carbohydrates (g)',
  fat:      'Fat (g)',
}

const NUTRIENT_KEYS = ['calories', 'protein', 'carbs', 'fat']

function SectionHeader({ number, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center">
        {number}
      </span>
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
    </div>
  )
}

function TagInput({ tags, onChange }) {
  const [inputVal, setInputVal] = useState('')

  function commit(value) {
    const parts = value.split(',').map(s => s.trim()).filter(Boolean)
    const unique = parts.filter(p => !tags.includes(p))
    if (unique.length > 0) onChange([...tags, ...unique])
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(inputVal)
      setInputVal('')
    } else if (e.key === 'Backspace' && inputVal === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function handleBlur() {
    if (inputVal.trim()) {
      commit(inputVal)
      setInputVal('')
    }
  }

  function handlePaste(e) {
    e.preventDefault()
    const text = e.clipboardData.getData('text')
    commit(text)
  }

  function removeTag(tag) {
    onChange(tags.filter(t => t !== tag))
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 border border-gray-300 rounded-lg min-h-[42px] focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent bg-white">
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-sm px-2 py-0.5 rounded-full">
          {tag}
          <button type="button" onClick={() => removeTag(tag)} className="text-amber-500 hover:text-amber-700 leading-none">×</button>
        </span>
      ))}
      <input
        type="text"
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onPaste={handlePaste}
        placeholder={tags.length === 0 ? 'e.g. chicken, spinach, garlic' : ''}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
      />
    </div>
  )
}

function CheckGroup({ options, selected, onChange }) {
  const noneSelected = selected.length === 0

  function toggleNone() {
    if (!noneSelected) onChange([])
  }

  function toggle(val) {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val])
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={noneSelected}
          onChange={toggleNone}
          className="w-4 h-4 accent-amber-500 cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 italic">None</span>
      </label>
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="w-4 h-4 accent-amber-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700 group-hover:text-gray-900 capitalize">{opt}</span>
        </label>
      ))}
    </div>
  )
}

function NutrientRow({ label, data, onChange }) {
  const { min, max, mode } = data
  const isRequired = mode === 'required'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="w-40 flex-shrink-0">
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-2 flex-1">
        <input
          type="number"
          min="0"
          value={min}
          onChange={e => onChange({ ...data, min: e.target.value })}
          placeholder="Min"
          className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <span className="text-gray-400 text-sm">–</span>
        <input
          type="number"
          min="0"
          value={max}
          onChange={e => onChange({ ...data, max: e.target.value })}
          placeholder="Max"
          className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="button"
          onClick={() => onChange({ ...data, mode: isRequired ? 'preferred' : 'required' })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            isRequired
              ? 'bg-amber-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isRequired ? 'Required' : 'Preferred'}
        </button>
      </div>
    </div>
  )
}

export default function SearchForm({ onSearch }) {
  const { remaining } = useBudget()
  const budgetExhausted = remaining <= 0

  const [ingredients, setIngredients] = useState([])
  const [selectedDiets, setSelectedDiets] = useState([])
  const [selectedIntolerances, setSelectedIntolerances] = useState([])
  const [cuisine, setCuisine] = useState('')
  const [mealType, setMealType] = useState('')
  const [nutrients, setNutrients] = useState({
    calories: { min: '', max: '', mode: 'required' },
    protein:  { min: '', max: '', mode: 'required' },
    carbs:    { min: '', max: '', mode: 'required' },
    fat:      { min: '', max: '', mode: 'required' },
  })

  function updateNutrient(key, val) {
    setNutrients(prev => ({ ...prev, [key]: val }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (budgetExhausted) return

    const requiredNutrients = {}
    const preferredTargets = {}

    for (const key of NUTRIENT_KEYS) {
      const { min, max, mode } = nutrients[key]
      const hasMin = min !== ''
      const hasMax = max !== ''
      if (!hasMin && !hasMax) continue

      if (mode === 'required') {
        const apiKey = key === 'carbs' ? 'Carbs' : key.charAt(0).toUpperCase() + key.slice(1)
        if (hasMin) requiredNutrients[`min${apiKey}`] = min
        if (hasMax) requiredNutrients[`max${apiKey}`] = max
      } else {
        preferredTargets[key] = { min: min || null, max: max || null }
      }
    }

    const searchParams = {
      ingredients: ingredients.join(','),
      diet: selectedDiets.join(','),
      intolerances: selectedIntolerances.join(','),
      cuisine,
      type: mealType,
      ...requiredNutrients,
    }

    onSearch(searchParams, preferredTargets)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: Ingredients */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <SectionHeader number="1" title="Ingredients" />
        <TagInput tags={ingredients} onChange={setIngredients} />
        <p className="mt-1.5 text-xs text-gray-400">Press Enter or comma to add · Paste a comma-separated list</p>
      </div>

      {/* Section 2: Dietary restrictions & intolerances */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <SectionHeader number="2" title="Dietary restrictions & intolerances" />
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Diet</p>
            <CheckGroup options={DIETS} selected={selectedDiets} onChange={setSelectedDiets} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Intolerances</p>
            <CheckGroup options={INTOLERANCES} selected={selectedIntolerances} onChange={setSelectedIntolerances} />
          </div>
        </div>
      </div>

      {/* Section 3: Cuisine & meal type */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <SectionHeader number="3" title="Cuisine & meal type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine</label>
            <select
              value={cuisine}
              onChange={e => setCuisine(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              {CUISINES.map(c => <option key={c} value={c}>{c || 'None'}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal type</label>
            <select
              value={mealType}
              onChange={e => setMealType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              {MEAL_TYPES.map(t => <option key={t} value={t}>{t || 'None'}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: Nutritional targets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <SectionHeader number="4" title="Nutritional targets (optional)" />
        <p className="text-xs text-gray-400 mb-4">
          Leave all fields blank to apply no nutritional filter.{' '}
          <span className="font-semibold text-amber-600">Required</span> filters are sent to the API as hard limits.{' '}
          <span className="font-semibold text-gray-600">Preferred</span> targets are used for display sorting only.
        </p>
        <div className="space-y-3">
          {NUTRIENT_KEYS.map(key => (
            <NutrientRow
              key={key}
              label={NUTRIENT_LABELS[key]}
              data={nutrients[key]}
              onChange={val => updateNutrient(key, val)}
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={budgetExhausted}
        className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors text-base"
      >
        {budgetExhausted ? 'Daily limit reached' : 'Search Recipes'}
      </button>
    </form>
  )
}
