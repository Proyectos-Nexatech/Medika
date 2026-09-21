-- ============================================================
-- MEDIKA — Índices de rendimiento
-- Migración 003: Índices principales
-- ============================================================

-- users
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);

-- user_roles
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_organization_id ON user_roles(organization_id);

-- professionals
CREATE INDEX idx_professionals_organization_id ON professionals(organization_id);

-- patients
CREATE INDEX idx_patients_organization_id ON patients(organization_id);
CREATE INDEX idx_patients_document_number ON patients(document_number);
CREATE INDEX idx_patients_status ON patients(organization_id, status);

-- services
CREATE INDEX idx_services_organization_id ON services(organization_id);

-- appointments
CREATE INDEX idx_appointments_organization_id ON appointments(organization_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX idx_appointments_date ON appointments(organization_id, appointment_date);
CREATE INDEX idx_appointments_status ON appointments(organization_id, status);

-- consultations
CREATE INDEX idx_consultations_organization_id ON consultations(organization_id);
CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_professional_id ON consultations(professional_id);

-- documents
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_patient_id ON documents(patient_id);

-- invoices
CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_invoices_patient_id ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(organization_id, status);

-- payments
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);

-- audit_logs
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
