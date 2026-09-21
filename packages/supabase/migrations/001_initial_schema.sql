-- ============================================================
-- MEDIKA — Schema Inicial
-- Migración 001: Tablas principales del sistema
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
-- USER_ROLES (Roles por organización)
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
-- CONSULTATIONS (Registros de consulta clínica)
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
-- DOCUMENTS (Documentos clínicos)
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
-- AUDIT_LOGS (Auditoría)
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
-- HELPER FUNCTION: obtiene el rol del usuario en una organización
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
