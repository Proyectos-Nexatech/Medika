import { useState } from 'react';
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
