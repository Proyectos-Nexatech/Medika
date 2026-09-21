import type { AppRole } from '../types/domain'

export const ROLES: Record<AppRole, { label: string; description: string }> = {
  super_admin: {
    label: 'Super Administrador',
    description: 'Administrador de la plataforma Medika',
  },
  org_admin: {
    label: 'Administrador',
    description: 'Administrador del consultorio',
  },
  professional: {
    label: 'Profesional',
    description: 'Profesional de salud',
  },
  receptionist: {
    label: 'Recepcionista',
    description: 'Recepcionista / Asistente administrativo',
  },
  patient: {
    label: 'Paciente',
    description: 'Paciente del consultorio',
  },
}

export const PERMISSIONS = {
  // Pacientes
  PATIENTS_VIEW: ['super_admin', 'org_admin', 'professional', 'receptionist'] as AppRole[],
  PATIENTS_CREATE: ['super_admin', 'org_admin', 'professional', 'receptionist'] as AppRole[],
  PATIENTS_EDIT: ['super_admin', 'org_admin', 'professional', 'receptionist'] as AppRole[],
  PATIENTS_DELETE: ['super_admin', 'org_admin'] as AppRole[],

  // Citas
  APPOINTMENTS_VIEW: ['super_admin', 'org_admin', 'professional', 'receptionist'] as AppRole[],
  APPOINTMENTS_CREATE: ['super_admin', 'org_admin', 'professional', 'receptionist'] as AppRole[],
  APPOINTMENTS_EDIT: ['super_admin', 'org_admin', 'professional', 'receptionist'] as AppRole[],
  APPOINTMENTS_CANCEL: ['super_admin', 'org_admin', 'professional', 'receptionist'] as AppRole[],

  // Consultas
  CONSULTATIONS_VIEW: ['super_admin', 'org_admin', 'professional'] as AppRole[],
  CONSULTATIONS_CREATE: ['super_admin', 'professional'] as AppRole[],
  CONSULTATIONS_EDIT: ['super_admin', 'professional'] as AppRole[],

  // Documentos
  DOCUMENTS_VIEW: ['super_admin', 'org_admin', 'professional'] as AppRole[],
  DOCUMENTS_CREATE: ['super_admin', 'professional'] as AppRole[],
  DOCUMENTS_DOWNLOAD: ['super_admin', 'org_admin', 'professional', 'receptionist'] as AppRole[],

  // Facturación
  BILLING_VIEW: ['super_admin', 'org_admin', 'receptionist'] as AppRole[],
  BILLING_CREATE: ['super_admin', 'org_admin', 'receptionist'] as AppRole[],
  BILLING_EDIT: ['super_admin', 'org_admin'] as AppRole[],

  // Configuración
  SETTINGS_VIEW: ['super_admin', 'org_admin'] as AppRole[],
  SETTINGS_EDIT: ['super_admin', 'org_admin'] as AppRole[],

  // Usuarios
  USERS_VIEW: ['super_admin', 'org_admin'] as AppRole[],
  USERS_CREATE: ['super_admin', 'org_admin'] as AppRole[],
  USERS_EDIT: ['super_admin', 'org_admin'] as AppRole[],
  USERS_DELETE: ['super_admin'] as AppRole[],

  // Dashboard
  DASHBOARD_VIEW: ['super_admin', 'org_admin', 'professional', 'receptionist'] as AppRole[],
  REPORTS_VIEW: ['super_admin', 'org_admin'] as AppRole[],
}

export const hasPermission = (role: AppRole, permission: keyof typeof PERMISSIONS): boolean => {
  return PERMISSIONS[permission].includes(role)
}
