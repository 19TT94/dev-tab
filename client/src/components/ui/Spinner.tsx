import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

export const Spinner = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  animation: ${spin} 0.8s linear infinite;
`

export const LoadingScreen = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
`

export const CenteredPage = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  padding: 1rem;
`

export const AuthCard = styled.div`
  width: 100%;
  max-width: 24rem;
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.tertiary};
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

export const AuthTitle = styled.h1`
  margin: 0 0 0.25rem;
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.secondary};
`

export const AuthSubtitle = styled.p`
  margin: 0 0 1.5rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`
