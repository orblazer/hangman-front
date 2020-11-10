/* eslint-disable no-case-declarations */
import React, { PropsWithChildren } from 'react'
import { Control, Controller, FieldValues } from 'react-hook-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from '@emotion/styled'
import { css } from '@emotion/core'
import { BaseFormFieldProps } from './form'
import { colors, spaces } from '@/styles'

const Wrapper = styled.div(
  ({ hasError }: { hasError?: boolean }) => css`
    display: flex;
    background-color: ${colors.input.backgroundColor};
    border: 1px solid ${hasError ? colors.input.errorBorderColor : colors.input.borderColor};
    border-radius: 4px;
    overflow: hidden;
    &:hover {
      border-color: ${hasError ? colors.input.hoverErrorBorderColor : colors.input.hoverBorderColor};
    }
  `
)
const Input = styled.input(
  ({ readonly, disabled }: { readonly?: boolean; disabled?: boolean }) => css`
    display: block;
    flex: 1 0 auto;
    border: none;
    background-color: transparent;
    color: ${disabled || readonly ? colors.input.disabledColor : colors.input.color};
    padding: ${spaces[2]};
    font-size: 1rem;
    cursor: ${disabled || readonly ? 'not-allowed' : 'text'};
    outline: none;
    -moz-appearance: textfield;
    &::-webkit-inner-spin-button,
    &::-webkit-inner-outer-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `
)
const Button = styled.button(
  ({ disabled, readonly, right }: { readonly?: boolean; disabled?: boolean; right?: boolean }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    color: ${disabled || readonly ? colors.input.disabledColor : colors.input.color};
    padding: 0 ${spaces[3]};
    cursor: ${disabled || readonly ? 'not-allowed' : 'pointer'};
    border: none;
    outline: none;
    ${`border-${right ? 'left' : 'right'}: 1px solid ${colors.input.borderColor};`}
    &:hover {
      background-color: ${colors.input.borderColor};
    }
  `
)

/**
 * Create components
 */
export type InputNumberProps<TFieldValues extends FieldValues = FieldValues> = React.DetailedHTMLProps<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'defaultChecked' | 'value' | 'type' | 'onChange'>,
  HTMLInputElement
> &
  BaseFormFieldProps<TFieldValues> & {
    defaultValue?: number
    hasError?: boolean
    onChange?(value: string | number): void
  }
const InputNumber = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  rules,
  defaultValue,
  hasError,
  onChange,
  ...fieldProps
}: PropsWithChildren<InputNumberProps<TFieldValues>>): React.ReactElement | null => (
  <Controller
    defaultValue={defaultValue}
    control={control as Control}
    rules={rules}
    name={name}
    render={(props) => {
      const rawStep = Number(fieldProps.step as string)
      const step = isNaN(rawStep) ? 1 : rawStep
      const canMinus = typeof fieldProps.min !== 'undefined' && Number(fieldProps.min as string) <= props.value - step
      const canAdd = typeof fieldProps.max !== 'undefined' && Number(fieldProps.max as string) >= props.value + step

      return (
        <Wrapper hasError={hasError}>
          <Button
            type="button"
            disabled={!canMinus}
            onClick={() => {
              if (canMinus) {
                props.onChange(props.value - step)
                props.ref.current.focus()
              }
            }}
          >
            <FontAwesomeIcon icon="minus" />
          </Button>
          <Input
            {...props}
            type="number"
            onChange={(e) => {
              let value: string | number = e.target.value
              if (e.target.value !== '') {
                const output = e.target.valueAsNumber
                value = isNaN(output) ? 0 : output
              }
              props.onChange(value)
              typeof onChange === 'function' && onChange(value)
            }}
            {...fieldProps}
          />
          <Button
            right
            type="button"
            disabled={!canAdd}
            onClick={() => {
              if (canAdd) {
                props.onChange(props.value + step)
                props.ref.current.focus()
              }
            }}
          >
            <FontAwesomeIcon icon="plus" />
          </Button>
        </Wrapper>
      )
    }}
  />
)
export default InputNumber
