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
  ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrganization } from '@/context/OrganizationContext'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'org_admin', 'professional', 'receptionist'] },
  { name: 'Pacientes', href: '/patients', icon: Users, roles: ['super_admin', 'org_admin', 'professional', 'receptionist'] },
  { name: 'Profesionales', href: '/professionals', icon: UserCheck, roles: ['super_admin', 'org_admin'] },
  { name: 'Servicios', href: '/services', icon: ClipboardList, roles: ['super_admin', 'org_admin'] },
  { name: 'Agenda', href: '/appointments', icon: Calendar, roles: ['super_admin', 'org_admin', 'professional', 'receptionist'] },
  { name: 'Consultas', href: '/consultations', icon: Stethoscope, roles: ['super_admin', 'org_admin', 'professional'] },
  { name: 'Documentos', href: '/documents', icon: FileText, roles: ['super_admin', 'org_admin', 'professional'] },
  { name: 'Facturación', href: '/billing', icon: CreditCard, roles: ['super_admin', 'org_admin', 'receptionist'] },
  { name: 'Configuración', href: '/settings', icon: Settings, roles: ['super_admin', 'org_admin'] },
] as const

export function Sidebar() {
  const { userRole, profile } = useOrganization()

  const visibleNav = navigation.filter(
    (item) => userRole && (item.roles as readonly string[]).includes(userRole)
  )

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-medika-600">
          <Activity className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {profile?.organization.commercialName ?? profile?.organization.name ?? 'Medika'}
          </p>
          <p className="text-xs text-gray-500">Consultorio</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {visibleNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-medika-50 text-medika-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Version */}
      <div className="border-t p-4">
        <p className="text-xs text-gray-400">Medika v1.0.0</p>
      </div>
    </aside>
  )
}
