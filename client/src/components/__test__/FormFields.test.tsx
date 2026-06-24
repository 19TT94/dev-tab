import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from 'styled-components'
import { Input, Select, Textarea } from '../FormFields'
import { GlobalStyle } from '../../styles/GlobalStyle'
import { theme } from '../../styles/theme'

function renderWithTheme(ui: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {ui}
    </ThemeProvider>,
  )
}

describe('FormFields', () => {
  it('renders Input with label and error', () => {
    renderWithTheme(<Input label="Email" error="Required" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('generates input id from label', () => {
    renderWithTheme(<Input label="Full Name" />)
    expect(screen.getByLabelText('Full Name')).toHaveAttribute('id', 'full-name')
  })

  it('renders Select options', () => {
    renderWithTheme(
      <Select
        label="Project"
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ]}
      />,
    )
    expect(screen.getByLabelText('Project')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument()
  })

  it('renders Textarea with label', () => {
    renderWithTheme(<Textarea label="Notes" />)
    expect(screen.getByLabelText('Notes')).toBeInTheDocument()
  })
})
