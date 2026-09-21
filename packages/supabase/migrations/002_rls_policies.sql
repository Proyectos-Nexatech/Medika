-- ============================================================
-- MEDIKA — Row Level Security (RLS)
-- Migración 002: Políticas de seguridad por organización
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
-- FUNCIÓN helper: obtiene los organization_ids del usuario actual
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

-- Admins pueden actualizar su organización
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
