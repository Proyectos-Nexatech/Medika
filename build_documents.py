import os

base_dir = r"c:\Users\EQC0670\Medika\apps\web\src\modules"

files = {
    # =========================================================================
    # DOCUMENT SERVICE
    # =========================================================================
    "documents/services/document.service.ts": """import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type PatientDocument = Database['public']['Tables']['patient_documents']['Row'];

export const documentService = {
  async getDocuments(organizationId: string) {
    const { data, error } = await supabase.from('patient_documents')
      .select('*, patients(first_name, last_name, document_number)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  
  async getDocumentsByPatient(patientId: string) {
    const { data, error } = await supabase.from('patient_documents')
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
    
    const { data, error: dbError } = await supabase.from('patient_documents').insert({
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

    const { error: dbError } = await supabase.from('patient_documents').delete().eq('id', id);
    if (dbError) throw dbError;
  }
};
""",
    # =========================================================================
    # DOCUMENT LIST PAGE
    # =========================================================================
    "documents/pages/DocumentListPage.tsx": """import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '../services/document.service';
import { patientService } from '../../patients/services/patient.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function DocumentListPage() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState('');
  const [uploading, setUploading] = useState(false);

  // Queries
  const { data: patients } = useQuery({
    queryKey: ['patients', organizationId],
    queryFn: () => patientService.getPatients(organizationId!),
    enabled: !!organizationId,
  });

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents', organizationId],
    queryFn: () => documentService.getDocuments(organizationId!),
    enabled: !!organizationId,
  });

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentService.uploadDocument(organizationId!, selectedPatient, file),
    onMutate: () => setUploading(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setUploading(false);
      setSelectedPatient('');
    },
    onError: (err: any) => {
      alert(err.message || 'Error al subir documento');
      setUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, path }: { id: string, path: string }) => documentService.deleteDocument(id, path),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['documents'] }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedPatient) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const handleDownload = (path: string) => {
    documentService.downloadDocument(path).catch(() => alert('Error al generar enlace seguro.'));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestor de Documentos</h1>
        
        {/* Upload Button */}
        <div className="relative flex gap-2 items-center bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
          <select 
            value={selectedPatient} 
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="text-sm border-r pr-2 py-1 outline-none bg-transparent"
          >
            <option value="">Selecciona paciente...</option>
            {patients?.map(p => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
            ))}
          </select>
          <label className={`px-4 py-1.5 text-sm font-medium text-white rounded-md cursor-pointer transition-colors ${!selectedPatient || uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-medika-600 hover:bg-medika-700'}`}>
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
            <input 
              type="file" 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png,.zip" 
              disabled={!selectedPatient || uploading}
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Archivos en la Nube</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p>Cargando archivos...</p> : documents?.length === 0 ? <p className="text-slate-500">No hay documentos almacenados.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents?.map((doc: any) => (
                <div key={doc.id} className="p-4 border border-slate-100 rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow flex items-start justify-between">
                  <div className="overflow-hidden pr-4">
                    <p className="font-semibold text-slate-800 truncate" title={doc.file_name}>{doc.file_name}</p>
                    <p className="text-xs text-medika-600 font-medium mb-2">{doc.patients?.first_name} {doc.patients?.last_name}</p>
                    <p className="text-xs text-slate-400">{(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => handleDownload(doc.file_path)} className="text-xs font-semibold bg-sky-50 text-sky-700 px-2 py-1 rounded">
                      Descargar
                    </button>
                    <button onClick={() => { if(confirm('¿Eliminar archivo permanentemente?')) deleteMutation.mutate({id: doc.id, path: doc.file_path}) }} className="text-xs font-semibold bg-red-50 text-red-700 px-2 py-1 rounded">
                      Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
