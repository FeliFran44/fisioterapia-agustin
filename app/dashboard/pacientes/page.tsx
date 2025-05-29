"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye, Edit, Trash2, Users, Save, UserPlus, Loader2 } from "lucide-react"
import { getPatients, createPatient, deletePatient, type Patient } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
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
    loadPatients()
  }, [])

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cedula.includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredPatients(filtered)
  }, [searchTerm, patients])

  const loadPatients = async () => {
    setIsLoadingData(true)
    try {
      const loadedPatients = await getPatients()
      setPatients(loadedPatients)
      setFilteredPatients(loadedPatients)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pacientes",
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
        await loadPatients() // Reload patients list
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-100 text-green-800"
      case "Seguimiento":
        return "bg-yellow-100 text-yellow-800"
      case "Alta":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDelete = async (patientId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este paciente?")) {
      try {
        const success = await deletePatient(patientId)
        if (success) {
          await loadPatients() // Reload patients list
          toast({
            title: "Paciente eliminado",
            description: "El paciente ha sido eliminado exitosamente",
          })
        } else {
          throw new Error("No se pudo eliminar el paciente")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el paciente",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoadingData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Cargando pacientes...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Users className="w-8 h-8" />
            <span>Gestión de Pacientes</span>
          </h1>
          <p className="text-gray-600 mt-1">👥 Administra la información de tus pacientes</p>
        </div>

        {/* Modal Dialog for New Patient */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
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
              {/* Personal Information */}
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

              {/* Submit Buttons */}
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
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, cédula o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-sm text-gray-600">Total Pacientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {patients.filter((p) => p.status === "Activo").length}
            </div>
            <p className="text-sm text-gray-600">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{patients.filter((p) => p.status === "Alta").length}</div>
            <p className="text-sm text-gray-600">Dados de Alta</p>
          </CardContent>
        </Card>
      </div>

      {/* Patients List */}
      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron pacientes</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando tu primer paciente"}
              </p>
              {!searchTerm && (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Primer Paciente
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                      <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div>📋 Cédula: {patient.cedula}</div>
                      <div>📞 Teléfono: {patient.phone}</div>
                      <div>📧 Email: {patient.email}</div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      🏃 Tratamientos: {patient.treatments} | 📅 Desde:{" "}
                      {new Date(patient.created_at).toLocaleDateString("es-ES")}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4 md:mt-0">
                    <Link href={`/dashboard/pacientes/${patient.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/pacientes/${patient.id}/editar`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(patient.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
