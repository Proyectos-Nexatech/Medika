import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];

export const appointmentService = {
  async getAppointments(organizationId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase.from('appointments')
      .select('*, patients(first_name, last_name), professionals(first_name, last_name), services(name, duration_minutes)')
      .eq('organization_id', organizationId)
      .gte('appointment_date', startDate)
      .lte('appointment_date', endDate)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });
    if (error) throw error;
    return data;
  },
  async createAppointment(appointment: AppointmentInsert) {
    const { data, error } = await supabase.from('appointments').insert(appointment).select().single();
    if (error) throw error;
    return data;
  },
  async updateStatus(id: string, status: Database['public']['Enums']['appointment_status']) {
    const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
