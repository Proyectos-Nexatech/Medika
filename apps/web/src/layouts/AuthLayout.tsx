import { Outlet, Navigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ChevronLeft } from 'lucide-react'

export function AuthLayout() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#80c7ff] via-[#e6f4ff] to-[#b3e0ff] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Top Left Link */}
      <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
        <Link to="/" className="flex items-center text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
          <ChevronLeft className="mr-1 h-5 w-5" />
          Página de inicio
        </Link>
      </div>

      <div className="w-full max-w-md z-10 relative">
        {/* Minimalist Inline Logo */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
            <svg className="h-5 w-5 text-medika-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-widest text-slate-800 uppercase">Medika</h1>
        </div>
        
        <Outlet />
      </div>
      
      {/* Decorative blurred blobs for the fresh look */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
    </div>
  )
}