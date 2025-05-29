import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Patient {
  id: string
  name: string
  cedula: string
  phone: string
  email: string
  address?: string
  birth_date?: string
  gender?: "Masculino" | "Femenino" | "Otro"
  treatments: number
  status: "Activo" | "Seguimiento" | "Alta"
  notes?: string
  created_at: string
  updated_at: string
}

export interface MedicalHistory {
  id: string
  patient_id: string
  date: string
  treatment: string
  notes?: string
  evolution?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  date: string
  time: string
  duration: number
  type: string
  notes?: string
  status: "confirmada" | "pendiente" | "cancelada"
  created_at: string
  updated_at: string
}

export interface PatientFile {
  id: string
  patient_id: string
  name: string
  type: string
  size: number
  storage_path: string
  upload_date: string
}
