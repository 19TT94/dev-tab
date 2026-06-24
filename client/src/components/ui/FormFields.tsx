import styled from 'styled-components'

import { fieldBase } from './InlineFields'

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

