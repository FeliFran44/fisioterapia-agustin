"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, CalendarPlus, Clock, User } from "lucide-react"
import { getPatients, getAppointments, saveAppointments, type Patient, type Appointment } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export default function NuevaCitaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [formData, setFormData] = useState({
    patientId: "",
    date: "",
    time: "",
    duration: "60",
    type: "",
    notes: "",
    status: "confirmada",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  useEffect(() => {
    setPatients(getPatients())
    setAppointments(getAppointments())
  }, [])

  useEffect(() => {
    if (formData.patientId) {
      const patient = patients.find((p) => p.id === formData.patientId)
      setSelectedPatient(patient || null)
    } else {
      setSelectedPatient(null)
    }
  }, [formData.patientId, patients])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 19; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
      slots.push(`${hour.toString().padStart(2, "0")}:30`)
    }
    return slots
  }

  const getAvailableTimeSlots = () => {
    if (!formData.date) return generateTimeSlots()

    const dayAppointments = appointments.filter((apt) => apt.date === formData.date)
    const allSlots = generateTimeSlots()

    return allSlots.filter((slot) => {
      return !dayAppointments.some((apt) => apt.time === slot)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!selectedPatient) {
        toast({
          title: "Error",
          description: "Por favor selecciona un paciente",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientId: formData.patientId,
        patientName: selectedPatient.name,
        date: formData.date,
        time: formData.time,
        duration: Number.parseInt(formData.duration),
        type: formData.type,
        notes: formData.notes || undefined,
        status: formData.status as "confirmada" | "pendiente" | "cancelada",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedAppointments = [...appointments, newAppointment]
      saveAppointments(updatedAppointments)

      toast({
        title: "Cita creada",
        description: `Cita programada para ${selectedPatient.name} el ${new Date(formData.date).toLocaleDateString("es-ES")} a las ${formData.time}`,
      })

      router.push("/dashboard/agenda")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la cita",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case "Terapia manual":
        return "🦴"
      case "Rehabilitación":
        return "❤️"
      case "Evaluación inicial":
        return "🧠"
      case "Ejercicios":
        return "🏃"
      default:
        return "📋"
    }
  }

  const availableTimeSlots = getAvailableTimeSlots()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/dashboard/agenda">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <CalendarPlus className="w-8 h-8" />
            <span>Nueva Cita</span>
          </h1>
          <p className="text-gray-600 mt-1">📅 Programa una nueva cita para un paciente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Cita</CardTitle>
              <CardDescription>Completa los datos de la nueva cita. Todos los campos son obligatorios.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente *</Label>
                  <Select value={formData.patientId} onValueChange={(value) => handleInputChange("patientId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>
                              {patient.name} - {patient.cedula}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora *</Label>
                    <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{slot}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.date && availableTimeSlots.length === 0 && (
                      <p className="text-sm text-red-600">No hay horarios disponibles para esta fecha</p>
                    )}
                  </div>
                </div>

                {/* Duration and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duración (minutos) *</Label>
                    <Select value={formData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Sesión *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Terapia manual">🦴 Terapia manual</SelectItem>
                        <SelectItem value="Rehabilitación">❤️ Rehabilitación</SelectItem>
                        <SelectItem value="Evaluación inicial">🧠 Evaluación inicial</SelectItem>
                        <SelectItem value="Ejercicios">🏃 Ejercicios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmada">✅ Confirmada</SelectItem>
                      <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
                      <SelectItem value="cancelada">❌ Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Observaciones especiales para esta cita..."
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Link href="/dashboard/agenda">
                    <Button variant="outline" type="button">
                      Cancelar
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      !formData.patientId ||
                      !formData.date ||
                      !formData.time ||
                      !formData.type ||
                      availableTimeSlots.length === 0
                    }
                  >
                    {isLoading ? (
                      "Guardando..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Crear Cita
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Patient Info */}
          {selectedPatient && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Paciente Seleccionado</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{selectedPatient.name}</p>
                  <p className="text-sm text-gray-600">Cédula: {selectedPatient.cedula}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">📞 {selectedPatient.phone}</p>
                  <p className="text-sm text-gray-600">📧 {selectedPatient.email}</p>
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Estado:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        selectedPatient.status === "Activo"
                          ? "bg-green-100 text-green-800"
                          : selectedPatient.status === "Seguimiento"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {selectedPatient.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">Tratamientos:</span> {selectedPatient.treatments}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointment Summary */}
          {formData.date && formData.time && formData.type && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarPlus className="w-5 h-5" />
                  <span>Resumen de la Cita</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getAppointmentTypeIcon(formData.type)}</span>
                  <span className="font-medium">{formData.type}</span>
                </div>
                <div className="text-sm space-y-1">
                  <p>
                    📅{" "}
                    {new Date(formData.date).toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p>🕐 {formData.time}</p>
                  <p>⏱️ {formData.duration} minutos</p>
                  <p>
                    Estado:{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        formData.status === "confirmada"
                          ? "bg-green-100 text-green-800"
                          : formData.status === "pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {formData.status}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Citas de Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {appointments
                  .filter((apt) => apt.date === new Date().toISOString().split("T")[0])
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .slice(0, 3)
                  .map((apt) => (
                    <div key={apt.id} className="text-sm p-2 bg-gray-50 rounded">
                      <p className="font-medium">
                        {apt.time} - {apt.patientName}
                      </p>
                      <p className="text-gray-600">{apt.type}</p>
                    </div>
                  ))}
                {appointments.filter((apt) => apt.date === new Date().toISOString().split("T")[0]).length === 0 && (
                  <p className="text-sm text-gray-500">No hay citas programadas para hoy</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
