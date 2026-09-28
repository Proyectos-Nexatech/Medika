import { Bell, LogOut, MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useOrganization } from '@/context/OrganizationContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@medika/shared'

export function Header() {
  const { signOut } = useAuth()
  const { profile } = useOrganization()

  return (
    <header className="flex h-20 items-center justify-between px-8 bg-transparent">
      <div className="flex flex-col">
        {/* Placeholder for future breadcrumbs or left side elements */}
      </div>
      
      <div className="flex items-center gap-5">
        <Button variant="default" className="rounded-full bg-medika-600 hover:bg-medika-700 text-white font-semibold shadow-md shadow-medika-200/50 px-6 h-10 hidden sm:flex">
          <span className="mr-2">✨</span> Upgrade Now
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-medika-600">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-medika-600 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 rounded-full bg-red-500 border border-white"></span>
          </Button>
        </div>

        <div className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.organization.logoUrl} />
            <AvatarFallback className="bg-medika-100 text-medika-700 text-xs font-bold">
              {profile ? getInitials(profile.fullName) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-[13px] font-bold text-slate-800 leading-tight">{profile?.fullName ?? 'Usuario'}</p>
            <p className="text-[11px] font-medium text-slate-500 capitalize leading-tight">{profile?.role?.replace('_', ' ') ?? ''}</p>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" onClick={signOut} className="text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}