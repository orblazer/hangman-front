// eslint-disable-next-line @typescript-eslint/ban-types
export default function debounce<T extends Function>(callback: T, delay = 0): (...args: unknown[]) => void {
  let timer: number
  return (...args) => {
    window.clearTimeout(timer)
    // eslint-disable-next-line standard/no-callback-literal
    timer = window.setTimeout(() => callback(...args), delay)
  }
}
