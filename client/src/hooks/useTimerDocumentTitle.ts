import { useEffect } from 'react'

// Hooks
import { useTimer } from './useTimer'

// Utils
import { formatDuration } from '../lib/utils'

const APP_TITLE = 'DevTab'

export function useTimerDocumentTitle() {
  const { activeTimer, elapsed } = useTimer()

  useEffect(() => {
    document.title = activeTimer
      ? `${formatDuration(elapsed)} · ${APP_TITLE}`
      : APP_TITLE
  }, [activeTimer, elapsed])

  useEffect(() => {
    return () => {
      document.title = APP_TITLE
    }
  }, [])
}
