import { useState } from 'react';
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
