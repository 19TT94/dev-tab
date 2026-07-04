import styled, { css } from 'styled-components'

export type BadgeVariant = 'draft' | 'sent' | 'paid' | 'overage' | 'default'

const badgeVariants = {
  draft: css`
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.muted};
  `,
  sent: css`
    background: color-mix(in srgb, ${({ theme }) => theme.colors.primary} 12%, ${({ theme }) => theme.colors.tertiary});
    color: ${({ theme }) => theme.colors.primary};
  `,
  paid: css`
    background: color-mix(in srgb, ${({ theme }) => theme.colors.success} 12%, ${({ theme }) => theme.colors.tertiary});
    color: ${({ theme }) => theme.colors.success};
  `,
  overage: css`
    background: color-mix(in srgb, ${({ theme }) => theme.colors.accent} 18%, ${({ theme }) => theme.colors.tertiary});
    color: ${({ theme }) => theme.colors.accent};
  `,
  default: css`
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.muted};
  `,
}

export const Badge = styled.span<{ $variant?: BadgeVariant; $size?: 'sm' | 'md' }>`
  display: inline-block;
  border-radius: ${({ theme }) => theme.radii.full};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-transform: capitalize;
  padding: ${({ $size }) => ($size === 'sm' ? '0.125rem 0.5rem' : '0.25rem 0.75rem')};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  ${({ $variant = 'default' }) => badgeVariants[$variant]}
`

export const Alert = styled.div<{ $variant?: 'error' | 'warning' | 'info' }>`
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 0.5rem 0.75rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};

  ${({ $variant = 'error', theme }) => {
    if ($variant === 'warning') {
      return css`
        border: 1px solid ${theme.colors.accent};
        background: color-mix(in srgb, ${theme.colors.accent} 45%, ${theme.colors.tertiary});
        color: ${theme.colors.secondary};
      `
    }
    if ($variant === 'info') {
      return css`
        border: 1px solid ${theme.colors.primary};
        background: color-mix(in srgb, ${theme.colors.primary} 12%, ${theme.colors.tertiary});
        color: ${theme.colors.primary};
      `
    }
    return css`
      background: color-mix(in srgb, ${theme.colors.danger} 10%, ${theme.colors.tertiary});
      color: ${theme.colors.danger};
    `
  }}
`

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.secondary};
`

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
`

export const StatusYes = styled.span`
  color: ${({ theme }) => theme.colors.success};
`

export const StatusNo = styled.span`
  color: ${({ theme }) => theme.colors.accent};
`

export const MutedHint = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`
