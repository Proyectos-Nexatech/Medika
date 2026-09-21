import { supabase } from '@/lib/supabase';
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
