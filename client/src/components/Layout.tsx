import { useState } from 'react'
import styled, { css } from 'styled-components'
import { NavLink, useLocation } from 'react-router-dom'

import tailLogo from '../assets/tail-bw.png'

// Hooks
import { useAuth } from '../hooks/useAuth'
import { useTimerDocumentTitle } from '../hooks/useTimerDocumentTitle'

// Components
import { Alert } from './ui'

// Utils
import { isMockMode } from '../lib/config'

type NavIconName = 'dashboard' | 'time' | 'clients' | 'reports' | 'invoices'

const navItems: {
  to: string
  label: string
  icon: NavIconName
  end?: boolean
}[] = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/time', label: 'Time Entries', icon: 'time' },
  { to: '/clients', label: 'Clients', icon: 'clients' },
  { to: '/reports', label: 'Reports', icon: 'reports' },
  { to: '/invoices', label: 'Invoices', icon: 'invoices' },
]

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { signOut } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [lastPath, setLastPath] = useState(location.pathname)

  useTimerDocumentTitle()

  // Close the mobile drawer whenever the route changes (incl. browser back/forward).
  if (location.pathname !== lastPath) {
    setLastPath(location.pathname)
    setIsDrawerOpen(false)
  }

  return (
    <Shell>
      <Backdrop $open={isDrawerOpen} onClick={() => setIsDrawerOpen(false)} />
      <Sidebar $collapsed={isCollapsed} $drawerOpen={isDrawerOpen}>
        <SidebarHeader $collapsed={isCollapsed}>
          <HeaderRow $collapsed={isCollapsed}>
            <BrandLink to="/" $collapsed={isCollapsed} onClick={() => setIsDrawerOpen(false)}>
              <img src={tailLogo} alt="" width={32} height={32} />
              <BrandText $collapsed={isCollapsed}>
                <AppTitle>DevTab</AppTitle>
                <AppTagline>Time, Billing & Invoices</AppTagline>
              </BrandText>
            </BrandLink>
            <HeaderButton
              type="button"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setIsCollapsed((open) => !open)}
              $desktopOnly
            >
              <NavIcon name={isCollapsed ? 'chevronRight' : 'chevronLeft'} />
            </HeaderButton>
            <HeaderButton
              type="button"
              aria-label="Close menu"
              onClick={() => setIsDrawerOpen(false)}
              $mobileOnly
            >
              <NavIcon name="close" />
            </HeaderButton>
          </HeaderRow>
        </SidebarHeader>
        <Nav>
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              end={item.end}
              $collapsed={isCollapsed}
              title={isCollapsed ? item.label : undefined}
              onClick={() => setIsDrawerOpen(false)}
            >
              <NavIcon name={item.icon} />
              <NavLabel $collapsed={isCollapsed}>{item.label}</NavLabel>
            </NavItem>
          ))}
        </Nav>
        <SidebarFooter>
          <SignOutButton
            type="button"
            aria-label="Sign out"
            $collapsed={isCollapsed}
            title={isCollapsed ? 'Sign out' : undefined}
            onClick={() => signOut()}
          >
            <NavIcon name="signOut" />
            <NavLabel $collapsed={isCollapsed}>Sign out</NavLabel>
          </SignOutButton>
        </SidebarFooter>
      </Sidebar>
      <Main>
        <MobileMenuBar>
          <MenuButton
            type="button"
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen(true)}
          >
            <NavIcon name="menu" />
          </MenuButton>
        </MobileMenuBar>
        {isMockMode && (
          <MockBanner $variant="warning">
            Mock mode — data is stored locally in your browser, not Supabase.
          </MockBanner>
        )}
        {children}
      </Main>
    </Shell>
  )
}

const NavIcon = ({ name }: { name: NavIconName | 'menu' | 'close' | 'chevronLeft' | 'chevronRight' | 'signOut' }) => (
  <IconSvg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {name === 'dashboard' && (
      <>
        <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
      </>
    )}
    {name === 'time' && (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    )}
    {name === 'clients' && (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    )}
    {name === 'reports' && (
      <>
        <path d="M4 19V9" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19V3" />
      </>
    )}
    {name === 'invoices' && (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h8" />
      </>
    )}
    {name === 'signOut' && (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5M21 12H9" />
      </>
    )}
    {name === 'menu' && (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    )}
    {name === 'close' && (
      <>
        <path d="M6 6l12 12M18 6 6 18" />
      </>
    )}
    {name === 'chevronLeft' && <path d="M15 18l-6-6 6-6" />}
    {name === 'chevronRight' && <path d="M9 18l6-6-6-6" />}
  </IconSvg>
)

// Style Overrides
const Shell = styled.div`
  display: flex;
  min-height: 100vh;
`

const Backdrop = styled.button<{ $open: boolean }>`
  display: none;
  border: none;
  padding: 0;
  cursor: default;

  @media not all and (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 30;
    background: rgb(0 0 0 / 0.4);
    opacity: ${({ $open }) => ($open ? 1 : 0)};
    pointer-events: ${({ $open }) => ($open ? 'auto' : 'none')};
    transition: opacity 0.2s ease;
  }
`

const Sidebar = styled.aside<{ $collapsed: boolean; $drawerOpen: boolean }>`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.tertiary};
  transition: width 0.2s ease, transform 0.2s ease;

  @media not all and (min-width: ${({ theme }) => theme.breakpoints.md}) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 40;
    width: min(16rem, 85vw);
    transform: translateX(${({ $drawerOpen }) => ($drawerOpen ? '0' : '-100%')});
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    width: ${({ $collapsed }) => ($collapsed ? '3.75rem' : '14rem')};
  }
`

const SidebarHeader = styled.div<{ $collapsed: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ $collapsed }) => ($collapsed ? '0.75rem 0.5rem' : '1rem 1.25rem')};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ $collapsed }) => ($collapsed ? '0.75rem 0.5rem' : '1rem 1.25rem')};
  }
`

const HeaderRow = styled.div<{ $collapsed: boolean }>`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    ${({ $collapsed }) =>
      $collapsed &&
      css`
        flex-direction: column;
        align-items: center;
      `}
  }
`

const BrandLink = styled(NavLink)<{ $collapsed: boolean }>`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    ${({ $collapsed }) =>
      $collapsed &&
      css`
        justify-content: center;
        width: 100%;
      `}
  }
`

const BrandText = styled.div<{ $collapsed: boolean }>`
  min-width: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    ${({ $collapsed }) =>
      $collapsed &&
      css`
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `}
  }
`

const HeaderButton = styled.button<{ $desktopOnly?: boolean; $mobileOnly?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.secondary};
  }

  ${({ $desktopOnly }) =>
    $desktopOnly &&
    css`
      @media not all and (min-width: ${({ theme }) => theme.breakpoints.md}) {
        display: none;
      }
    `}

  ${({ $mobileOnly }) =>
    $mobileOnly &&
    css`
      @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
        display: none;
      }
    `}
`

const AppTitle = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.secondary};
`

const AppTagline = styled.p`
  margin: 0.25rem 0 0;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`

const Nav = styled.nav`
  flex: 1;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const navItemStyles = css<{ $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 0.5rem 0.75rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
  color: ${({ theme }) => theme.colors.muted};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    ${({ $collapsed }) =>
      $collapsed &&
      css`
        justify-content: center;
        padding: 0.5rem;
      `}
  }

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.secondary};
  }
`

const NavItem = styled(NavLink)<{ $collapsed: boolean }>`
  ${navItemStyles}

  &.active {
    background: color-mix(in srgb, ${({ theme }) => theme.colors.primary} 12%, ${({ theme }) => theme.colors.tertiary});
    color: ${({ theme }) => theme.colors.primary};
  }
`

const NavLabel = styled.span<{ $collapsed: boolean }>`
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    ${({ $collapsed }) =>
      $collapsed &&
      css`
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `}
  }
`

const SidebarFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.75rem 0.5rem;
`

const SignOutButton = styled.button<{ $collapsed: boolean }>`
  ${navItemStyles}
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
`

const IconSvg = styled.svg`
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
`

const MobileMenuBar = styled.div`
  display: flex;
  margin: -0.25rem 0 1rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: none;
  }
`

const MenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`

const Main = styled.main`
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 1rem 1.5rem 1.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 2rem;
  }
`

const MockBanner = styled(Alert)`
  margin-bottom: 1rem;
`
