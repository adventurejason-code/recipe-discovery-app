import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { storageGet, storageSet } from '../utils/storage'

const DAILY_LIMIT = 150
const KEY = 'api_call_log'

function todayUTC() {
  return new Date().toISOString().slice(0, 10)
}

function loadLog() {
  const log = storageGet(KEY)
  if (!log || log.date !== todayUTC()) {
    const fresh = { date: todayUTC(), count: 0 }
    storageSet(KEY, fresh)
    return fresh
  }
  return log
}

const BudgetContext = createContext(null)

export function BudgetProvider({ children }) {
  const [count, setCount] = useState(() => loadLog().count)

  useEffect(() => {
    const log = loadLog()
    setCount(log.count)
  }, [])

  const remaining = DAILY_LIMIT - count

  const canCall = useCallback(() => remaining > 0, [remaining])

  // Increments counter and returns true if the call is allowed.
  // Returns false (and does NOT increment) when budget is exhausted.
  const consumeCall = useCallback(() => {
    const log = loadLog()
    if (log.count >= DAILY_LIMIT) {
      setCount(DAILY_LIMIT)
      return false
    }
    const updated = { ...log, count: log.count + 1 }
    storageSet(KEY, updated)
    setCount(updated.count)
    return true
  }, [])

  // Called when Spoonacular returns 402 (server-side quota exceeded).
  const exhaustBudget = useCallback(() => {
    const log = { date: todayUTC(), count: DAILY_LIMIT }
    storageSet(KEY, log)
    setCount(DAILY_LIMIT)
  }, [])

  return (
    <BudgetContext.Provider value={{ remaining, canCall, consumeCall, exhaustBudget }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  return useContext(BudgetContext)
}
