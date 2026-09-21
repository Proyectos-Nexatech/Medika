DO $$
BEGIN
  DROP POLICY IF EXISTS "consultations_insert" ON public.consultations;
  DROP POLICY IF EXISTS "consultations_update" ON public.consultations;

  CREATE POLICY "consultations_insert" ON public.consultations FOR INSERT
  WITH CHECK (
    organization_id = ANY(get_user_organizations()) AND 
    get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin', 'professional')
  );

  CREATE POLICY "consultations_update" ON public.consultations FOR UPDATE
  USING (
    organization_id = ANY(get_user_organizations()) AND 
    get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin', 'professional') AND
    status = 'draft'
  );
END $$;
