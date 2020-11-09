import { css } from '@emotion/core'
import colors from './colors'

export default css`
  * {
    margin: 0;
    padding: 0;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  ::selection {
    background-color: ${colors.selection.backgroundColor};
  }

  ::placeholder {
    color: ${colors.input.placeholder};
  }

  html,
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
      'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-size: 16px;
    scroll-behavior: smooth;

    background-color: ${colors.body.backgroundColor};
    color: ${colors.body.color};
  }

  #gatsby-focus-wrapper {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
`
