import styled from 'styled-components'

export const PageContainer = styled.div<{ $maxWidth?: string }>`
  margin: 0 auto;
  max-width: ${({ $maxWidth }) => $maxWidth ?? '48rem'};
`

export const PageStack = styled.div<{ $gap?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap ?? '1.5rem'};
`

export const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`

export const PageTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.secondary};
`

export const PageSubtitle = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`

export const SectionTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

export const Text = styled.p<{ $size?: 'xs' | 'sm' | 'base'; $color?: 'muted' | 'default' | 'danger' }>`
  margin: 0;
  font-size: ${({ theme, $size = 'sm' }) => theme.fontSizes[$size]};
  color: ${({ theme, $color = 'default' }) => {
    if ($color === 'muted') return theme.colors.muted
    if ($color === 'danger') return theme.colors.danger
    return theme.colors.secondary
  }};
`

export const MonoText = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
`

export const LinkButton = styled.button`
  border: none;
  background: none;
  padding: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`

export const FormStack = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`

export const ButtonRow = styled.div`
  display: flex;
  gap: 0.5rem;
`

export const Grid = styled.div<{ $cols?: number }>`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(1, 1fr);

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(${({ $cols = 2 }) => Math.min($cols, 2)}, 1fr);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(${({ $cols = 3 }) => $cols}, 1fr);
  }
`

export const Inline = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`
