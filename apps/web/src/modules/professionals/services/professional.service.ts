import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type Professional = Database['public']['Tables']['professionals']['Row'];
export type ProfessionalInsert = Database['public']['Tables']['professionals']['Insert'];
export type ProfessionalUpdate = Database['public']['Tables']['professionals']['Update'];

export const professionalService = {
  async getProfessionals(organizationId: string) {
    const { data, error } = await supabase.from('professionals').select('*').eq('organization_id', organizationId).order('specialty', { ascending: true });
    if (error) throw error;
    return data;
  },
  async createProfessional(professional: ProfessionalInsert) {
    const { data, error } = await supabase.from('professionals').insert(professional).select().single();
    if (error) throw error;
    return data;
  },
  async updateProfessional(id: string, professional: ProfessionalUpdate) {
    const { data, error } = await supabase.from('professionals').update(professional).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },
  async deleteProfessional(id: string) {
    const { error } = await supabase.from('professionals').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};
