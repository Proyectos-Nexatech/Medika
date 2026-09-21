import { supabase } from '@/lib/supabase';
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
  
  async updateInvoice(id: string, invoice: any) {
    const { data, error } = await supabase.from('invoices').update(invoice).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  
  async deleteInvoice(id: string) {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async getDashboardMetrics(organizationId: string) {
    const { count: patientCount } = await supabase.from('patients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);
      
    const today = new Date().toISOString().split('T')[0];
    const { count: appointmentsToday } = await supabase.from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('appointment_date', today);
      
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
