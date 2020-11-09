import React from 'react'
import { Control, Controller, FieldValues, useFormContext } from 'react-hook-form'
import ReactSelect, { Styles, mergeStyles, NamedProps, OptionTypeBase } from 'react-select'
import { BaseFormFieldProps } from './form'
import { retrieveError } from './form-utils'
import { colors } from '@styles'
import { Help, LabelAndHelp } from './form-field'

const baseStyles: (hasError: boolean) => Partial<Styles> = (hasError) => ({
  control: (base) => ({
    ...base,
    backgroundColor: colors.input.backgroundColor,
    borderColor: hasError ? colors.input.errorBorderColor : colors.input.borderColor,
    borderRadius: '4px',
    boxShadow: 'none',
    '&:hover': {
      borderColor: hasError ? colors.input.hoverErrorBorderColor : colors.input.hoverBorderColor
    }
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: colors.input.borderColor
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: colors.input.color,
    cursor: 'pointer',
    '&:hover': {
      color: colors.input.color
    }
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: colors.input.backgroundColor
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: colors.input.placeholder
  }),
  option: (base, { isDisabled, isSelected }) => ({
    ...base,
    color: isDisabled ? colors.input.disabledColor : colors.input.color,
    backgroundColor: isSelected ? colors.select.selectedBackgroundColor : 'transparent',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    '&:hover': {
      backgroundColor: colors.select.selectedBackgroundColor
    }
  }),
  input: (base, { isDisabled }) => ({
    ...base,
    color: isDisabled ? colors.input.disabledColor : colors.input.color
  }),
  placeholder: (base) => ({
    ...base,
    color: colors.input.placeholder
  }),
  singleValue: (base, { hasValue }) => ({
    ...base,
    color: hasValue ? colors.input.color : colors.input.placeholder
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: colors.select.multiBackgroundColor,
    color: colors.input.color
  }),
  multiValueRemove: (base) => ({
    ...base,
    borderLeft: `1px solid ${colors.select.multiBorderColor}`,
    cursor: 'pointer',
    '&:hover': {
      color: colors.input.color,
      backgroundColor: colors.select.multiRemoveBackgroundColor
    }
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'current'
  }),
  clearIndicator: (base, { isFocused }) => ({
    ...base,
    color: isFocused ? colors.select.clearFocusColor : colors.select.clearColor,
    cursor: 'pointer',
    '&:hover': {
      color: isFocused ? colors.select.clearFocusHoverColor : colors.select.clearHoverColor
    }
  })
})

export type DefaultOptionType = { label: string; value: string }
export type FormSelectPropsWithoutOptions<
  OptionType extends OptionTypeBase = DefaultOptionType,
  TFieldValues extends FieldValues = FieldValues
> = Omit<FormSelectProps<OptionType, TFieldValues>, 'options'>
export type FormSelectProps<
  OptionType extends OptionTypeBase = DefaultOptionType,
  TFieldValues extends FieldValues = FieldValues
> = Omit<NamedProps<OptionType>, 'value' | 'options' | 'defaultValue'> &
  BaseFormFieldProps<TFieldValues> & {
    sortOptions?: 'asc' | 'desc'
    options?: OptionType[]
    defaultValue?: OptionType['value'] | OptionType['value'][]
  } & LabelAndHelp
const Select = <OptionType extends OptionTypeBase = DefaultOptionType, TFieldValues extends FieldValues = FieldValues>({
  control,
  rules,
  name,
  label,
  help,

  id,
  styles = {},
  options = [],
  sortOptions = 'asc',
  onChange,
  defaultValue,
  ...selectProps
}: FormSelectProps<OptionType, TFieldValues>): React.ReactElement => {
  const methods = useFormContext()
  if (!control && !methods && process.env.NODE_ENV !== 'production') {
    throw new Error(`📋 Controller is missing 'control' prop  (field ${name}).`)
  }
  const {
    formStateRef: {
      current: { errors }
    }
  } = control || methods.control
  const error = retrieveError(errors, name)

  // Sort the options
  if (typeof options !== 'undefined' && typeof sortOptions !== 'undefined') {
    if (Array.isArray(options)) {
      const isAsc = sortOptions === 'asc'
      options = options.sort((a, b) => {
        if (typeof a.label === 'string' && typeof b.label === 'string') {
          if (a.label < b.label) {
            return isAsc ? -1 : 1
          } else if (a.label > b.label) {
            return isAsc ? 1 : -1
          }
        }
        return 0
      })
    } else {
      console.warn('Could not sort object options')
    }
  }

  return (
    <div>
      <Controller
        name={name}
        control={control as Control}
        rules={rules}
        defaultValue={defaultValue}
        render={(props) => (
          <>
            {label && (
              <label htmlFor={id} onClick={() => props.ref.current.select.focus()}>
                {label}
              </label>
            )}
            <ReactSelect<OptionType>
              {...props}
              id={id ?? name}
              onChange={(value, action) => {
                props.onChange(
                  Array.isArray(value)
                    ? value.map((val) => val.value)
                    : typeof value === 'object' && value !== null
                    ? (value as OptionType).value
                    : value === null && selectProps.isMulti
                    ? []
                    : value,
                  action
                )
                typeof onChange === 'function' && onChange(value, action)
              }}
              options={options}
              value={options.find((option) => option.value === props.value)}
              styles={mergeStyles(baseStyles(error !== null), styles)}
              {...selectProps}
            />
          </>
        )}
      />
      {error && <Help error>{error.message}</Help>}
      {help && <Help dangerouslySetInnerHTML={{ __html: help }} />}
    </div>
  )
}
export default Select
