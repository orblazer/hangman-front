import colors from '@/styles/colors'
import { css } from '@emotion/core'
import styled from '@emotion/styled'

const InfoMessage = styled.div(
  ({ error }: { error?: boolean }) => css`
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: ${error ? colors.danger : 'currentColor'};
    font-size: 1.2rem;
  `
)
export default InfoMessage
