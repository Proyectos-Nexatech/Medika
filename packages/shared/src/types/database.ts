/**
 * Tipos generados del schema de Supabase / PostgreSQL
 * Medika — Plataforma SaaS Multi-Tenant para Consultorios de Salud
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          commercial_name: string | null
          tax_id: string | null
          address: string | null
          city: string | null
          phone: string | null
          email: string | null
          logo_url: string | null
          website: string | null
          specialties: string[] | null
          settings: Json | null
          status: 'active' | 'inactive' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          commercial_name?: string | null
          tax_id?: string | null
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          website?: string | null
          specialties?: string[] | null
          settings?: Json | null
          status?: 'active' | 'inactive' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          commercial_name?: string | null
          tax_id?: string | null
          address?: string | null
          city?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          website?: string | null
          specialties?: string[] | null
          settings?: Json | null
          status?: 'active' | 'inactive' | 'suspended'
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string
          auth_user_id: string
          first_name: string
          last_name: string
          phone: string | null
          avatar_url: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          auth_user_id: string
          first_name: string
          last_name: string
          phone?: string | null
          avatar_url?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          organization_id?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          avatar_url?: string | null
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role: 'super_admin' | 'org_admin' | 'professional' | 'receptionist' | 'patient'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          role: 'super_admin' | 'org_admin' | 'professional' | 'receptionist' | 'patient'
          created_at?: string
        }
        Update: {
          role?: 'super_admin' | 'org_admin' | 'professional' | 'receptionist' | 'patient'
        }
      }
      professionals: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          first_name: string
          last_name: string
          document_type: string | null
          document_number: string | null
          specialty: string | null
          registration_number: string | null
          phone: string | null
          email: string | null
          schedule: Json | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          first_name: string
          last_name: string
          document_type?: string | null
          document_number?: string | null
          specialty?: string | null
          registration_number?: string | null
          phone?: string | null
          email?: string | null
          schedule?: Json | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string
          last_name?: string
          document_type?: string | null
          document_number?: string | null
          specialty?: string | null
          registration_number?: string | null
          phone?: string | null
          email?: string | null
          schedule?: Json | null
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          organization_id: string
          document_type: 'CC' | 'CE' | 'PA' | 'RC' | 'TI' | 'NIT' | 'AS' | 'MS'
          document_number: string
          first_name: string
          last_name: string
          birth_date: string | null
          sex: 'M' | 'F' | 'O' | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          blood_type: string | null
          allergies: string[] | null
          observations: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          document_type: 'CC' | 'CE' | 'PA' | 'RC' | 'TI' | 'NIT' | 'AS' | 'MS'
          document_number: string
          first_name: string
          last_name: string
          birth_date?: string | null
          sex?: 'M' | 'F' | 'O' | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          blood_type?: string | null
          allergies?: string[] | null
          observations?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          document_type?: 'CC' | 'CE' | 'PA' | 'RC' | 'TI' | 'NIT' | 'AS' | 'MS'
          document_number?: string
          first_name?: string
          last_name?: string
          birth_date?: string | null
          sex?: 'M' | 'F' | 'O' | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          blood_type?: string | null
          allergies?: string[] | null
          observations?: string | null
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          organization_id: string
          name: string
          category: string | null
          description: string | null
          duration_minutes: number
          price: number
          modality: 'presencial' | 'virtual' | 'domicilio'
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          category?: string | null
          description?: string | null
          duration_minutes?: number
          price?: number
          modality?: 'presencial' | 'virtual' | 'domicilio'
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          category?: string | null
          description?: string | null
          duration_minutes?: number
          price?: number
          modality?: 'presencial' | 'virtual' | 'domicilio'
          status?: 'active' | 'inactive'
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          organization_id: string
          patient_id: string
          professional_id: string
          service_id: string | null
          appointment_date: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'waiting' | 'attended' | 'cancelled' | 'rescheduled' | 'no_show'
          notes: string | null
          cancellation_reason: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          patient_id: string
          professional_id: string
          service_id?: string | null
          appointment_date: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'waiting' | 'attended' | 'cancelled' | 'rescheduled' | 'no_show'
          notes?: string | null
          cancellation_reason?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          patient_id?: string
          professional_id?: string
          service_id?: string | null
          appointment_date?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'waiting' | 'attended' | 'cancelled' | 'rescheduled' | 'no_show'
          notes?: string | null
          cancellation_reason?: string | null
          updated_at?: string
        }
      }
      consultations: {
        Row: {
          id: string
          organization_id: string
          appointment_id: string | null
          patient_id: string
          professional_id: string
          reason: string | null
          current_illness: string | null
          background: Json | null
          vital_signs: Json | null
          physical_exam: string | null
          findings: string | null
          diagnosis: Json | null
          treatment_plan: string | null
          treatment: string | null
          recommendations: string | null
          observations: string | null
          status: 'draft' | 'completed' | 'signed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          appointment_id?: string | null
          patient_id: string
          professional_id: string
          reason?: string | null
          current_illness?: string | null
          background?: Json | null
          vital_signs?: Json | null
          physical_exam?: string | null
          findings?: string | null
          diagnosis?: Json | null
          treatment_plan?: string | null
          treatment?: string | null
          recommendations?: string | null
          observations?: string | null
          status?: 'draft' | 'completed' | 'signed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          reason?: string | null
          current_illness?: string | null
          background?: Json | null
          vital_signs?: Json | null
          physical_exam?: string | null
          findings?: string | null
          diagnosis?: Json | null
          treatment_plan?: string | null
          treatment?: string | null
          recommendations?: string | null
          observations?: string | null
          status?: 'draft' | 'completed' | 'signed'
          updated_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          organization_id: string
          patient_id: string
          consultation_id: string | null
          document_type: 'clinical_record' | 'prescription' | 'medical_order' | 'certificate' | 'referral' | 'consent' | 'result' | 'other'
          title: string
          storage_path: string | null
          metadata: Json | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          patient_id: string
          consultation_id?: string | null
          document_type: 'clinical_record' | 'prescription' | 'medical_order' | 'certificate' | 'referral' | 'consent' | 'result' | 'other'
          title: string
          storage_path?: string | null
          metadata?: Json | null
          created_by: string
          created_at?: string
        }
        Update: {
          title?: string
          storage_path?: string | null
          metadata?: Json | null
        }
      }
      invoices: {
        Row: {
          id: string
          organization_id: string
          patient_id: string
          appointment_id: string | null
          items: Json
          subtotal: number
          discount: number
          total: number
          status: 'pending' | 'paid' | 'partial' | 'cancelled'
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          patient_id: string
          appointment_id?: string | null
          items: Json
          subtotal: number
          discount?: number
          total: number
          status?: 'pending' | 'paid' | 'partial' | 'cancelled'
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          items?: Json
          subtotal?: number
          discount?: number
          total?: number
          status?: 'pending' | 'paid' | 'partial' | 'cancelled'
          notes?: string | null
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          organization_id: string
          invoice_id: string
          amount: number
          payment_method: 'cash' | 'transfer' | 'card' | 'other'
          reference: string | null
          notes: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          invoice_id: string
          amount: number
          payment_method: 'cash' | 'transfer' | 'card' | 'other'
          reference?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          amount?: number
          payment_method?: 'cash' | 'transfer' | 'card' | 'other'
          reference?: string | null
          notes?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          action: string
          table_name: string | null
          record_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          action: string
          table_name?: string | null
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: never
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_role: {
        Args: { p_user_id: string; p_organization_id: string }
        Returns: 'super_admin' | 'org_admin' | 'professional' | 'receptionist' | 'patient' | null
      }
    }
    Enums: {
      app_role: 'super_admin' | 'org_admin' | 'professional' | 'receptionist' | 'patient'
      appointment_status: 'pending' | 'confirmed' | 'waiting' | 'attended' | 'cancelled' | 'rescheduled' | 'no_show'
      document_type: 'clinical_record' | 'prescription' | 'medical_order' | 'certificate' | 'referral' | 'consent' | 'result' | 'other'
      entity_status: 'active' | 'inactive'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
