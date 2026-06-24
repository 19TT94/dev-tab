import styled, { css } from 'styled-components'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface StyledButtonProps {
  $variant: ButtonVariant
  $size: ButtonSize
  $fullWidth?: boolean
}

const variantStyles = {
  primary: css`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.secondary};

    &:hover:not(:disabled) {
      filter: brightness(0.92);
    }

    &:disabled {
      opacity: 0.5;
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme.colors.tertiary};
    color: ${({ theme }) => theme.colors.secondary};
    border: 1px solid ${({ theme }) => theme.colors.border};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.background};
    }

    &:disabled {
      opacity: 0.5;
    }
  `,
  danger: css`
    background-color: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.tertiary};

    &:hover:not(:disabled) {
      filter: brightness(0.92);
    }

    &:disabled {
      opacity: 0.5;
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme.colors.muted};

    &:hover:not(:disabled) {
      background-color: ${({ theme }) => theme.colors.background};
    }

    &:disabled {
      opacity: 0.5;
    }
  `,
}

const sizeStyles = {
  sm: css`
    padding: 0.375rem 0.75rem;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  `,
  md: css`
    padding: 0.5rem 1rem;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  `,
  lg: css`
    padding: 0.75rem 1rem;
    font-size: ${({ theme }) => theme.fontSizes.base};
  `,
}

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, opacity 0.15s ease, filter 0.15s ease;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  &:disabled {
    cursor: not-allowed;
  }

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}
`

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <StyledButton $variant={variant} $size={size} $fullWidth={fullWidth} {...props} />
  )
}
