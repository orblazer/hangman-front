import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { supportSSR } from '../utils/ssr-support'

export function stringify<T>(value: T): string {
  if (value !== null && typeof value === 'object') {
    return JSON.stringify(value)
  } else {
    return String(value)
  }
}

export function parse<T>(value: string | null): T | null {
  if (value === null) {
    return null
  }

  try {
    return JSON.parse(value)
  } catch (e) {
    const number = +value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return isNaN(number) ? (value === 'true' || value === 'false' ? value === 'true' : value) : (number as any)
  }
}

export default function useStateWithLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(supportSSR<T>(() => parse(localStorage.getItem(key)) || defaultValue, defaultValue))

  useEffect(() => {
    localStorage.setItem(key, stringify(value))
  }, [key, value])

  return [value, setValue]
}
