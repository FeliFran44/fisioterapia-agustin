"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, UserPlus } from "lucide-react"
import { getPatients, savePatients, type Patient } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

export default function NuevoPacientePage() {
  const [formData, setFormData] = useState({
    name: "",
    cedula: "",
    phone: "",
    email: "",
    address: "",
    birthDate: "",
    gender: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

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
      const newPatient: Patient = {
        id: Date.now().toString(),
        name: formData.name,
        cedula: formData.cedula,
        phone: formData.phone,
        email: formData.email,
        address: formData.address || undefined,
        birthDate: formData.birthDate || undefined,
        gender: (formData.gender as "Masculino" | "Femenino" | "Otro") || undefined,
        treatments: 0,
        status: "Activo",
        notes: formData.notes || undefined,
        medicalHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedPatients = [...patients, newPatient]
      savePatients(updatedPatients)

      toast({
        title: "¡Paciente creado exitosamente! 🎉",
        description: `${formData.name} ha sido registrado correctamente en el sistema`,
      })

      router.push("/dashboard/pacientes")
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/dashboard/pacientes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <UserPlus className="w-8 h-8" />
            <span>Nuevo Paciente</span>
          </h1>
          <p className="text-gray-600 mt-1">👥 Registra un nuevo paciente en el sistema</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Paciente</CardTitle>
          <CardDescription>
            Completa los datos del nuevo paciente. Los campos marcados con * son obligatorios.
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link href="/dashboard/pacientes">
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
                    Guardar Paciente
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">💡 Consejos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Asegúrate de que todos los datos estén correctos antes de guardar</li>
            <li>• La cédula debe ser única para cada paciente</li>
            <li>• Puedes agregar más información después de crear el paciente</li>
            <li>• Los archivos y el historial médico se pueden agregar desde el perfil del paciente</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
