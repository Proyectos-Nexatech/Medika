/**
 * Modelos de dominio de Medika
 * Tipos de alto nivel usados en la UI y lógica de negocio
 */
export type AppRole = 'super_admin' | 'org_admin' | 'professional' | 'receptionist' | 'patient';
export type AppointmentStatus = 'pending' | 'confirmed' | 'waiting' | 'attended' | 'cancelled' | 'rescheduled' | 'no_show';
export type DocumentType = 'clinical_record' | 'prescription' | 'medical_order' | 'certificate' | 'referral' | 'consent' | 'result' | 'other';
export type DocumentTypeColombia = 'CC' | 'CE' | 'PA' | 'RC' | 'TI' | 'NIT' | 'AS' | 'MS';
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'other';
export type ServiceModality = 'presencial' | 'virtual' | 'domicilio';
export interface Organization {
    id: string;
    name: string;
    commercialName?: string;
    taxId?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    specialties?: string[];
    status: 'active' | 'inactive' | 'suspended';
}
export interface UserProfile {
    id: string;
    organizationId: string;
    authUserId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string;
    role: AppRole;
    status: 'active' | 'inactive';
}
export interface Patient {
    id: string;
    organizationId: string;
    documentType: DocumentTypeColombia;
    documentNumber: string;
    firstName: string;
    lastName: string;
    fullName: string;
    birthDate?: string;
    age?: number;
    sex?: 'M' | 'F' | 'O';
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    bloodType?: string;
    allergies?: string[];
    observations?: string;
    status: 'active' | 'inactive';
    createdAt: string;
}
export interface Professional {
    id: string;
    organizationId: string;
    userId?: string;
    firstName: string;
    lastName: string;
    fullName: string;
    specialty?: string;
    registrationNumber?: string;
    phone?: string;
    email?: string;
    status: 'active' | 'inactive';
}
export interface Service {
    id: string;
    organizationId: string;
    name: string;
    category?: string;
    description?: string;
    durationMinutes: number;
    price: number;
    modality: ServiceModality;
    status: 'active' | 'inactive';
}
export interface Appointment {
    id: string;
    organizationId: string;
    patientId: string;
    patient?: Patient;
    professionalId: string;
    professional?: Professional;
    serviceId?: string;
    service?: Service;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    notes?: string;
    cancellationReason?: string;
    createdAt: string;
}
export interface DashboardStats {
    totalPatients: number;
    appointmentsToday: number;
    consultationsToday: number;
    monthlyRevenue: number;
    pendingAppointments: number;
    cancelledAppointments: number;
}
//# sourceMappingURL=domain.d.ts.map