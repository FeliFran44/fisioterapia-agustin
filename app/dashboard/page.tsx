"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, Activity, TrendingUp, Plus, Clock, Save, UserPlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { getAppointments, getPatients, createPatient, type Patient } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState("")
  const [username, setUsername] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    cedula: "",
    phone: "",
    email: "",
    address: "",
    birth_date: "",
    gender: "",
    notes: "",
  })
  const { toast } = useToast()

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    }

    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }

    loadData()
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    setIsLoadingData(true)
    try {
      const [patientsData, appointmentsData] = await Promise.all([getPatients(), getAppointments()])
      setPatients(patientsData)
      setAppointments(appointmentsData)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      cedula: "",
      phone: "",
      email: "",
      address: "",
      birth_date: "",
      gender: "",
      notes: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const newPatient = await createPatient({
        name: formData.name,
        cedula: formData.cedula,
        phone: formData.phone,
        email: formData.email,
        address: formData.address || undefined,
        birth_date: formData.birth_date || undefined,
        gender: (formData.gender as "Masculino" | "Femenino" | "Otro") || undefined,
        treatments: 0,
        status: "Activo",
        notes: formData.notes || undefined,
      })

      if (newPatient) {
        await loadData() // Reload data
        toast({
          title: "¡Paciente creado exitosamente! 🎉",
          description: `${formData.name} ha sido registrado correctamente en el sistema`,
        })
        setIsModalOpen(false)
        resetForm()
      } else {
        throw new Error("No se pudo crear el paciente")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el paciente. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate statistics
  const totalPatients = patients.length
  const activePatients = patients.filter((p) => p.status === "Activo").length
  const todayAppointments = appointments.filter((apt) => {
    const today = new Date().toISOString().split("T")[0]
    return apt.date === today
  }).length
  const weeklyTreatments = patients.reduce((sum, patient) => sum + patient.treatments, 0)

  const recentActivity = [
    { action: "Nueva cita programada", patient: "María González", time: "10:30 AM", type: "appointment" },
    { action: "Paciente actualizado", patient: "Carlos Rodríguez", time: "09:15 AM", type: "update" },
    { action: "Tratamiento completado", patient: "Ana Martínez", time: "08:45 AM", type: "treatment" },
    { action: "Nuevo paciente registrado", patient: "Luis Fernández", time: "08:00 AM", type: "new" },
  ]

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  if (isLoadingData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Cargando datos...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getGreeting()}, Lic. {username} 👋
            </h1>
            <p className="text-gray-600 mt-1">Hora actual: {currentTime} | Panel de control de tu consulta</p>
          </div>
          <div className="hidden md:block">
            <Badge variant="outline" className="text-lg px-4 py-2">
              🦴 Fisioterapia Profesional
            </Badge>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">👥 Registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Activos</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePatients}</div>
            <p className="text-xs text-muted-foreground">❤️ En tratamiento actual</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments}</div>
            <p className="text-xs text-muted-foreground">📅 Programadas para hoy</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tratamientos</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyTreatments}</div>
            <p className="text-xs text-muted-foreground">🏃 Total acumulados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Acciones Rápidas</span>
            </CardTitle>
            <CardDescription>Gestiona tu consulta de manera eficiente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Modal Dialog for New Patient */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-20 flex flex-col space-y-2 hover:bg-blue-600">
                    <Users className="w-6 h-6" />
                    <span>Nuevo Paciente</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      <UserPlus className="w-6 h-6" />
                      <span>Nuevo Paciente</span>
                    </DialogTitle>
                    <DialogDescription>
                      Completa los datos del nuevo paciente. Los campos marcados con * son obligatorios.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Ej: María González"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cedula">Cédula *</Label>
                        <Input
                          id="cedula"
                          value={formData.cedula}
                          onChange={(e) => handleInputChange("cedula", e.target.value)}
                          placeholder="Ej: 12345678"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="Ej: +1234567890"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Ej: maria@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Dirección</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Ej: Calle Principal 123"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                        <Input
                          id="birth_date"
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => handleInputChange("birth_date", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Género</Label>
                        <Select onValueChange={(value) => handleInputChange("gender", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar género" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Femenino">Femenino</SelectItem>
                            <SelectItem value="Otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notas Adicionales</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Información adicional sobre el paciente..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false)
                          resetForm()
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Paciente
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Link href="/dashboard/agenda/nueva">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:bg-gray-50">
                  <Calendar className="w-6 h-6" />
                  <span>Nueva Cita</span>
                </Button>
              </Link>
              <Link href="/dashboard/pacientes">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:bg-gray-50">
                  <Activity className="w-6 h-6" />
                  <span>Ver Pacientes</span>
                </Button>
              </Link>
              <Link href="/dashboard/reportes">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2 hover:bg-gray-50">
                  <TrendingUp className="w-6 h-6" />
                  <span>Reportes</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "appointment"
                        ? "bg-blue-500"
                        : activity.type === "update"
                          ? "bg-yellow-500"
                          : activity.type === "treatment"
                            ? "bg-green-500"
                            : "bg-purple-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.patient}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
