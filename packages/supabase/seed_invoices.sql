DO $$
DECLARE
  org_id uuid;
  pat1_id uuid;
  pat2_id uuid;
  app1_id uuid;
  app2_id uuid;
  user_id uuid;
BEGIN
  -- Obtener IDs de prueba
  SELECT id INTO org_id FROM public.organizations LIMIT 1;
  SELECT id INTO pat1_id FROM public.patients WHERE organization_id = org_id LIMIT 1 OFFSET 0;
  SELECT id INTO pat2_id FROM public.patients WHERE organization_id = org_id LIMIT 1 OFFSET 1;
  SELECT id INTO user_id FROM public.users LIMIT 1;
  
  SELECT id INTO app1_id FROM public.appointments WHERE organization_id = org_id AND patient_id = pat1_id LIMIT 1;
  SELECT id INTO app2_id FROM public.appointments WHERE organization_id = org_id AND patient_id = pat2_id LIMIT 1;

  -- Insertar algunas facturas si no existen
  IF org_id IS NOT NULL AND user_id IS NOT NULL THEN
      INSERT INTO public.invoices (organization_id, patient_id, appointment_id, items, subtotal, total, status, created_by)
      VALUES 
      (org_id, pat1_id, app1_id, '[{"name": "Consulta de prueba", "price": 120000}]'::jsonb, 120000, 120000, 'pending', user_id),
      (org_id, pat2_id, app2_id, '[{"name": "Revisión especializada", "price": 150000}]'::jsonb, 150000, 150000, 'paid', user_id)
      ON CONFLICT DO NOTHING;
  END IF;
END $$;
