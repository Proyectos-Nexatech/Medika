DO $DO$
DECLARE
    v_org_id UUID;
    v_user_id UUID;
    v_auth_user_id UUID := 'f3e9cb9e-8f49-478b-a948-de2d77a949db';
    
    v_prof1_id UUID;
    v_prof2_id UUID;
    
    v_serv1_id UUID;
    v_serv2_id UUID;
    v_serv3_id UUID;
    
    v_pat1_id UUID;
    v_pat2_id UUID;
    v_pat3_id UUID;
    v_pat4_id UUID;
    v_pat5_id UUID;
BEGIN
    -- Limpiar si existia organizacion previa para evitar duplicados en las pruebas
    DELETE FROM public.organizations WHERE name = 'Consultorio Nexatech';

    -- 1. Create Organization
    INSERT INTO public.organizations (name, commercial_name, city, phone)
    VALUES ('Consultorio Nexatech', 'Nexatech Salud', 'Bogotá', '+573001234567')
    RETURNING id INTO v_org_id;

    -- 2. Create Public User
    INSERT INTO public.users (organization_id, auth_user_id, first_name, last_name, status)
    VALUES (v_org_id, v_auth_user_id, 'Administrador', 'Nexatech', 'active')
    RETURNING id INTO v_user_id;

    -- 3. Assign Role
    INSERT INTO public.user_roles (user_id, organization_id, role)
    VALUES (v_user_id, v_org_id, 'org_admin');

    -- 4. Create Services
    INSERT INTO public.services (organization_id, name, description, duration_minutes, price, modality, status)
    VALUES (v_org_id, 'Consulta Médica General', 'Valoración médica básica', 30, 80000, 'presencial', 'active')
    RETURNING id INTO v_serv1_id;
    
    INSERT INTO public.services (organization_id, name, description, duration_minutes, price, modality, status)
    VALUES (v_org_id, 'Consulta de Cardiología', 'Valoración especializada', 45, 150000, 'presencial', 'active')
    RETURNING id INTO v_serv2_id;
    
    INSERT INTO public.services (organization_id, name, description, duration_minutes, price, modality, status)
    VALUES (v_org_id, 'Telemedicina General', 'Consulta virtual por videollamada', 30, 60000, 'virtual', 'active')
    RETURNING id INTO v_serv3_id;

    -- 5. Create Professionals (Doctors)
    INSERT INTO public.professionals (organization_id, first_name, last_name, document_type, document_number, specialty, medical_license)
    VALUES (v_org_id, 'Carlos', 'Ramírez', 'CC', '1029384756', 'Médico General', 'RM-98765')
    RETURNING id INTO v_prof1_id;
    
    INSERT INTO public.professionals (organization_id, first_name, last_name, document_type, document_number, specialty, medical_license)
    VALUES (v_org_id, 'Laura', 'Gómez', 'CC', '1092837465', 'Cardióloga', 'RM-12345')
    RETURNING id INTO v_prof2_id;

    -- 6. Create Patients
    INSERT INTO public.patients (organization_id, document_type, document_number, first_name, last_name, email, phone, sex)
    VALUES (v_org_id, 'CC', '123456789', 'Juan', 'Pérez', 'juan.perez@email.com', '3101234567', 'M')
    RETURNING id INTO v_pat1_id;
    
    INSERT INTO public.patients (organization_id, document_type, document_number, first_name, last_name, email, phone, sex)
    VALUES (v_org_id, 'CC', '987654321', 'María', 'Rodríguez', 'maria.r@email.com', '3209876543', 'F')
    RETURNING id INTO v_pat2_id;
    
    INSERT INTO public.patients (organization_id, document_type, document_number, first_name, last_name, email, phone, sex)
    VALUES (v_org_id, 'CE', '112233445', 'John', 'Doe', 'jdoe@email.com', '3001122334', 'M')
    RETURNING id INTO v_pat3_id;
    
    INSERT INTO public.patients (organization_id, document_type, document_number, first_name, last_name, email, phone, sex)
    VALUES (v_org_id, 'CC', '556677889', 'Ana', 'Martínez', 'ana.m@email.com', '3115566778', 'F')
    RETURNING id INTO v_pat4_id;
    
    INSERT INTO public.patients (organization_id, document_type, document_number, first_name, last_name, email, phone, sex)
    VALUES (v_org_id, 'TI', '998877665', 'Luis', 'García', 'luis.g@email.com', '3159988776', 'M')
    RETURNING id INTO v_pat5_id;

    -- 7. Create Appointments (Agenda)
    INSERT INTO public.appointments (organization_id, patient_id, professional_id, service_id, appointment_date, start_time, end_time, status, notes, created_by)
    VALUES (v_org_id, v_pat1_id, v_prof1_id, v_serv1_id, CURRENT_DATE, (CURRENT_DATE + interval '09:00:00'), (CURRENT_DATE + interval '09:30:00'), 'scheduled', 'Primera visita', v_user_id);
    
    INSERT INTO public.appointments (organization_id, patient_id, professional_id, service_id, appointment_date, start_time, end_time, status, notes, created_by)
    VALUES (v_org_id, v_pat2_id, v_prof2_id, v_serv2_id, CURRENT_DATE, (CURRENT_DATE + interval '10:00:00'), (CURRENT_DATE + interval '10:45:00'), 'confirmed', 'Control presión arterial', v_user_id);
    
    INSERT INTO public.appointments (organization_id, patient_id, professional_id, service_id, appointment_date, start_time, end_time, status, notes, created_by)
    VALUES (v_org_id, v_pat3_id, v_prof1_id, v_serv3_id, CURRENT_DATE, (CURRENT_DATE + interval '11:00:00'), (CURRENT_DATE + interval '11:30:00'), 'attended', 'Telemedicina', v_user_id);
    
    INSERT INTO public.appointments (organization_id, patient_id, professional_id, service_id, appointment_date, start_time, end_time, status, notes, created_by)
    VALUES (v_org_id, v_pat4_id, v_prof2_id, v_serv2_id, CURRENT_DATE, (CURRENT_DATE + interval '14:00:00'), (CURRENT_DATE + interval '14:45:00'), 'scheduled', '', v_user_id);
    
    INSERT INTO public.appointments (organization_id, patient_id, professional_id, service_id, appointment_date, start_time, end_time, status, notes, created_by)
    VALUES (v_org_id, v_pat5_id, v_prof1_id, v_serv1_id, CURRENT_DATE, (CURRENT_DATE + interval '15:00:00'), (CURRENT_DATE + interval '15:30:00'), 'cancelled', 'Paciente llamó a cancelar', v_user_id);
    
    INSERT INTO public.appointments (organization_id, patient_id, professional_id, service_id, appointment_date, start_time, end_time, status, notes, created_by)
    VALUES (v_org_id, v_pat1_id, v_prof1_id, v_serv1_id, CURRENT_DATE + interval '1 day', (CURRENT_DATE + interval '1 day 09:00:00'), (CURRENT_DATE + interval '1 day 09:30:00'), 'scheduled', 'Cita mañana', v_user_id);

END;
$DO$;
