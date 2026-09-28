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
    <header className="flex h-16 items-center justify-between px-6 bg-transparent shrink-0">
      <div className="flex flex-col">
        {/* Placeholder for future breadcrumbs */}
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="default" className="rounded-full bg-medika-600 hover:bg-medika-700 text-white font-semibold shadow-sm shadow-medika-200/50 px-5 h-9 hidden sm:flex text-[13px]">
          <span className="mr-1.5">✨</span> Upgrade Now
        </Button>
        
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-medika-600 h-9 w-9">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-500 hover:text-medika-600 relative h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500 border border-white"></span>
          </Button>
        </div>

        <div className="flex items-center gap-2.5 bg-white pl-1.5 pr-3 py-1.5 rounded-full shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all">
          <Avatar className="h-7 w-7">
            <AvatarImage src={profile?.organization.logoUrl} />
            <AvatarFallback className="bg-medika-100 text-medika-700 text-[10px] font-bold">
              {profile ? getInitials(profile.fullName) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-[12.5px] font-bold text-slate-800 leading-none mb-0.5">{profile?.fullName ?? 'Usuario'}</p>
            <p className="text-[10px] font-medium text-slate-500 capitalize leading-none">{profile?.role?.replace('_', ' ') ?? ''}</p>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" onClick={signOut} className="text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 h-9 w-9">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}