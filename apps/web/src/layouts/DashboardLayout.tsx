import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useOrganization } from '@/context/OrganizationContext'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function DashboardLayout() {
  const { session, loading: authLoading } = useAuth()
  const { loading: orgLoading } = useOrganization()

  if (authLoading || orgLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#e2e8f0]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-medika-600 border-t-transparent" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />
  }

  return (
    <div className="flex h-screen w-full bg-[#1e293b] p-1.5 sm:p-2 overflow-hidden">
      <div className="flex w-full h-full bg-slate-50 rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-2xl relative">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}