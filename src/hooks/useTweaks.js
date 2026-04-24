import { useState, useCallback } from 'react'

export function useTweaks(defaults) {
  const [values, setValues] = useState(defaults)
  const setTweak = useCallback((key, val) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }, [])
  return [values, setTweak]
}
