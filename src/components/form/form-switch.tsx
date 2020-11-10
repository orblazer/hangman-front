import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { Control, Controller, FieldValues, useFormContext } from 'react-hook-form'
import { css } from '@emotion/core'
import styled from '@emotion/styled'
import { retrieveError } from './form-utils'
import { Help, LabelAndHelp } from './form-field'
import { BaseFormFieldProps } from './form'
import { colors, spaces } from '@/styles'

const Slider = styled.span(
  ({ size = '24px', padding = '4px' }: { size?: string; padding?: string }) => css`
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    color: ${colors.input.color};
    background-color: ${colors.input.backgroundColor};
    border: 1px solid ${colors.input.borderColor};
    transition: background-color 0.4s;
    padding: 0 ${padding};

    &:hover {
      border-color: ${colors.input.hoverBorderColor};
    }

    &::before {
      position: absolute;
      content: '';
      width: ${size};
      top: ${padding};
      left: ${padding};
      bottom: ${padding};
      border-radius: 50%;
      background-color: ${colors.input.color};
      transition: 0.4s;
    }

    input:checked + & {
      background-color: ${colors.switch.activeBackgroundColor};
      &::before {
        background-color: ${colors.switch.activeDotBackgroundColor};
        transform: translateX(calc(${size} + ${padding} / 2));
      }
    }
  `
)
const Switch = styled.div(
  ({ width = '60px', height = '34px' }: { width?: string; height?: string }) => css`
    position: relative;
    display: inline-block;
    width: ${width};
    height: ${height};

    & > input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    & > ${Slider} {
      border-radius: ${height};
    }
  `
)
const Label = styled.label`
  display: flex;
  align-items: center;

  & > ${Switch} {
    margin-right: ${spaces[2]};
  }
`

export type FormSwitchProps<TFieldValues extends FieldValues = FieldValues> = React.DetailedHTMLProps<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue' | 'value' | 'type' | 'onChange'>,
  HTMLInputElement
> &
  BaseFormFieldProps<TFieldValues> &
  LabelAndHelp & {
    onChange?(value: boolean): void
    uncheckedIcon?: IconProp | boolean
    checkedIcon?: IconProp | boolean
  }
const FormSwitch = <TFieldValues extends FieldValues = FieldValues>({
  control,
  rules,
  name,
  label,
  help,

  onChange,
  defaultChecked,
  uncheckedIcon = true,
  checkedIcon = true,
  ...inputProps
}: FormSwitchProps<TFieldValues>): React.ReactElement => {
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

  return (
    <div>
      <Controller
        defaultValue={defaultChecked}
        control={control as Control}
        rules={rules}
        name={name}
        render={(props) => {
          // Retrieve icon
          if (checkedIcon === true) {
            checkedIcon = 'check'
          }
          if (uncheckedIcon === true) {
            uncheckedIcon = 'times'
          }

          return (
            <Label>
              <Switch>
                <input
                  {...props}
                  type="checkbox"
                  onChange={(e) => {
                    props.onChange(e.target.checked)
                    typeof onChange === 'function' && onChange(e.target.checked)
                  }}
                  {...inputProps}
                />
                <Slider>
                  {checkedIcon && <FontAwesomeIcon icon={checkedIcon} fixedWidth />}
                  {uncheckedIcon && <FontAwesomeIcon icon={uncheckedIcon} fixedWidth />}
                </Slider>
              </Switch>
              {label}
            </Label>
          )
        }}
      />
      {error && <Help error>{error.message}</Help>}
      {help && <Help dangerouslySetInnerHTML={{ __html: help }} />}
    </div>
  )
}
export default FormSwitch
