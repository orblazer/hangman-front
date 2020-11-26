import { ValidateResult, ValidationValueMessage } from 'react-hook-form'
import i18n, { TOptions, StringMap } from 'i18next'

const t = (key: string, options: TOptions<StringMap> = {}) => i18n.t(key, { ns: 'validations', ...options })


export const min = (value: number): ValidationValueMessage<number> => ({
  value,
  message: t('rules.min', { value })
})

export const max = (value: number): ValidationValueMessage<number> => ({
  value,
  message: t('rules.max', { value })
})

export const minLength = (value: number): ValidationValueMessage<number> => ({
  value,
  message: t('rules.minLength', { count: value, value })
})

export const maxLength = (value: number): ValidationValueMessage<number> => ({
  value,
  message: t('rules.maxLength', { count: value, value })
})

export function email(): ValidationValueMessage<RegExp> {
  return {
    value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
    message: t('rules.email')
  }
}

export function name(): ValidationValueMessage<RegExp> {
  return {
    value: /^(?: *[a-záàâäãåçéèêëíìîïñóòôöõúùûüýÿæœ-]+)*$/i,
    message: t('rules.name')
  }
}

export function number(): ValidationValueMessage<RegExp> {
  return {
    value: /^\d*$/i,
    message: t('rules.number')
  }
}

export function twitchName(): ValidationValueMessage<RegExp> {
  return {
    value: /^(#)?[a-z0-9][\w]{2,24}$/i,
    message: t('rules.name')
  }
}

export function username(): ValidationValueMessage<RegExp> {
  return {
    value: /^[a-z0-9][\w]{2,24}$/i,
    message: t('rules.name')
  }
}

export const integer = (value: number): ValidateResult => {
  value = Number(value)
  return Number.isInteger(value) || t('rules.integer', { value })
}
