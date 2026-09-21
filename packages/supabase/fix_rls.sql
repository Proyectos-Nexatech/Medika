ALTER POLICY "consultations_insert" ON public.consultations 
USING ( true )
WITH CHECK (
  organization_id = ANY(get_user_organizations()) AND 
  get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin', 'professional')
);

ALTER POLICY "consultations_update" ON public.consultations
USING (
  organization_id = ANY(get_user_organizations()) AND 
  get_user_organization_role(auth.uid(), organization_id) IN ('super_admin', 'org_admin', 'professional') AND
  status = 'draft'
);
