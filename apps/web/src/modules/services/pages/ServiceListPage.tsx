import { useState } from 'react';
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
