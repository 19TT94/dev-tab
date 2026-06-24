import styled from 'styled-components'

export const TableWrapper = styled.div`
  overflow-x: auto;
`

export const Table = styled.table`
  width: 100%;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  border-collapse: collapse;
`

export const TableHead = styled.thead`
  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.muted};
    text-align: left;
  }
`

export const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`

export const Th = styled.th<{ $align?: 'left' | 'right' }>`
  padding: 0.75rem 1.25rem;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-align: ${({ $align = 'left' }) => $align};
`

export const Td = styled.td<{ $align?: 'left' | 'right' }>`
  padding: 0.75rem 1.25rem;
  text-align: ${({ $align = 'left' }) => $align};
  color: ${({ theme }) => theme.colors.muted};

  &[data-emphasis='true'] {
    color: ${({ theme }) => theme.colors.secondary};
    font-weight: ${({ theme }) => theme.fontWeights.medium};
  }
`

export const CompactTable = styled(Table)`
  ${Th}, ${Td} {
    padding: 0.5rem 1rem 0.5rem 0;
  }
`

export const CompactTh = styled.th<{ $align?: 'left' | 'right' }>`
  padding: 0.5rem 1rem 0.5rem 0;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-align: ${({ $align = 'left' }) => $align};
  color: ${({ theme }) => theme.colors.muted};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

export const CompactTd = styled.td<{ $align?: 'left' | 'right' }>`
  padding: 0.5rem 1rem 0.5rem 0;
  text-align: ${({ $align = 'left' }) => $align};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.secondary};
`
