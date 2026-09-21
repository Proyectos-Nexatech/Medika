-- ============================================================
-- MEDIKA — Seed de desarrollo
-- Datos iniciales para ambiente de desarrollo y pruebas
-- ============================================================

-- Organización de ejemplo
INSERT INTO organizations (id, name, commercial_name, tax_id, address, city, phone, email, specialties)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Consultorio Demo S.A.S.',
  'Medika Demo',
  '900123456-7',
  'Calle 123 # 45-67',
  'Bogotá',
  '3001234567',
  'demo@medika.com',
  ARRAY['Medicina General', 'Pediatría']
);

-- Servicios de ejemplo
INSERT INTO services (organization_id, name, category, duration_minutes, price, modality)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Consulta General', 'Consulta', 30, 80000, 'presencial'),
  ('00000000-0000-0000-0000-000000000001', 'Consulta Pediátrica', 'Consulta', 30, 90000, 'presencial'),
  ('00000000-0000-0000-0000-000000000001', 'Control', 'Control', 20, 50000, 'presencial'),
  ('00000000-0000-0000-0000-000000000001', 'Consulta Virtual', 'Consulta', 30, 70000, 'virtual');
