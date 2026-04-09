'use client'

import { usePathname } from 'next/navigation'

const RUTAS_SIN_NAVBAR = ['/inicio']

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  if (RUTAS_SIN_NAVBAR.some((r) => path.startsWith(r))) return null
  return <>{children}</>
}
