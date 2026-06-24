import { useEffect } from 'react'

// Utils
import { formatDuration } from '../lib/utils'

// Hooks
import { useTimer } from './useTimer'

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
