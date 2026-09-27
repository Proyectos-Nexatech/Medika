import type { AppRole } from '../types/domain';
export declare const ROLES: Record<AppRole, {
    label: string;
    description: string;
}>;
export declare const PERMISSIONS: {
    PATIENTS_VIEW: AppRole[];
    PATIENTS_CREATE: AppRole[];
    PATIENTS_EDIT: AppRole[];
    PATIENTS_DELETE: AppRole[];
    APPOINTMENTS_VIEW: AppRole[];
    APPOINTMENTS_CREATE: AppRole[];
    APPOINTMENTS_EDIT: AppRole[];
    APPOINTMENTS_CANCEL: AppRole[];
    CONSULTATIONS_VIEW: AppRole[];
    CONSULTATIONS_CREATE: AppRole[];
    CONSULTATIONS_EDIT: AppRole[];
    DOCUMENTS_VIEW: AppRole[];
    DOCUMENTS_CREATE: AppRole[];
    DOCUMENTS_DOWNLOAD: AppRole[];
    BILLING_VIEW: AppRole[];
    BILLING_CREATE: AppRole[];
    BILLING_EDIT: AppRole[];
    SETTINGS_VIEW: AppRole[];
    SETTINGS_EDIT: AppRole[];
    USERS_VIEW: AppRole[];
    USERS_CREATE: AppRole[];
    USERS_EDIT: AppRole[];
    USERS_DELETE: AppRole[];
    DASHBOARD_VIEW: AppRole[];
    REPORTS_VIEW: AppRole[];
};
export declare const hasPermission: (role: AppRole, permission: keyof typeof PERMISSIONS) => boolean;
//# sourceMappingURL=roles.d.ts.map