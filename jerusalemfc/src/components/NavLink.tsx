'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

// Lien du menu, marqué comme page courante (soulignement doré) quand l'adresse correspond.
export function NavLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const current = pathname != null && decodeURI(pathname).replace(/\/$/, '') === href
  return (
    <Link href={href} className={className} aria-current={current ? 'page' : undefined}>
      {children}
    </Link>
  )
}
