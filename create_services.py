import os

base_dir = r"c:\Users\EQC0670\Medika\apps\web\src\modules"

files = {
    "patients/services/patient.service.ts": """import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type Patient = Database['public']['Tables']['patients']['Row'];
export type PatientInsert = Database['public']['Tables']['patients']['Insert'];

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
  }
};
""",
    "professionals/services/professional.service.ts": """import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type Professional = Database['public']['Tables']['professionals']['Row'];
export type ProfessionalInsert = Database['public']['Tables']['professionals']['Insert'];

export const professionalService = {
  async getProfessionals(organizationId: string) {
    const { data, error } = await supabase.from('professionals').select('*, users(first_name, last_name, email)').eq('organization_id', organizationId).order('specialty', { ascending: true });
    if (error) throw error;
    return data;
  },
  async createProfessional(professional: ProfessionalInsert) {
    const { data, error } = await supabase.from('professionals').insert(professional).select().single();
    if (error) throw error;
    return data;
  }
};
""",
    "services/services/catalog.service.ts": """import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type MedicalService = Database['public']['Tables']['services']['Row'];
export type MedicalServiceInsert = Database['public']['Tables']['services']['Insert'];

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
  }
};
""",
    "appointments/services/appointment.service.ts": """import { supabase } from '@/lib/supabase';
import type { Database } from '@medika/shared';

export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];

export const appointmentService = {
  async getAppointments(organizationId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase.from('appointments')
      .select('*, patients(first_name, last_name), professionals(users(first_name, last_name)), services(name, duration_minutes)')
      .eq('organization_id', organizationId)
      .gte('start_time', startDate)
      .lte('start_time', endDate)
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
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
