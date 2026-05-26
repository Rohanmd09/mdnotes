import { useEffect, useRef } from 'react'

export function useDebounce(fn, delay) {
  const timer = useRef(null)

  const debounced = (...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  return debounced
}
