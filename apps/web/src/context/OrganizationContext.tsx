import React, { createContext, useContext, useEffect, useState } from 'react'
import type { AppRole } from '@medika/shared'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthContext'

interface OrganizationProfile {
  id: string
  organizationId: string
  firstName: string
  lastName: string
  fullName: string
  role: AppRole
  organization: {
    id: string
    name: string
    commercialName?: string
    logoUrl?: string
  }
}

interface OrganizationContextValue {
  profile: OrganizationProfile | null
  loading: boolean
  organizationId: string | null
  userRole: AppRole | null
  hasRole: (...roles: AppRole[]) => boolean
  refreshProfile: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<OrganizationProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          organization_id,
          organizations (
            id,
            name,
            commercial_name,
            logo_url
          ),
          user_roles (
            role
          )
        `)
        .eq('auth_user_id', user.id)
        .single()

      if (error || !data) {
        console.error('Error fetching profile:', error)
        setProfile(null)
        return
      }

      const org = Array.isArray(data.organizations) ? data.organizations[0] : data.organizations
      const roleRow = Array.isArray(data.user_roles) ? data.user_roles[0] : data.user_roles

      setProfile({
        id: data.id,
        organizationId: data.organization_id,
        firstName: data.first_name,
        lastName: data.last_name,
        fullName: `${data.first_name} ${data.last_name}`,
        role: (roleRow?.role as AppRole) ?? 'receptionist',
        organization: {
          id: org?.id ?? '',
          name: org?.name ?? '',
          commercialName: org?.commercial_name ?? undefined,
          logoUrl: org?.logo_url ?? undefined,
        },
      })
    } catch (err) {
      console.error('Error fetching profile:', err)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchProfile()
    }
  }, [user, authLoading])

  const hasRole = (...roles: AppRole[]): boolean => {
    if (!profile) return false
    return roles.includes(profile.role)
  }

  return (
    <OrganizationContext.Provider
      value={{
        profile,
        loading,
        organizationId: profile?.organizationId ?? null,
        userRole: profile?.role ?? null,
        hasRole,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}
