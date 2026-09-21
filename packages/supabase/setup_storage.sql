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
