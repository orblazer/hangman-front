import { css } from '@emotion/core'
import styled from '@emotion/styled'
import { colors, spaces } from '@/styles'

type Spaces = keyof typeof spaces

const Button = styled.button(
  ({
    variant = 'primary',
    size = { x: '4', y: '2' },
    disabled
  }: {
    variant?: keyof typeof colors.button
    size?: { x: Spaces; y: Spaces } | Spaces
    disabled?: boolean
  }) => css`
    background-color: ${colors.button[variant].backgroundColor};
    color: ${colors.button[variant].color};
    border: none;
    padding: ${typeof size === 'string' ? spaces[size] : spaces[size.y] + ' ' + spaces[size.x]};
    cursor: ${disabled ? 'not-allowed' : 'pointer'};

    &:hover {
      background-color: ${colors.button[variant].hoverBackgroundColor};
    }
  `
)
export default Button
