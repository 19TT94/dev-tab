import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

vi.stubEnv('VITE_USE_MOCK_DATA', 'true')

class LocalStorageMock implements Storage {
  private store = new Map<string, string>()

  get length() {
    return this.store.size
  }

  clear() {
    this.store.clear()
  }

  getItem(key: string) {
    return this.store.get(key) ?? null
  }

  key(index: number) {
    return [...this.store.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.store.delete(key)
  }

  setItem(key: string, value: string) {
    this.store.set(key, value)
  }
}

const localStorageMock = new LocalStorageMock()
vi.stubGlobal('localStorage', localStorageMock)

afterEach(() => {
  cleanup()
  localStorageMock.clear()
  vi.restoreAllMocks()
})

vi.stubGlobal(
  'crypto',
  {
    ...globalThis.crypto,
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2, 9),
  },
)
