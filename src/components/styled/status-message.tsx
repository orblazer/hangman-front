import colors from '@/styles/colors'
import { css } from '@emotion/core'
import styled from '@emotion/styled'

export type Status = 'info' | 'success' | 'warning' | 'danger'
const StatusMessage = styled.span(
  ({ status = 'info' }: { status?: Status }) => css`
    color: ${colors[status]};
  `
)
export default StatusMessage
