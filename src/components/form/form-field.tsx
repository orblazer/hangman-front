/* eslint-disable no-case-declarations */
import React, { ChangeEvent, PropsWithChildren } from 'react'
import { FieldValues, useFormContext } from 'react-hook-form'
import { BaseFormFieldProps } from './form'
import { retrieveError } from './form-utils'
import { colors, spaces } from '@/styles'
import styled from '@emotion/styled'
import { css } from '@emotion/core'
import InputNumber from './form-number'

const FieldStyle = ({
  hasError,
  readonly,
  disabled
}: {
  hasError?: boolean
  readonly?: boolean
  disabled?: boolean
}) => css`
  display: block;
  width: 100%;
  background-color: ${colors.input.backgroundColor};
  border: 1px solid ${hasError ? colors.input.errorBorderColor : colors.input.borderColor};
  color: ${disabled || readonly ? colors.input.disabledColor : colors.input.color};
  padding: ${spaces[2]};
  font-size: 1rem;
  border-radius: 4px;
  cursor: ${disabled || readonly ? 'not-allowed' : 'text'};

  outline: none;
  &:hover {
    border-color: ${hasError ? colors.input.hoverErrorBorderColor : colors.input.hoverBorderColor};
  }
`
export const Input = styled.input(FieldStyle)
export const Textarea = styled.textarea(
  FieldStyle,
  css`
    resize: vertical;
  `
)
export const Help = styled.p(({ error }: { error?: boolean }) => css`
  color: ${error ? colors.input.helpError : colors.input.help};
  font-style: ${error ? 'normal' : 'italic'};
  font-size: 0.75rem;
`)

/**
 * Field props
 */
export interface LabelAndHelp {
  label?: string
  help?: string
}

// | 'color' TODO: support it
// | 'date' TODO: support it
// | 'datetime-local' TODO: support it
// | 'file' TODO: support it
// | 'image' TODO: support it
// | 'month' NOTE: this is equal to 'date'
// | 'time' TODO: support it
// | 'week' NOTE: this is equal to 'date'

export interface FormFieldInputProps
  extends React.DetailedHTMLProps<
      Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'defaultChecked' | 'value' | 'onChange'>,
      HTMLInputElement
    >,
    LabelAndHelp {
  type: 'email' | 'number' | 'password' | 'range' | 'search' | 'tel' | 'text' | 'url'
  defaultValue?: string | ReadonlyArray<string> | number
  onChange?(value: string | number): void
}
export interface FormFieldTextareaProps
  extends React.DetailedHTMLProps<
      Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>,
      HTMLTextAreaElement
    >,
    LabelAndHelp {
  type: 'textarea'
  defaultValue?: string | ReadonlyArray<string> | number
  onChange?(value: string | number): void
}
export type RealFieldProps<FieldProps> = Omit<FieldProps, 'id' | 'type' | 'rules' | 'ref'>

/**
 * Create components
 */
export type FormFieldProps<TFieldValues extends FieldValues = FieldValues> = (
  | FormFieldInputProps
  | FormFieldTextareaProps
) &
  BaseFormFieldProps<TFieldValues>
const FormField = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  rules,
  defaultValue,
  onChange,
  id,
  type,
  label,
  help,
  ...fieldProps
}: PropsWithChildren<FormFieldProps<TFieldValues>>): React.ReactElement => {
  const methods = useFormContext<TFieldValues>()
  if (!control && !methods && process.env.NODE_ENV !== 'production') {
    throw new Error(`📋 Controller is missing 'control' prop (field ${name}).`)
  }
  const {
    register,
    formStateRef: {
      current: { errors }
    }
  } = control || methods.control
  const error = retrieveError(errors, name)
  let field: React.ReactElement

  switch (type) {
    case 'number':
      delete (fieldProps as RealFieldProps<FormFieldInputProps>).defaultValue
      field = (
        <InputNumber
          control={control || methods.control}
          rules={rules}
          id={id ?? name}
          name={name}
          defaultValue={defaultValue as number}
          onChange={onChange}
          {...(fieldProps as Omit<RealFieldProps<FormFieldInputProps>, 'defaultValue'>)}
        />
      )
      break

    case 'textarea':
      field = (
        <Textarea
          ref={register(rules)}
          defaultValue={defaultValue}
          id={id ?? name}
          name={name}
          hasError={error !== null}
          onChange={
            typeof onChange === 'function'
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (((e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)) as any)
              : undefined
          }
          {...(fieldProps as RealFieldProps<FormFieldTextareaProps>)}
        />
      )
      break
    default:
      field = (
        <Input
          ref={register(rules)}
          defaultValue={defaultValue}
          id={id ?? name}
          name={name}
          type={type}
          hasError={error !== null}
          onChange={
            typeof onChange === 'function'
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (((e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)) as any)
              : undefined
          }
          {...(fieldProps as RealFieldProps<FormFieldInputProps>)}
        />
      )
      break
  }

  return (
    <div>
      {label && (
        <label htmlFor={id ?? name} className="label">
          {label}
        </label>
      )}
      {field}
      {error && <Help error>{error.message}</Help>}
      {help && <Help dangerouslySetInnerHTML={{ __html: help }} />}
    </div>
  )
}
export default FormField
