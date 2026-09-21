import { LogOut, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useOrganization } from '@/context/OrganizationContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@medika/shared'

export function Header() {
  const { signOut } = useAuth()
  const { profile } = useOrganization()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.organization.logoUrl} />
            <AvatarFallback className="bg-medika-100 text-medika-700 text-xs">
              {profile ? getInitials(profile.fullName) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{profile?.fullName ?? 'Usuario'}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role?.replace('_', ' ') ?? ''}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} title="Cerrar sesión">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
