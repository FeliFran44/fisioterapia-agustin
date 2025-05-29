"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, UserCheckIcon as UserEdit } from "lucide-react"
import { getPatients, savePatients, type Patient } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export default function EditarPacientePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    cedula: "",
    phone: "",
    email: "",
    address: "",
    birthDate: "",
    gender: "",
    status: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const patients = getPatients()
    const foundPatient = patients.find((p) => p.id === params.id)
    if (foundPatient) {
      setPatient(foundPatient)
      setFormData({
        name: foundPatient.name,
        cedula: foundPatient.cedula,
        phone: foundPatient.phone,
        email: foundPatient.email,
        address: foundPatient.address || "",
        birthDate: foundPatient.birthDate || "",
        gender: foundPatient.gender || "",
        status: foundPatient.status,
        notes: foundPatient.notes || "",
      })
    }
  }, [params.id])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const patients = getPatients()
      const updatedPatients = patients.map((p) => {
        if (p.id === params.id) {
          return {
            ...p,
            name: formData.name,
            cedula: formData.cedula,
            phone: formData.phone,
            email: formData.email,
            address: formData.address || undefined,
            birthDate: formData.birthDate || undefined,
            gender: (formData.gender as "Masculino" | "Femenino" | "Otro") || undefined,
            status: formData.status as "Activo" | "Seguimiento" | "Alta",
            notes: formData.notes || undefined,
            updatedAt: new Date().toISOString(),
          }
        }
        return p
      })

      savePatients(updatedPatients)

      toast({
        title: "Paciente actualizado",
        description: `Los datos de ${formData.name} han sido actualizados exitosamente`,
      })

      router.push(`/dashboard/pacientes/${params.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el paciente",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!patient) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Paciente no encontrado</h1>
          <Link href="/dashboard/pacientes">
            <Button>Volver a Pacientes</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href={`/dashboard/pacientes/${patient.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <UserEdit className="w-8 h-8" />
            <span>Editar Paciente</span>
          </h1>
          <p className="text-gray-600 mt-1">✏️ Actualiza la información de {patient.name}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Paciente</CardTitle>
          <CardDescription>
            Modifica los datos del paciente. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
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
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Activo">Activo</SelectItem>
                    <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="Alta">Alta</SelectItem>
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

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link href={`/dashboard/pacientes/${patient.id}`}>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
