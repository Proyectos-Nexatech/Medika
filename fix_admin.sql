DO $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
  v_public_user_id UUID;
BEGIN
  -- Buscar el usuario por su correo
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'proyectos@nexatech.com.co' LIMIT 1;
  
  -- Crear la organización principal si no existe para no duplicar
  SELECT id INTO v_org_id FROM public.organizations WHERE name = 'Mi Consultorio Medika' LIMIT 1;
  
  IF v_org_id IS NULL THEN
    INSERT INTO public.organizations (name, status)
    VALUES ('Mi Consultorio Medika', 'active')
    RETURNING id INTO v_org_id;
  END IF;

  -- Crear el perfil público del usuario si no existe
  SELECT id INTO v_public_user_id FROM public.users WHERE auth_user_id = v_user_id LIMIT 1;
  
  IF v_public_user_id IS NULL THEN
    INSERT INTO public.users (organization_id, auth_user_id, first_name, last_name, status)
    VALUES (v_org_id, v_user_id, 'Administrador', 'Principal', 'active')
    RETURNING id INTO v_public_user_id;
  END IF;

  -- Asignar el rol de administrador si no lo tiene
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = v_public_user_id) THEN
    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (v_public_user_id, v_org_id, 'org_admin');
  END IF;
END $$;
