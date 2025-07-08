// src/authentication/client/components/AuthProtection.tsx

'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@authentication/client'

interface Props { children: ReactNode }

export function AuthProtection({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/account/signin')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) return null
  return <>{children}</>
}
