import { css } from '@emotion/core'
import styled from '@emotion/styled'

const Grid = styled.div(
  ({ templateColumns = 'auto', templateRows = 'auto' }: { templateColumns?: string; templateRows?: string }) => css`
    display: grid;
    grid-template-columns: ${templateColumns};
    grid-template-rows: ${templateRows};
    grid-auto-flow: row;
  `
)
export default Grid
