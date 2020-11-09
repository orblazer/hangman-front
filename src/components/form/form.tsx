/* eslint-disable @typescript-eslint/no-explicit-any */
import spaces from '@/styles/spaces'
import styled from '@emotion/styled'
import { noop } from 'lodash'
import React from 'react'
import {
  Control,
  DeepPartial,
  FieldValues,
  SubmitHandler,
  UnpackNestedValue,
  useForm,
  UseFormMethods,
  ValidationRules
} from 'react-hook-form'

const StyledForm = styled.form`
  & > *:not(:last-child) {
    margin-bottom: ${spaces[4]};
  }
`

export interface BaseFormFieldProps<TFieldValues extends FieldValues> {
  control?: Control<TFieldValues>
  rules?: ValidationRules
  name: string // Paths<TFieldValues> TODO: WAIT TS 4.1
}

export type FormProps<TFieldValues extends FieldValues = FieldValues> = React.PropsWithChildren<
  Omit<React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'onSubmit'> & {
    formMethods?: UseFormMethods<TFieldValues>
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>
    onSubmit: SubmitHandler<TFieldValues>
    register?(control: Control<TFieldValues>): React.ReactElement
  }
>
const Form = <TFieldValues extends FieldValues = FieldValues>({
  formMethods,
  defaultValues,
  children,
  onSubmit,
  register,
  ...formProps
}: FormProps<TFieldValues>): React.ReactElement => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { handleSubmit, control, formState } = formMethods || useForm({ defaultValues, mode: 'onBlur' })
  noop(formState.isDirty) // make sure formState is read before render to enable the Proxy

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)} noValidate {...formProps}>
      {React.Children.map(children, (child: any) => {
        if (child !== null && typeof child.props !== 'undefined' && typeof child.props.name === 'string') {
          return React.createElement(child.type, {
            ...{
              ...child.props,
              control,
              key: child.props.name
            }
          })
        } else {
          return child
        }
      })}

      {register && register(control)}
    </StyledForm>
  )
}
export default Form
