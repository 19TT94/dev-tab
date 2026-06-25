export const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export const MOCK_USER_ID = 'mock-user-id'

const parsedInvoiceStart = Number(import.meta.env.VITE_INVOICE_NUMBER_START ?? 1)

export const INVOICE_NUMBER_START =
  Number.isFinite(parsedInvoiceStart) && parsedInvoiceStart >= 1
    ? Math.floor(parsedInvoiceStart)
    : 1
