import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type PatientDocument = Database['public']['Tables']['documents']['Row'];

export const documentService = {
  async getDocuments(organizationId: string) {
    const { data, error } = await supabase.from('documents')
      .select('*, patients(first_name, last_name, document_number)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  async getDocumentsByPatient(patientId: string) {
    const { data, error } = await supabase.from('documents')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async uploadDocument(organizationId: string, patientId: string, file: File) {
    // 1. Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) throw new Error('El archivo excede los 5MB.');

    // 2. Generar path único: organizationId/patientId/timestamp_filename
    const timestamp = new Date().getTime();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = `${organizationId}/${patientId}/${timestamp}_${safeName}`;

    // 3. Subir archivo a Storage
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;

    // 4. Registrar en la base de datos
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error: dbError } = await supabase.from('documents').insert({
      organization_id: organizationId,
      patient_id: patientId,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      content_type: file.type,
      uploaded_by: user.user!.id
    }).select().single();

    if (dbError) throw dbError;
    return data;
  },

  async downloadDocument(filePath: string) {
    const { data, error } = await supabase.storage.from('documents').createSignedUrl(filePath, 60); // 1 minuto
    if (error) throw error;
    if (data) window.open(data.signedUrl, '_blank');
  },

  async deleteDocument(id: string, filePath: string) {
    const { error: storageError } = await supabase.storage.from('documents').remove([filePath]);
    if (storageError) throw storageError;

    const { error: dbError } = await supabase.from('documents').delete().eq('id', id);
    if (dbError) throw dbError;
  }
};
