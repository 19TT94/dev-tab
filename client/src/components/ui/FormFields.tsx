import styled, { css } from 'styled-components'

const fieldBase = css`
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.5rem 0.75rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  background: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.secondary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primary};
  }
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

const StyledInput = styled.input`
  ${fieldBase}
`

const StyledSelect = styled.select`
  ${fieldBase}
`

const StyledTextarea = styled.textarea`
  ${fieldBase}
  resize: vertical;
`

const ErrorText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.danger};
  margin: 0;
`

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <FieldGroup>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <StyledInput id={inputId} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </FieldGroup>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, id, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <FieldGroup>
      {label && <Label htmlFor={selectId}>{label}</Label>}
      <StyledSelect id={selectId} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </StyledSelect>
    </FieldGroup>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, id, ...props }: TextareaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <FieldGroup>
      {label && <Label htmlFor={textareaId}>{label}</Label>}
      <StyledTextarea id={textareaId} {...props} />
    </FieldGroup>
  )
}

export const InlineInput = styled.input`
  ${fieldBase}
`

export const InlineSelect = styled.select`
  ${fieldBase}
`
