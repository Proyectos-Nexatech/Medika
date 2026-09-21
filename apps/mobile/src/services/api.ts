import { supabase } from '@/lib/supabase';

export const api = {
  async getPatients(organizationId: string) {
    const { data, error } = await supabase.from('patients').select('*').eq('organization_id', organizationId).order('last_name', { ascending: true });
    if (error) throw error;
    return data;
  },
  async getAppointments(organizationId: string) {
    const { data, error } = await supabase.from('appointments')
      .select('*, patients(first_name, last_name), services(name, duration_minutes)')
      .eq('organization_id', organizationId)
      .order('appointment_date', { ascending: false })
      .order('start_time', { ascending: false })
      .limit(30);
    if (error) throw error;
    return data;
  }
};
