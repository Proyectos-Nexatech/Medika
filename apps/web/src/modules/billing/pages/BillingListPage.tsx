import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../services/billing.service';
import { patientService } from '../../patients/services/patient.service';
import { useOrganization } from '@/context/OrganizationContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';

export function BillingListPage() {
  const { organizationId } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  
  const [formPat, setFormPat] = useState('');
  const [formConcept, setFormConcept] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStatus, setFormStatus] = useState<'pending' | 'paid'>('pending');
  const [isSaving, setIsSaving] = useState(false);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', organizationId],
    queryFn: () => billingService.getInvoices(organizationId!),
    enabled: !!organizationId,
  });

  const { data: patients } = useQuery({
    queryKey: ['patients', organizationId],
    queryFn: () => patientService.getPatients(organizationId!),
    enabled: !!organizationId && isModalOpen,
  });

  const openCreateModal = () => {
    setEditingInvoice(null);
    setFormPat('');
    setFormConcept('');
    setFormPrice('');
    setFormStatus('pending');
    setIsModalOpen(true);
  };

  const openEditModal = (invoice: any) => {
    let concept = invoice.appointments?.services?.name;
    if (!concept && Array.isArray(invoice.items) && invoice.items.length > 0) {
      concept = invoice.items[0].name;
    }
    setEditingInvoice(invoice);
    setFormPat(invoice.patient_id);
    setFormConcept(concept || '');
    setFormPrice(invoice.total.toString());
    setFormStatus(invoice.status === 'cancelled' ? 'pending' : invoice.status); // fallback if cancelled
    setIsModalOpen(true);
  };

  const createInvoiceMutation = useMutation({
    mutationFn: (newInvoice: any) => billingService.createInvoice(newInvoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsModalOpen(false);
    },
    onSettled: () => setIsSaving(false),
  });
  
  const updateInvoiceMutation = useMutation({
    mutationFn: (data: { id: string, invoice: any }) => billingService.updateInvoice(data.id, data.invoice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsModalOpen(false);
    },
    onSettled: () => setIsSaving(false),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'paid' | 'cancelled' }) => billingService.updateInvoiceStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => billingService.deleteInvoice(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-semibold">Pagada</span>;
      case 'pending': return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold">Pendiente</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Anulada</span>;
      default: return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPat || !formConcept || !formPrice) return;
    setIsSaving(true);

    const priceNum = parseFloat(formPrice);
    
    const payload = {
      patient_id: formPat,
      items: [{ name: formConcept, price: priceNum }],
      subtotal: priceNum,
      total: priceNum,
      status: formStatus,
    };

    if (editingInvoice) {
      updateInvoiceMutation.mutate({ id: editingInvoice.id, invoice: payload });
    } else {
      createInvoiceMutation.mutate({
        ...payload,
        organization_id: organizationId!,
        created_by: user?.id,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
        <button
          onClick={openCreateModal}
          className="bg-medika-600 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-medika-700 transition-colors shadow-sm"
        >
          + Nueva Factura
        </button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium">Factura ID</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Paciente</th>
                  <th className="px-6 py-4 font-medium">Concepto</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-500">Cargando facturas...</td></tr>
                ) : invoices?.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-500">No hay facturas registradas.</td></tr>
                ) : invoices?.map((inv: any) => {
                  
                  let conceptName = inv.appointments?.services?.name;
                  if (!conceptName && Array.isArray(inv.items) && inv.items.length > 0) {
                     conceptName = inv.items[0].name;
                  }
                  
                  return (
                  <tr key={inv.id} className="hover:bg-slate-50 group">
                    <td className="px-6 py-4 font-medium text-slate-900">{inv.id.split('-')[0]}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-900">{inv.patients?.first_name} {inv.patients?.last_name}</td>
                    <td className="px-6 py-4 text-slate-600">{conceptName || 'Servicio General'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(inv.total)}</td>
                    <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                    <td className="px-6 py-4 text-right space-x-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {inv.status === 'pending' && (
                        <button 
                          onClick={() => updateStatusMutation.mutate({ id: inv.id, status: 'paid' })}
                          className="text-emerald-600 hover:text-emerald-800 font-medium text-xs"
                        >
                          Pagar
                        </button>
                      )}
                      
                      <button 
                        onClick={() => openEditModal(inv)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                      >
                        Editar
                      </button>
                      
                      <button 
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar permanentemente esta factura?')) {
                            deleteMutation.mutate(inv.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 font-medium text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL CREAR/EDITAR FACTURA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingInvoice ? 'Editar Factura' : 'Nueva Factura Manual'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSaveInvoice} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Paciente</label>
                <select 
                  required
                  value={formPat}
                  onChange={e => setFormPat(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-medika-500 focus:border-medika-500"
                >
                  <option value="">-- Seleccionar paciente --</option>
                  {patients?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.document_number})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Concepto / Detalle</label>
                <input 
                  type="text"
                  required
                  value={formConcept}
                  onChange={e => setFormConcept(e.target.value)}
                  placeholder="Ej. Copago Consulta General"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-medika-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Valor Total (COP)</label>
                <input 
                  type="number"
                  required
                  min="0"
                  step="1000"
                  value={formPrice}
                  onChange={e => setFormPrice(e.target.value)}
                  placeholder="Ej. 50000"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-medika-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Estado de la Factura</label>
                <select 
                  required
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-medika-500 focus:border-medika-500"
                >
                  <option value="pending">Pendiente de Cobro</option>
                  <option value="paid">Pagada Inmediatamente</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 transition-colors"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSaving || !formPat || !formConcept || !formPrice}
                  className="px-5 py-2 text-sm font-medium text-white bg-medika-600 rounded-md hover:bg-medika-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                  {isSaving ? 'Guardando...' : (editingInvoice ? 'Actualizar' : 'Crear Factura')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
