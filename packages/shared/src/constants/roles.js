export const ROLES = {
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
};
export const PERMISSIONS = {
    // Pacientes
    PATIENTS_VIEW: ['super_admin', 'org_admin', 'professional', 'receptionist'],
    PATIENTS_CREATE: ['super_admin', 'org_admin', 'professional', 'receptionist'],
    PATIENTS_EDIT: ['super_admin', 'org_admin', 'professional', 'receptionist'],
    PATIENTS_DELETE: ['super_admin', 'org_admin'],
    // Citas
    APPOINTMENTS_VIEW: ['super_admin', 'org_admin', 'professional', 'receptionist'],
    APPOINTMENTS_CREATE: ['super_admin', 'org_admin', 'professional', 'receptionist'],
    APPOINTMENTS_EDIT: ['super_admin', 'org_admin', 'professional', 'receptionist'],
    APPOINTMENTS_CANCEL: ['super_admin', 'org_admin', 'professional', 'receptionist'],
    // Consultas
    CONSULTATIONS_VIEW: ['super_admin', 'org_admin', 'professional'],
    CONSULTATIONS_CREATE: ['super_admin', 'professional'],
    CONSULTATIONS_EDIT: ['super_admin', 'professional'],
    // Documentos
    DOCUMENTS_VIEW: ['super_admin', 'org_admin', 'professional'],
    DOCUMENTS_CREATE: ['super_admin', 'professional'],
    DOCUMENTS_DOWNLOAD: ['super_admin', 'org_admin', 'professional', 'receptionist'],
    // Facturación
    BILLING_VIEW: ['super_admin', 'org_admin', 'receptionist'],
    BILLING_CREATE: ['super_admin', 'org_admin', 'receptionist'],
    BILLING_EDIT: ['super_admin', 'org_admin'],
    // Configuración
    SETTINGS_VIEW: ['super_admin', 'org_admin'],
    SETTINGS_EDIT: ['super_admin', 'org_admin'],
    // Usuarios
    USERS_VIEW: ['super_admin', 'org_admin'],
    USERS_CREATE: ['super_admin', 'org_admin'],
    USERS_EDIT: ['super_admin', 'org_admin'],
    USERS_DELETE: ['super_admin'],
    // Dashboard
    DASHBOARD_VIEW: ['super_admin', 'org_admin', 'professional', 'receptionist'],
    REPORTS_VIEW: ['super_admin', 'org_admin'],
};
export const hasPermission = (role, permission) => {
    return PERMISSIONS[permission].includes(role);
};
//# sourceMappingURL=roles.js.map