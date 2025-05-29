import { supabase, type Patient, type MedicalHistory, type Appointment, type PatientFile } from "./supabase"

// Patient functions
export const getPatients = async (): Promise<Patient[]> => {
  const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching patients:", error)
    return []
  }

  return data || []
}

export const getPatientById = async (id: string): Promise<Patient | null> => {
  const { data, error } = await supabase.from("patients").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching patient:", error)
    return null
  }

  return data
}

export const createPatient = async (
  patient: Omit<Patient, "id" | "created_at" | "updated_at">,
): Promise<Patient | null> => {
  const { data, error } = await supabase.from("patients").insert([patient]).select().single()

  if (error) {
    console.error("Error creating patient:", error)
    return null
  }

  return data
}

export const updatePatient = async (id: string, updates: Partial<Patient>): Promise<Patient | null> => {
  const { data, error } = await supabase
    .from("patients")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating patient:", error)
    return null
  }

  return data
}

export const deletePatient = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("patients").delete().eq("id", id)

  if (error) {
    console.error("Error deleting patient:", error)
    return false
  }

  return true
}

// Medical History functions
export const getMedicalHistory = async (patientId: string): Promise<MedicalHistory[]> => {
  const { data, error } = await supabase
    .from("medical_history")
    .select("*")
    .eq("patient_id", patientId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching medical history:", error)
    return []
  }

  return data || []
}

export const addMedicalHistory = async (
  history: Omit<MedicalHistory, "id" | "created_at" | "updated_at">,
): Promise<MedicalHistory | null> => {
  const { data, error } = await supabase.from("medical_history").insert([history]).select().single()

  if (error) {
    console.error("Error adding medical history:", error)
    return null
  }

  // Update patient treatments count
  await supabase.rpc("increment_patient_treatments", { patient_id: history.patient_id })

  return data
}

// Appointments functions
export const getAppointments = async (): Promise<Appointment[]> => {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      patients!inner(name)
    `)
    .order("date", { ascending: true })

  if (error) {
    console.error("Error fetching appointments:", error)
    return []
  }

  // Transform data to include patient name
  return (
    data?.map((apt) => ({
      ...apt,
      patientName: apt.patients.name,
    })) || []
  )
}

export const createAppointment = async (
  appointment: Omit<Appointment, "id" | "created_at" | "updated_at">,
): Promise<Appointment | null> => {
  const { data, error } = await supabase.from("appointments").insert([appointment]).select().single()

  if (error) {
    console.error("Error creating appointment:", error)
    return null
  }

  return data
}

export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment | null> => {
  const { data, error } = await supabase
    .from("appointments")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating appointment:", error)
    return null
  }

  return data
}

export const deleteAppointment = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("appointments").delete().eq("id", id)

  if (error) {
    console.error("Error deleting appointment:", error)
    return false
  }

  return true
}

// Patient Files functions
export const getPatientFiles = async (patientId: string): Promise<PatientFile[]> => {
  const { data, error } = await supabase
    .from("patient_files")
    .select("*")
    .eq("patient_id", patientId)
    .order("upload_date", { ascending: false })

  if (error) {
    console.error("Error fetching patient files:", error)
    return []
  }

  return data || []
}

export const uploadPatientFile = async (patientId: string, file: File): Promise<PatientFile | null> => {
  // Upload file to Supabase Storage
  const fileName = `${patientId}/${Date.now()}-${file.name}`
  const { data: uploadData, error: uploadError } = await supabase.storage.from("patient-files").upload(fileName, file)

  if (uploadError) {
    console.error("Error uploading file:", uploadError)
    return null
  }

  // Save file metadata to database
  const fileData = {
    patient_id: patientId,
    name: file.name,
    type: file.type,
    size: file.size,
    storage_path: uploadData.path,
  }

  const { data, error } = await supabase.from("patient_files").insert([fileData]).select().single()

  if (error) {
    console.error("Error saving file metadata:", error)
    return null
  }

  return data
}

export const deletePatientFile = async (fileId: string): Promise<boolean> => {
  // Get file info first
  const { data: fileData, error: fetchError } = await supabase
    .from("patient_files")
    .select("storage_path")
    .eq("id", fileId)
    .single()

  if (fetchError) {
    console.error("Error fetching file info:", fetchError)
    return false
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage.from("patient-files").remove([fileData.storage_path])

  if (storageError) {
    console.error("Error deleting file from storage:", storageError)
  }

  // Delete from database
  const { error } = await supabase.from("patient_files").delete().eq("id", fileId)

  if (error) {
    console.error("Error deleting file metadata:", error)
    return false
  }

  return true
}

export const getFileUrl = async (storagePath: string): Promise<string | null> => {
  const { data } = await supabase.storage.from("patient-files").createSignedUrl(storagePath, 3600) // 1 hour expiry

  return data?.signedUrl || null
}

// Legacy exports for compatibility (will be removed later)
export type { Patient, MedicalHistory, Appointment }

// Mock data for development (remove when migrating)
export const mockPatients: Patient[] = []
export const mockAppointments: Appointment[] = []
export const savePatients = () => {} // No-op
export const saveAppointments = () => {} // No-op
