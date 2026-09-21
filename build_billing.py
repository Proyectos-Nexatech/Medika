import os

base_dir = r"c:\Users\EQC0670\Medika\apps\web\src\modules"

files = {
    # =========================================================================
    # BILLING SERVICE
    # =========================================================================
    "billing/services/billing.service.ts": """import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert'];

export const billingService = {
  async getInvoices(organizationId: string) {
    const { data, error } = await supabase.from('invoices')
      .select('*, patients(first_name, last_name, document_number), appointments(appointment_date, services(name))')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createInvoice(invoice: InvoiceInsert) {
    const { data, error } = await supabase.from('invoices').insert(invoice).select().single();
    if (error) throw error;
    return data;
  },

  async updateInvoiceStatus(id: string, status: 'pending' | 'paid' | 'partial' | 'cancelled') {
    const { data, error } = await supabase.from('invoices').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  
  async getDashboardMetrics(organizationId: string) {
    // 1. Total Patients
    const { count: patientCount } = await supabase.from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);
      
    // 2. Appointments Today
    const today = new Date().toISOString().split('T')[0];
    const { count: appointmentsToday } = await supabase.from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('appointment_date', today);
      
    // 3. Revenue (Paid Invoices Total)
    const { data: paidInvoices } = await supabase.from('invoices')
      .select('total')
      .eq('organization_id', organizationId)
      .eq('status', 'paid');
    
    const totalRevenue = paidInvoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
    
    return {
      patients: patientCount || 0,
      appointmentsToday: appointmentsToday || 0,
      revenue: totalRevenue
    };
  }
};
""",

    # =========================================================================
    # BILLING LIST PAGE
    # =========================================================================
    "billing/pages/BillingListPage.tsx": """import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingService } from '../services/billing.service';
import { useOrganization } from '@/context/OrganizationContext';
import { Card, CardContent } from '@/components/ui/card';

export function BillingListPage() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices', organizationId],
    queryFn: () => billingService.getInvoices(organizationId!),
    enabled: !!organizationId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'paid' | 'cancelled' }) => billingService.updateInvoiceStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices'] }),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'paid': return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-semibold">Pagado</span>;
      case 'pending': return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-semibold">Pendiente</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">Cancelado</span>;
      default: return <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
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
                ) : invoices?.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{inv.id.split('-')[0]}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-900">{inv.patients?.first_name} {inv.patients?.last_name}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.appointments?.services?.name || 'Servicio General'}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatCurrency(inv.total)}</td>
                    <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {inv.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: inv.id, status: 'paid' })}
                            className="text-emerald-600 hover:text-emerald-800 font-medium text-xs"
                          >
                            Marcar Pagada
                          </button>
                          <button 
                            onClick={() => updateStatusMutation.mutate({ id: inv.id, status: 'cancelled' })}
                            className="text-red-600 hover:text-red-800 font-medium text-xs"
                          >
                            Anular
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
""",

    # =========================================================================
    # DASHBOARD PAGE
    # =========================================================================
    "dashboard/pages/DashboardPage.tsx": """import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/context/OrganizationContext';
import { billingService } from '../../billing/services/billing.service';

export function DashboardPage() {
  const { user } = useAuth();
  const { profile, organizationId } = useOrganization();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard_metrics', organizationId],
    queryFn: () => billingService.getDashboardMetrics(organizationId!),
    enabled: !!organizationId,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {profile?.first_name}</h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de la actividad en {profile?.organization?.name || 'tu consultorio'}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Ingresos Totales</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(metrics?.revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Facturas pagadas</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Pacientes Registrados</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">{isLoading ? '...' : metrics?.patients || 0}</div>
            <p className="text-xs text-muted-foreground">En tu organización</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Citas Hoy</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="M2 10h20"></path></svg>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">{isLoading ? '...' : metrics?.appointmentsToday || 0}</div>
            <p className="text-xs text-muted-foreground">Citas programadas para hoy</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Actividad</h3>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold">Activo</div>
            <p className="text-xs text-muted-foreground">Sistema operando correctamente</p>
          </div>
        </div>
      </div>
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
