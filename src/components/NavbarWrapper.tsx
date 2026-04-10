'use client'

import { usePathname } from 'next/navigation'

const EXACTAS_SIN_NAVBAR = ['/']
const PREFIJOS_SIN_NAVBAR = ['/inicio']

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const hide =
    EXACTAS_SIN_NAVBAR.includes(path) ||
    PREFIJOS_SIN_NAVBAR.some((r) => path.startsWith(r))
  if (hide) return null
  return <>{children}</>
}
