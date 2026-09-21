import os

base_dir = r"c:\Users\EQC0670\Medika\apps\web\src\modules"

files = {
    # =========================================================================
    # SERVICES
    # =========================================================================
    "patients/services/patient.service.ts": """import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type Patient = Database['public']['Tables']['patients']['Row'];
export type PatientInsert = Database['public']['Tables']['patients']['Insert'];
export type PatientUpdate = Database['public']['Tables']['patients']['Update'];

export const patientService = {
  async getPatients(organizationId: string) {
    const { data, error } = await supabase.from('patients').select('*').eq('organization_id', organizationId).order('last_name', { ascending: true });
    if (error) throw error;
    return data;
  },
  async createPatient(patient: PatientInsert) {
    const { data, error } = await supabase.from('patients').insert(patient).select().single();
    if (error) throw error;
    return data;
  },
  async updatePatient(id: string, patient: PatientUpdate) {
    const { data, error } = await supabase.from('patients').update(patient).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deletePatient(id: string) {
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
""",
    "professionals/services/professional.service.ts": """import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type Professional = Database['public']['Tables']['professionals']['Row'];
export type ProfessionalInsert = Database['public']['Tables']['professionals']['Insert'];
export type ProfessionalUpdate = Database['public']['Tables']['professionals']['Update'];

export const professionalService = {
  async getProfessionals(organizationId: string) {
    const { data, error } = await supabase.from('professionals').select('*').eq('organization_id', organizationId).order('specialty', { ascending: true });
    if (error) throw error;
    return data;
  },
  async createProfessional(professional: ProfessionalInsert) {
    const { data, error } = await supabase.from('professionals').insert(professional).select().single();
    if (error) throw error;
    return data;
  },
  async updateProfessional(id: string, professional: ProfessionalUpdate) {
    const { data, error } = await supabase.from('professionals').update(professional).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteProfessional(id: string) {
    const { error } = await supabase.from('professionals').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
""",
    "services/services/catalog.service.ts": """import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type MedicalService = Database['public']['Tables']['services']['Row'];
export type MedicalServiceInsert = Database['public']['Tables']['services']['Insert'];
export type MedicalServiceUpdate = Database['public']['Tables']['services']['Update'];

export const catalogService = {
  async getServices(organizationId: string) {
    const { data, error } = await supabase.from('services').select('*').eq('organization_id', organizationId).order('name', { ascending: true });
    if (error) throw error;
    return data;
  },
  async createService(service: MedicalServiceInsert) {
    const { data, error } = await supabase.from('services').insert(service).select().single();
    if (error) throw error;
    return data;
  },
  async updateService(id: string, service: MedicalServiceUpdate) {
    const { data, error } = await supabase.from('services').update(service).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteService(id: string) {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
""",
    # =========================================================================
    # UI COMPONENTS - PATIENTS
    # =========================================================================
    "patients/pages/PatientListPage.tsx": """import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService, Patient, PatientInsert } from '../services/patient.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function PatientListPage() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<Patient | null>(null);

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', organizationId],
    queryFn: () => patientService.getPatients(organizationId!),
    enabled: !!organizationId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientService.deletePatient(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: PatientInsert) => {
      if (editingItem) return patientService.updatePatient(editingItem.id, data);
      return patientService.createPatient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setView('list');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este paciente?')) {
      deleteMutation.mutate(id);
    }
  };

  const openForm = (item?: Patient) => {
    setEditingItem(item || null);
    setView('form');
  };

  if (isLoading) return <div>Cargando pacientes...</div>;

  if (view === 'form') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{editingItem ? 'Editar Paciente' : 'Nuevo Paciente'}</h1>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              saveMutation.mutate({
                organization_id: organizationId!,
                first_name: formData.get('first_name') as string,
                last_name: formData.get('last_name') as string,
                document_type: formData.get('document_type') as any,
                document_number: formData.get('document_number') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                sex: formData.get('sex') as any,
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">Nombre</label><input required name="first_name" defaultValue={editingItem?.first_name} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium">Apellido</label><input required name="last_name" defaultValue={editingItem?.last_name} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div>
                  <label className="block text-sm font-medium">Tipo Documento</label>
                  <select name="document_type" defaultValue={editingItem?.document_type || 'CC'} className="mt-1 block w-full border rounded-md p-2">
                    <option value="CC">Cédula (CC)</option><option value="CE">Cédula Extranjería (CE)</option><option value="TI">Tarjeta Identidad (TI)</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium">Documento</label><input required name="document_number" defaultValue={editingItem?.document_number} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium">Email</label><input type="email" name="email" defaultValue={editingItem?.email || ''} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium">Teléfono</label><input name="phone" defaultValue={editingItem?.phone || ''} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div>
                  <label className="block text-sm font-medium">Sexo</label>
                  <select name="sex" defaultValue={editingItem?.sex || 'M'} className="mt-1 block w-full border rounded-md p-2">
                    <option value="M">Masculino</option><option value="F">Femenino</option><option value="O">Otro</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" disabled={saveMutation.isPending} className="bg-medika-600 text-white px-4 py-2 rounded-md">Guardar</button>
                <button type="button" onClick={() => setView('list')} className="bg-gray-200 px-4 py-2 rounded-md">Cancelar</button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
        <button onClick={() => openForm()} className="bg-medika-600 text-white px-4 py-2 rounded-md font-medium text-sm">+ Nuevo Paciente</button>
      </div>
      <Card>
        <CardHeader><CardTitle>Directorio de Pacientes</CardTitle></CardHeader>
        <CardContent>
          {patients?.length === 0 ? <p>No hay pacientes registrados.</p> : (
            <ul className="space-y-2">
              {patients?.map(p => (
                <li key={p.id} className="p-4 border rounded-md shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{p.first_name} {p.last_name}</p>
                    <p className="text-sm text-slate-500">{p.document_type} {p.document_number} - {p.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openForm(p)} className="text-sky-600 hover:underline text-sm font-medium">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-sm font-medium">Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
""",
    # =========================================================================
    # UI COMPONENTS - PROFESSIONALS
    # =========================================================================
    "professionals/pages/ProfessionalListPage.tsx": """import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { professionalService, Professional, ProfessionalInsert } from '../services/professional.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function ProfessionalListPage() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<Professional | null>(null);

  const { data: professionals, isLoading } = useQuery({
    queryKey: ['professionals', organizationId],
    queryFn: () => professionalService.getProfessionals(organizationId!),
    enabled: !!organizationId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => professionalService.deleteProfessional(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['professionals'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: ProfessionalInsert) => {
      if (editingItem) return professionalService.updateProfessional(editingItem.id, data);
      return professionalService.createProfessional(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      setView('list');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este profesional?')) {
      deleteMutation.mutate(id);
    }
  };

  const openForm = (item?: Professional) => {
    setEditingItem(item || null);
    setView('form');
  };

  if (isLoading) return <div>Cargando profesionales...</div>;

  if (view === 'form') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{editingItem ? 'Editar Profesional' : 'Nuevo Profesional'}</h1>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              saveMutation.mutate({
                organization_id: organizationId!,
                first_name: formData.get('first_name') as string,
                last_name: formData.get('last_name') as string,
                document_type: formData.get('document_type') as string,
                document_number: formData.get('document_number') as string,
                specialty: formData.get('specialty') as string,
                registration_number: formData.get('registration_number') as string,
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">Nombre</label><input required name="first_name" defaultValue={editingItem?.first_name} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium">Apellido</label><input required name="last_name" defaultValue={editingItem?.last_name} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium">Tipo Doc</label><input name="document_type" defaultValue={editingItem?.document_type || 'CC'} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium">Documento</label><input name="document_number" defaultValue={editingItem?.document_number || ''} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium">Especialidad</label><input required name="specialty" defaultValue={editingItem?.specialty || ''} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium">Reg. Médico / Licencia</label><input name="registration_number" defaultValue={editingItem?.registration_number || ''} className="mt-1 block w-full border rounded-md p-2" /></div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" disabled={saveMutation.isPending} className="bg-medika-600 text-white px-4 py-2 rounded-md">Guardar</button>
                <button type="button" onClick={() => setView('list')} className="bg-gray-200 px-4 py-2 rounded-md">Cancelar</button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Profesionales</h1>
        <button onClick={() => openForm()} className="bg-medika-600 text-white px-4 py-2 rounded-md font-medium text-sm">+ Nuevo Profesional</button>
      </div>
      <Card>
        <CardHeader><CardTitle>Directorio Médico</CardTitle></CardHeader>
        <CardContent>
          {professionals?.length === 0 ? <p>No hay profesionales registrados.</p> : (
            <ul className="space-y-2">
              {professionals?.map(p => (
                <li key={p.id} className="p-4 border rounded-md shadow-sm flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{p.first_name} {p.last_name}</p>
                    <p className="text-sm text-slate-500">Especialidad: {p.specialty} | Licencia: {p.registration_number}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openForm(p)} className="text-sky-600 hover:underline text-sm font-medium">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline text-sm font-medium">Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
""",
    # =========================================================================
    # UI COMPONENTS - SERVICES
    # =========================================================================
    "services/pages/ServiceListPage.tsx": """import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService, MedicalService, MedicalServiceInsert } from '../services/catalog.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function ServiceListPage() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<MedicalService | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', organizationId],
    queryFn: () => catalogService.getServices(organizationId!),
    enabled: !!organizationId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteService(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: MedicalServiceInsert) => {
      if (editingItem) return catalogService.updateService(editingItem.id, data);
      return catalogService.createService(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setView('list');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este servicio del catálogo?')) {
      deleteMutation.mutate(id);
    }
  };

  const openForm = (item?: MedicalService) => {
    setEditingItem(item || null);
    setView('form');
  };

  if (isLoading) return <div>Cargando catálogo...</div>;

  if (view === 'form') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{editingItem ? 'Editar Servicio' : 'Nuevo Servicio'}</h1>
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              saveMutation.mutate({
                organization_id: organizationId!,
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                duration_minutes: parseInt(formData.get('duration_minutes') as string, 10),
                price: parseFloat(formData.get('price') as string),
                modality: formData.get('modality') as any,
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium">Nombre del Servicio</label><input required name="name" defaultValue={editingItem?.name} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div className="col-span-2"><label className="block text-sm font-medium">Descripción</label><textarea name="description" defaultValue={editingItem?.description || ''} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium">Duración (minutos)</label><input required type="number" name="duration_minutes" defaultValue={editingItem?.duration_minutes || 30} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div><label className="block text-sm font-medium">Precio ($)</label><input required type="number" name="price" defaultValue={editingItem?.price || 0} className="mt-1 block w-full border rounded-md p-2" /></div>
                <div>
                  <label className="block text-sm font-medium">Modalidad</label>
                  <select name="modality" defaultValue={editingItem?.modality || 'presencial'} className="mt-1 block w-full border rounded-md p-2">
                    <option value="presencial">Presencial</option><option value="virtual">Virtual</option><option value="domicilio">Domicilio</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="submit" disabled={saveMutation.isPending} className="bg-medika-600 text-white px-4 py-2 rounded-md">Guardar</button>
                <button type="button" onClick={() => setView('list')} className="bg-gray-200 px-4 py-2 rounded-md">Cancelar</button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo de Servicios</h1>
        <button onClick={() => openForm()} className="bg-medika-600 text-white px-4 py-2 rounded-md font-medium text-sm">+ Nuevo Servicio</button>
      </div>
      <Card>
        <CardHeader><CardTitle>Servicios Ofrecidos</CardTitle></CardHeader>
        <CardContent>
          {services?.length === 0 ? <p>No hay servicios configurados.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services?.map(s => (
                <div key={s.id} className="p-4 border rounded-md shadow-sm relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => openForm(s)} className="text-sky-600 hover:underline text-sm font-medium">Editar</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:underline text-sm font-medium">Eliminar</button>
                  </div>
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-sm text-slate-500 pr-16">{s.duration_minutes} min | Modalidad: {s.modality}</p>
                  <p className="mt-2 font-bold text-medika-600">${s.price.toLocaleString()}</p>
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
