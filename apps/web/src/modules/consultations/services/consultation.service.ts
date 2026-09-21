import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type Consultation = Database['public']['Tables']['consultations']['Row'];
export type ConsultationInsert = Database['public']['Tables']['consultations']['Insert'];
export type ConsultationUpdate = Database['public']['Tables']['consultations']['Update'];

export const consultationService = {
  async getConsultations(organizationId: string) {
    const { data, error } = await supabase.from('consultations')
      .select('*, patients(first_name, last_name, document_number), professionals(first_name, last_name)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getConsultationById(id: string) {
    const { data, error } = await supabase.from('consultations')
      .select('*, patients(*), professionals(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  async getOrCreateDraft(appointmentId: string, organizationId: string, patientId: string, professionalId: string) {
    // Buscar si ya hay un borrador o consulta completada para esta cita
    const { data: existing, error: findError } = await supabase.from('consultations')
      .select('*')
      .eq('appointment_id', appointmentId)
      .maybeSingle();
    
    if (existing) return existing;
    
    // Si no existe, crear un borrador nuevo
    const newConsultation: ConsultationInsert = {
      organization_id: organizationId,
      appointment_id: appointmentId,
      patient_id: patientId,
      professional_id: professionalId,
      status: 'draft',
      vital_signs: {
        blood_pressure: '',
        heart_rate: '',
        respiratory_rate: '',
        temperature: '',
        weight: '',
        height: ''
      }
    };
    
    const { data, error } = await supabase.from('consultations').insert(newConsultation).select().single();
    if (error) throw error;
    
    // Y marcamos la cita como "en atención" (attended) o similar. Por ahora 'attended'
    await supabase.from('appointments').update({ status: 'attended' }).eq('id', appointmentId);
    
    return data;
  },
  async updateConsultation(id: string, updates: Partial<ConsultationUpdate>) {
    const { data, error } = await supabase.from('consultations').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }
};
