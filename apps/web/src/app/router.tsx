import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { RegisterPage } from '@/modules/auth/pages/RegisterPage'
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage'
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage'
import { PatientListPage } from '@/modules/patients/pages/PatientListPage'
import { ProfessionalListPage } from '@/modules/professionals/pages/ProfessionalListPage'
import { ServiceListPage } from '@/modules/services/pages/ServiceListPage'
import { AgendaPage } from '@/modules/appointments/pages/AgendaPage'
import { ConsultationListPage } from '@/modules/consultations/pages/ConsultationListPage'
import { ConsultationWorkspace } from '@/modules/consultations/pages/ConsultationWorkspace'
import { DocumentListPage } from '@/modules/documents/pages/DocumentListPage'
import { BillingListPage } from '@/modules/billing/pages/BillingListPage'

export const router = createBrowserRouter([
  // Raíz — redirige al dashboard
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // Auth routes
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to="/auth/login" replace /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },

  // Dashboard routes (protegidas)
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'patients', element: <PatientListPage /> },
      { path: 'professionals', element: <ProfessionalListPage /> },
      { path: 'services', element: <ServiceListPage /> },
      { path: 'appointments', element: <AgendaPage /> },
      { path: 'consultations', element: <ConsultationListPage /> },
      { path: 'workspace/:id', element: <ConsultationWorkspace /> },
      { path: 'documents', element: <DocumentListPage /> },
      { path: 'billing', element: <BillingListPage /> },
      { path: 'settings', element: <div className="p-6"><h1 className="text-2xl font-bold">Configuración</h1><p className="text-muted-foreground mt-2">Módulo disponible próximamente</p></div> },
    ],
  },

  // 404
  {
    path: '*',
    element: <div className="flex h-screen items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-gray-300">404</h1><p className="text-gray-500">Página no encontrada</p></div></div>,
  },
])
