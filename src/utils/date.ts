import { intervalToDuration, formatDuration as internalFormatDuration, Duration, Locale } from 'date-fns'

export function millisecondsToDuration(milliSeconds: number): Duration {
  if (milliSeconds < 60000) {
    return {
      seconds: milliSeconds / 1000
    }
  }

  const epoch = new Date(0)
  const secondsAfterEpoch = new Date(milliSeconds)
  return intervalToDuration({
    start: epoch,
    end: secondsAfterEpoch
  })
}

export function formatDuration(
  milliSeconds: number,
  options: {
    format?: string[]
    zero?: boolean
    delimiter?: string
    locale?: Locale
  }
): string {
  return internalFormatDuration(millisecondsToDuration(milliSeconds), options)
}
