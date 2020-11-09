/* eslint-disable @typescript-eslint/no-empty-function */
export function supportSSR<T>(value: () => T, SSRValue: T): T {
  return typeof window !== 'undefined' ? value() : SSRValue
}

export const SSRIntersectionObserver: IntersectionObserver = {
  root: null,
  rootMargin: '',
  thresholds: [],
  disconnect() {},
  observe() {},
  takeRecords() {
    return []
  },
  unobserve() {}
}
