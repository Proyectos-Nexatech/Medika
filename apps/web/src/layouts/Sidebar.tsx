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
  ClipboardList,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrganization } from '@/context/OrganizationContext'

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
    <aside className="flex h-full w-60 flex-col bg-white rounded-l-[20px] sm:rounded-l-[24px] shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 relative">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-6 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-medika-600 shadow-sm shadow-medika-200">
          <Plus className="h-4 w-4 text-white stroke-[3]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[20px] font-extrabold text-slate-800 tracking-tight">
            {profile?.organization.commercialName ?? profile?.organization.name?.split(' ')[0] ?? 'Medika'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 overflow-y-auto pb-4 scrollbar-hide">
        {visibleNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-2xl px-4 py-3 text-[13.5px] font-semibold transition-all duration-200',
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
    </aside>
  )
}