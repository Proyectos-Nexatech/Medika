import { supabase } from '@/lib/supabase';
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
