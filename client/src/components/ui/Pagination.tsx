import styled from 'styled-components'

interface PaginationProps {
  current: number
  pageTotal: number
  onPageChange: (page: number) => void
  loading?: boolean
}

export const Pagination = ({
  current,
  pageTotal,
  onPageChange,
  loading = false,
}: PaginationProps) => {
  if (pageTotal <= 1) return null

  const goToPage = (offset: number) => {
    const next = current + offset
    if (next >= 1 && next <= pageTotal) {
      onPageChange(next)
    }
  }

  const handlePageInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return

    const target = event.currentTarget
    const parsed = Number.parseInt(target.value, 10)
    const page = Number.isNaN(parsed)
      ? 1
      : Math.min(Math.max(parsed, 1), pageTotal)

    onPageChange(page)
    target.value = ''
  }

  return (
    <PaginationWrapper data-testid="pagination">
      <PaginationButton
        type="button"
        aria-label="Previous page"
        disabled={current === 1 || loading}
        onClick={() => goToPage(-1)}
      >
        <Arrow aria-hidden />
      </PaginationButton>
      <Selector>
        Page
        <SelectorInput
          type="number"
          placeholder={String(current)}
          min={1}
          max={pageTotal}
          onKeyDown={handlePageInput}
          disabled={loading}
        />
        of {pageTotal}
      </Selector>
      <PaginationButton
        type="button"
        aria-label="Next page"
        disabled={current === pageTotal || loading}
        onClick={() => goToPage(1)}
      >
        <Arrow $rotate aria-hidden />
      </PaginationButton>
    </PaginationWrapper>
  )
}

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
`

const PaginationButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`

const Selector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 7.5rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`

const SelectorInput = styled.input`
  width: 2rem;
  min-width: 2rem;
  padding: 0.125rem 0.25rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-align: center;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const Arrow = styled.span<{ $rotate?: boolean }>`
  display: inline-block;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 7px solid ${({ theme }) => theme.colors.secondary};
  transform: ${({ $rotate }) => ($rotate ? 'rotate(180deg)' : 'none')};
`
