-- ============================================================
-- MEDIKA â€” Schema Inicial
-- MigraciÃ³n 001: Tablas principales del sistema
-- ============================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE app_role AS ENUM (
  'super_admin',
  'org_admin',
  'professional',
  'receptionist',
  'patient'
);

CREATE TYPE entity_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'waiting',
  'attended',
  'cancelled',
  'rescheduled',
  'no_show'
);

CREATE TYPE document_id_type AS ENUM (
  'CC', 'CE', 'PA', 'RC', 'TI', 'NIT', 'AS', 'MS'
);

CREATE TYPE document_type AS ENUM (
  'clinical_record',
  'prescription',
  'medical_order',
  'certificate',
  'referral',
  'consent',
  'result',
  'other'
);

CREATE TYPE service_modality AS ENUM ('presencial', 'virtual', 'domicilio');

CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'partial', 'cancelled');

CREATE TYPE payment_method AS ENUM ('cash', 'transfer', 'card', 'other');

CREATE TYPE consultation_status AS ENUM ('draft', 'completed', 'signed');

-- ============================================================
-- ORGANIZATIONS (Consultorios / Tenants)
-- ============================================================

CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  commercial_name TEXT,
  tax_id          TEXT,
  address         TEXT,
  city            TEXT,
  phone           TEXT,
  email           TEXT,
  logo_url        TEXT,
  website         TEXT,
  specialties     TEXT[],
  settings        JSONB DEFAULT '{}',
  status          entity_status NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USERS (Perfil de usuario vinculado a auth.users)
-- ============================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  auth_user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, auth_user_id)
);

-- ============================================================
-- USER_ROLES (Roles por organizaciÃ³n)
-- ============================================================

CREATE TABLE user_roles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role            app_role NOT NULL DEFAULT 'receptionist',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- ============================================================
-- PROFESSIONALS
-- ============================================================

CREATE TABLE professionals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id             UUID REFERENCES users(id),
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  document_type       document_id_type,
  document_number     TEXT,
  specialty           TEXT,
  registration_number TEXT,
  phone               TEXT,
  email               TEXT,
  schedule            JSONB DEFAULT '{}',
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PATIENTS
-- ============================================================

CREATE TABLE patients (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_type             document_id_type NOT NULL,
  document_number           TEXT NOT NULL,
  first_name                TEXT NOT NULL,
  last_name                 TEXT NOT NULL,
  birth_date                DATE,
  sex                       CHAR(1) CHECK (sex IN ('M', 'F', 'O')),
  phone                     TEXT,
  email                     TEXT,
  address                   TEXT,
  city                      TEXT,
  emergency_contact_name    TEXT,
  emergency_contact_phone   TEXT,
  blood_type                TEXT,
  allergies                 TEXT[],
  observations              TEXT,
  status                    TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, document_type, document_number)
);

-- ============================================================
-- SERVICES
-- ============================================================

CREATE TABLE services (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  category         TEXT,
  description      TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price            NUMERIC(12, 2) NOT NULL DEFAULT 0,
  modality         service_modality NOT NULL DEFAULT 'presencial',
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPOINTMENTS (Citas)
-- ============================================================

CREATE TABLE appointments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id          UUID NOT NULL REFERENCES patients(id),
  professional_id     UUID NOT NULL REFERENCES professionals(id),
  service_id          UUID REFERENCES services(id),
  appointment_date    DATE NOT NULL,
  start_time          TIME NOT NULL,
  end_time            TIME NOT NULL,
  status              appointment_status NOT NULL DEFAULT 'pending',
  notes               TEXT,
  cancellation_reason TEXT,
  created_by          UUID NOT NULL REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ============================================================
-- CONSULTATIONS (Registros de consulta clÃ­nica)
-- ============================================================

CREATE TABLE consultations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  appointment_id   UUID REFERENCES appointments(id),
  patient_id       UUID NOT NULL REFERENCES patients(id),
  professional_id  UUID NOT NULL REFERENCES professionals(id),
  reason           TEXT,
  current_illness  TEXT,
  background       JSONB DEFAULT '{}',
  vital_signs      JSONB DEFAULT '{}',
  physical_exam    TEXT,
  findings         TEXT,
  diagnosis        JSONB DEFAULT '[]',
  treatment_plan   TEXT,
  treatment        TEXT,
  recommendations  TEXT,
  observations     TEXT,
  status           consultation_status NOT NULL DEFAULT 'draft',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS (Documentos clÃ­nicos)
-- ============================================================

CREATE TABLE documents (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES patients(id),
  consultation_id  UUID REFERENCES consultations(id),
  document_type    document_type NOT NULL,
  title            TEXT NOT NULL,
  storage_path     TEXT,
  metadata         JSONB DEFAULT '{}',
  created_by       UUID NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INVOICES (Facturas)
-- ============================================================

CREATE TABLE invoices (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id       UUID NOT NULL REFERENCES patients(id),
  appointment_id   UUID REFERENCES appointments(id),
  items            JSONB NOT NULL DEFAULT '[]',
  subtotal         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total            NUMERIC(12, 2) NOT NULL DEFAULT 0,
  status           invoice_status NOT NULL DEFAULT 'pending',
  notes            TEXT,
  created_by       UUID NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS (Pagos)
-- ============================================================

CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id       UUID NOT NULL REFERENCES invoices(id),
  amount           NUMERIC(12, 2) NOT NULL,
  payment_method   payment_method NOT NULL DEFAULT 'cash',
  reference        TEXT,
  notes            TEXT,
  created_by       UUID NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUDIT_LOGS (AuditorÃ­a)
-- ============================================================

CREATE TABLE audit_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id  UUID REFERENCES organizations(id),
  user_id          UUID REFERENCES users(id),
  action           TEXT NOT NULL,
  table_name       TEXT,
  record_id        UUID,
  old_data         JSONB,
  new_data         JSONB,
  ip_address       INET,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_professionals_updated_at BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- HELPER FUNCTION: obtiene el rol del usuario en una organizaciÃ³n
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_organization_role(p_user_id UUID, p_organization_id UUID)
RETURNS app_role AS $$
DECLARE
  v_role app_role;
BEGIN
  SELECT ur.role INTO v_role
  FROM user_roles ur
  JOIN users u ON u.id = ur.user_id
  WHERE u.auth_user_id = p_user_id
    AND ur.organization_id = p_organization_id;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- MEDIKA â€” Row Level Security (RLS)
-- MigraciÃ³n 002: PolÃ­ticas de seguridad por organizaciÃ³n
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNCIÃ“N helper: obtiene los organization_ids del usuario actual
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_organizations()
RETURNS UUID[] AS $$
DECLARE
  v_orgs UUID[];
BEGIN
  SELECT ARRAY_AGG(ur.organization_id) INTO v_orgs
  FROM user_roles ur
  JOIN users u ON u.id = ur.user_id
  WHERE u.auth_user_id = auth.uid();
  RETURN COALESCE(v_orgs, ARRAY[]::UUID[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ORGANIZATIONS
-- ============================================================

-- Ver solo las organizaciones donde el usuario tiene un rol
CREATE POLICY "organizations_select" ON organizations
  FOR SELECT USING (id = ANY(get_user_organizations()));

-- Solo super_admin puede crear organizaciones
CREATE POLICY "organizations_insert" ON organizations
  FOR INSERT WITH CHECK (FALSE); -- Manejado por Edge Function o admin directo

-- Admins pueden actualizar su organizaciÃ³n
CREATE POLICY "organizations_update" ON organizations
  FOR UPDATE USING (
    id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), id) IN ('super_admin', 'org_admin')
  );

-- ============================================================
-- USERS
-- ============================================================

CREATE POLICY "users_select" ON users
  FOR SELECT USING (organization_id = ANY(get_user_organizations()));

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (organization_id = ANY(get_user_organizations()));

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (
    organization_id = ANY(get_user_organizations())
    AND (
      auth_user_id = auth.uid() -- puede editar su propio perfil
      OR get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin')
    )
  );

-- ============================================================
-- USER_ROLES
-- ============================================================

CREATE POLICY "user_roles_select" ON user_roles
  FOR SELECT USING (organization_id = ANY(get_user_organizations()));

CREATE POLICY "user_roles_insert" ON user_roles
  FOR INSERT WITH CHECK (
    get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin')
  );

CREATE POLICY "user_roles_update" ON user_roles
  FOR UPDATE USING (
    get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin')
  );

-- ============================================================
-- PROFESSIONALS
-- ============================================================

CREATE POLICY "professionals_select" ON professionals
  FOR SELECT USING (organization_id = ANY(get_user_organizations()));

CREATE POLICY "professionals_insert" ON professionals
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin')
  );

CREATE POLICY "professionals_update" ON professionals
  FOR UPDATE USING (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin')
  );

-- ============================================================
-- PATIENTS
-- ============================================================

CREATE POLICY "patients_select" ON patients
  FOR SELECT USING (organization_id = ANY(get_user_organizations()));

CREATE POLICY "patients_insert" ON patients
  FOR INSERT WITH CHECK (organization_id = ANY(get_user_organizations()));

CREATE POLICY "patients_update" ON patients
  FOR UPDATE USING (organization_id = ANY(get_user_organizations()));

CREATE POLICY "patients_delete" ON patients
  FOR DELETE USING (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin')
  );

-- ============================================================
-- SERVICES
-- ============================================================

CREATE POLICY "services_select" ON services
  FOR SELECT USING (organization_id = ANY(get_user_organizations()));

CREATE POLICY "services_insert" ON services
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin')
  );

CREATE POLICY "services_update" ON services
  FOR UPDATE USING (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin')
  );

-- ============================================================
-- APPOINTMENTS
-- ============================================================

CREATE POLICY "appointments_select" ON appointments
  FOR SELECT USING (organization_id = ANY(get_user_organizations()));

CREATE POLICY "appointments_insert" ON appointments
  FOR INSERT WITH CHECK (organization_id = ANY(get_user_organizations()));

CREATE POLICY "appointments_update" ON appointments
  FOR UPDATE USING (organization_id = ANY(get_user_organizations()));

-- ============================================================
-- CONSULTATIONS (Solo profesionales y admins)
-- ============================================================

CREATE POLICY "consultations_select" ON consultations
  FOR SELECT USING (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin', 'professional')
  );

CREATE POLICY "consultations_insert" ON consultations
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'professional')
  );

CREATE POLICY "consultations_update" ON consultations
  FOR UPDATE USING (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'professional')
    AND status = 'draft'
  );

-- ============================================================
-- DOCUMENTS
-- ============================================================

CREATE POLICY "documents_select" ON documents
  FOR SELECT USING (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin', 'professional')
  );

CREATE POLICY "documents_insert" ON documents
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'professional')
  );

-- ============================================================
-- INVOICES
-- ============================================================

CREATE POLICY "invoices_select" ON invoices
  FOR SELECT USING (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin', 'receptionist')
  );

CREATE POLICY "invoices_insert" ON invoices
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin', 'receptionist')
  );

CREATE POLICY "invoices_update" ON invoices
  FOR UPDATE USING (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin', 'receptionist')
  );

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE POLICY "payments_select" ON payments
  FOR SELECT USING (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin', 'receptionist')
  );

CREATE POLICY "payments_insert" ON payments
  FOR INSERT WITH CHECK (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin', 'receptionist')
  );

-- ============================================================
-- AUDIT_LOGS (solo lectura para admins)
-- ============================================================

CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT USING (
    organization_id = ANY(get_user_organizations())
    AND get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin')
  );

CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT WITH CHECK (TRUE); -- Insertado por triggers del sistema

-- ============================================================
-- MEDIKA â€” Ãndices de rendimiento
-- MigraciÃ³n 003: Ãndices principales
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

-- Crear tabla de registro de documentos
CREATE TABLE IF NOT EXISTS public.patient_documents (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) not null,
    patient_id uuid references public.patients(id) not null,
    file_name text not null,
    file_path text not null,
    file_size integer,
    content_type text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS de la tabla
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "patient_documents_access" ON public.patient_documents;
CREATE POLICY "patient_documents_access" ON public.patient_documents
USING (organization_id = ANY (get_user_organizations()));

-- Configurar Storage Bucket de Supabase
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS para Storage Objects (permite a autenticados interactuar con el bucket)
DROP POLICY IF EXISTS "Auth users can access documents" ON storage.objects;
CREATE POLICY "Auth users can access documents" ON storage.objects
FOR ALL USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

