import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  Stethoscope,
  FileText,
  CreditCard,
  Settings,
  Activity,
  ClipboardList,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrganization } from '@/context/OrganizationContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'org_admin', 'professional', 'receptionist'] },
  { name: 'Pacientes', href: '/patients', icon: Users, roles: ['super_admin', 'org_admin', 'professional', 'receptionist'] },
  { name: 'Agenda', href: '/appointments', icon: Calendar, roles: ['super_admin', 'org_admin', 'professional', 'receptionist'] },
  { name: 'Consultas', href: '/consultations', icon: Stethoscope, roles: ['super_admin', 'org_admin', 'professional'] },
  { name: 'Profesionales', href: '/professionals', icon: UserCheck, roles: ['super_admin', 'org_admin'] },
  { name: 'Servicios', href: '/services', icon: ClipboardList, roles: ['super_admin', 'org_admin'] },
  { name: 'Facturación', href: '/billing', icon: CreditCard, roles: ['super_admin', 'org_admin', 'receptionist'] },
  { name: 'Documentos', href: '/documents', icon: FileText, roles: ['super_admin', 'org_admin', 'professional'] },
  { name: 'Configuración', href: '/settings', icon: Settings, roles: ['super_admin', 'org_admin'] },
] as const

export function Sidebar() {
  const { userRole, profile } = useOrganization()

  const visibleNav = navigation.filter(
    (item) => userRole && (item.roles as readonly string[]).includes(userRole)
  )

  return (
    <aside className="flex h-full w-64 flex-col bg-white rounded-l-[32px] sm:rounded-l-[40px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 relative">
      {/* Logo */}
      <div className="flex h-24 items-center gap-3 px-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-medika-600 shadow-md shadow-medika-200">
          <Plus className="h-5 w-5 text-white stroke-[3]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[22px] font-extrabold text-slate-800 tracking-tight">
            {profile?.organization.commercialName ?? profile?.organization.name?.split(' ')[0] ?? 'Medika'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-5 overflow-y-auto py-2 scrollbar-hide">
        {visibleNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[14px] font-semibold transition-all duration-200',
                isActive
                  ? 'bg-medika-600 text-white shadow-md shadow-medika-200'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-medika-600'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0 stroke-[2]" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Widget */}
      <div className="p-5 mt-auto">
        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 text-center">
          <p className="text-[13px] font-bold text-slate-800 mb-3">Consulta Gratis</p>
          <div className="flex flex-col items-center justify-center gap-2 mb-4">
            <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
              <AvatarFallback className="bg-medika-100 text-medika-700">SR</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-[12px] font-bold text-slate-800">Soporte Técnico</p>
              <p className="text-[10px] font-medium text-slate-500">Lunes a Viernes</p>
            </div>
          </div>
          <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-600 font-semibold text-xs h-9 hover:bg-white">
            Programar
          </Button>
        </div>
      </div>
    </aside>
  )
}