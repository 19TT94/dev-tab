import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Hooks
import { AuthProvider } from './hooks/useAuth'
import { ProtectedRoute } from './hooks/ProtectedRoute'

// Components
import { Layout } from './components/Layout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TimeEntriesPage from './pages/TimeEntries'
import ClientsPage from './pages/Clients'
import ReportsPage from './pages/Reports'
import InvoicesPage from './pages/Invoices'
import ComponentLibrary from './pages/ComponentLibrary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/time"
      element={
        <ProtectedRoute>
          <Layout>
            <TimeEntriesPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/clients"
      element={
        <ProtectedRoute>
          <Layout>
            <ClientsPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/reports"
      element={
        <ProtectedRoute>
          <Layout>
            <ReportsPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/invoices"
      element={
        <ProtectedRoute>
          <Layout>
            <InvoicesPage />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/components"
      element={
        <ProtectedRoute>
          <Layout>
            <ComponentLibrary />
          </Layout>
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
)

export default App
