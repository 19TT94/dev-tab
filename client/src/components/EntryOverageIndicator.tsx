import styled from 'styled-components'

// Components
import { MutedHint, OverageBadge } from './ui'

// Utils
import { entryHasOverage, entryOverageSeconds } from '../lib/billing'
import type { BilledSegment } from '../lib/billing'
import { formatHours } from '../lib/utils'

interface EntryOverageIndicatorProps {
  segments: BilledSegment[]
  totalSeconds: number
  align?: 'left' | 'right'
}

export const EntryOverageIndicator = ({
  segments,
  totalSeconds,
  align = 'left',
}: EntryOverageIndicatorProps) => {
  if (!entryHasOverage(segments)) return null

  const overageSeconds = entryOverageSeconds(segments)
  const isPartial = overageSeconds > 0 && overageSeconds < totalSeconds

  return (
    <OverageWrap $align={align}>
      <OverageBadge />
      {isPartial && (
        <MutedHint>
          {formatHours(overageSeconds)} at overage rate
        </MutedHint>
      )}
    </OverageWrap>
  )
}

const OverageWrap = styled.span<{ $align: 'left' | 'right' }>`
  display: block;
  margin-top: 0.25rem;
  text-align: ${({ $align }) => ($align === 'right' ? 'right' : 'left')};
`
