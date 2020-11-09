import i18next from 'i18next'
import { get } from 'lodash'
import { FieldError, FieldErrors, FieldValues } from 'react-hook-form'

/**
 * Retrieve an error
 * @param errors The errors map
 * @param fieldName The field name want retrieve
 */
export function retrieveError<TFieldValues extends FieldValues = FieldValues>(
  errors: FieldErrors<TFieldValues>,
  fieldName: string
): FieldError | null {
  const error = get(errors, fieldName) as FieldError | undefined
  if (typeof error === 'undefined') {
    return null
  }

  if (error.message === '') {
    // FIXME: wait https://github.com/react-hook-form/react-hook-form/issues/2903 for min, max, minLength, maxLength
    // error.message = t(`rules.${error.type}`, { count: typeof error.value === 'number' ? error.value : 1 })
    if (error.type === 'required') {
      error.message = i18next.t('rules.required', { ns: 'validations' })
    } else {
      error.message = i18next.t('rules.invalid', { ns: 'validations' })
    }
  }
  return error
}

export type OnObjectChange = (key: string, value: string) => void
