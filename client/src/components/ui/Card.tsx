import styled from 'styled-components'

export const Card = styled.div`
  border-radius: ${({ theme }) => theme.radii.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.tertiary};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`

export const CardHeader = styled.div<{ $bordered?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: ${({ $bordered, theme }) =>
    $bordered ? `1px solid ${theme.colors.border}` : 'none'};
`

export const CardBody = styled.div<{ $padding?: string }>`
  padding: ${({ $padding }) => $padding ?? '1.25rem'};
`

export const CardTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.secondary};
`

export const StatCard = styled(Card)`
  padding: 1.25rem;
`

export const StatLabel = styled.p`
  margin: 0 0 0.25rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`

export const StatValue = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.secondary};
`

export const Panel = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  padding: 1rem;
`

export const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  & > li + li {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }
`

export const ListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
`

export const ListButton = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: inherit;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`
