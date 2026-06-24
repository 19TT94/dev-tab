import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import tailLogo from '../assets/tail-bw.png'

// Hooks
import { useAuth } from '../hooks/useAuth'

// Components
import { Button } from '../components/Button'
import { Input } from '../components/FormFields'
import { Inline } from '../components/ui/Layout'
import {
  Alert,
  AuthCard,
  AuthSubtitle,
  AuthTitle,
  CenteredPage,
  FormStack,
} from '../components/ui'

// Utils
import { isMockMode } from '../lib/config'

const Login = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await signIn(email, password)
    setLoading(false)

    if (signInError) {
      setError(signInError)
      return
    }

    navigate(from, { replace: true })
  }

  return (
    <CenteredPage>
      <AuthCard>
        <Inline>
          <img src={tailLogo} alt="DevTab Logo" width={32} height={32} />
          <AuthTitle>DevTab</AuthTitle>
        </Inline>

        <br />

        <AuthSubtitle>
          {isMockMode
            ? 'Mock mode — sign in with any credentials'
            : 'Sign in to track your time'}
        </AuthSubtitle>

        <FormStack onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <Alert>{error}</Alert>}
          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </FormStack>
      </AuthCard>
    </CenteredPage>
  )
}

export default Login
