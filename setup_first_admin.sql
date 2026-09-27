DO $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
BEGIN
  -- Buscar el usuario que acabas de crear
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Aún no has creado ningún usuario en Authentication';
  END IF;

  -- Crear la organización principal
  INSERT INTO public.organizations (name, status)
  VALUES ('Mi Consultorio Medika', 'active')
  RETURNING id INTO v_org_id;

  -- Crear el perfil público del usuario
  INSERT INTO public.users (organization_id, auth_user_id, first_name, last_name, status)
  VALUES (v_org_id, v_user_id, 'Administrador', 'Principal', 'active');

  -- Asignar el rol de administrador
  INSERT INTO public.user_roles (user_id, organization_id, role)
  VALUES (
    (SELECT id FROM public.users WHERE auth_user_id = v_user_id),
    v_org_id,
    'org_admin'
  );
END $$;
