"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, User, Bell, Shield, Database, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracionPage() {
  const [config, setConfig] = useState({
    // Professional Profile
    name: "Lic. Agustín",
    email: "agustin@fisioterapia.com",
    phone: "+1234567890",
    license: "FT-2024-001",
    specialty: "Fisioterapia Deportiva",

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,

    // System Settings
    language: "es",
    timezone: "America/Argentina/Buenos_Aires",
    dateFormat: "DD/MM/YYYY",

    // Security
    twoFactorAuth: false,
    sessionTimeout: "30",
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load configuration from localStorage
    const savedConfig = localStorage.getItem("systemConfig")
    if (savedConfig) {
      setConfig({ ...config, ...JSON.parse(savedConfig) })
    }
  }, [])

  const handleConfigChange = (field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Save to localStorage
      localStorage.setItem("systemConfig", JSON.stringify(config))

      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido guardados exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = () => {
    // Mock export functionality
    toast({
      title: "Exportación iniciada",
      description: "Los datos se están preparando para la descarga",
    })
  }

  const handleImportData = () => {
    // Mock import functionality
    toast({
      title: "Importación",
      description: "Funcionalidad de importación en desarrollo",
    })
  }

  const handleBackup = () => {
    // Mock backup functionality
    toast({
      title: "Respaldo creado",
      description: "Se ha creado un respaldo de los datos",
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <Settings className="w-8 h-8" />
          <span>Configuración del Sistema</span>
        </h1>
        <p className="text-gray-600 mt-1">⚙️ Personaliza tu experiencia y gestiona la configuración</p>
      </div>

      <div className="space-y-6">
        {/* Professional Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Perfil Profesional</span>
            </CardTitle>
            <CardDescription>Información personal y profesional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input id="name" value={config.name} onChange={(e) => handleConfigChange("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={config.email}
                  onChange={(e) => handleConfigChange("email", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={config.phone} onChange={(e) => handleConfigChange("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">Matrícula Profesional</Label>
                <Input
                  id="license"
                  value={config.license}
                  onChange={(e) => handleConfigChange("license", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad</Label>
              <Input
                id="specialty"
                value={config.specialty}
                onChange={(e) => handleConfigChange("specialty", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notificaciones</span>
            </CardTitle>
            <CardDescription>Configura cómo y cuándo recibir notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por Email</Label>
                <p className="text-sm text-gray-500">Recibir notificaciones importantes por correo electrónico</p>
              </div>
              <Switch
                checked={config.emailNotifications}
                onCheckedChange={(checked) => handleConfigChange("emailNotifications", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones SMS</Label>
                <p className="text-sm text-gray-500">Recibir alertas urgentes por mensaje de texto</p>
              </div>
              <Switch
                checked={config.smsNotifications}
                onCheckedChange={(checked) => handleConfigChange("smsNotifications", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Recordatorios de Citas</Label>
                <p className="text-sm text-gray-500">Enviar recordatorios automáticos a pacientes</p>
              </div>
              <Switch
                checked={config.appointmentReminders}
                onCheckedChange={(checked) => handleConfigChange("appointmentReminders", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración del Sistema</CardTitle>
            <CardDescription>Preferencias de idioma, zona horaria y formato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={config.language} onValueChange={(value) => handleConfigChange("language", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Zona Horaria</Label>
                <Select value={config.timezone} onValueChange={(value) => handleConfigChange("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Argentina/Buenos_Aires">Buenos Aires</SelectItem>
                    <SelectItem value="America/Mexico_City">Ciudad de México</SelectItem>
                    <SelectItem value="America/Bogota">Bogotá</SelectItem>
                    <SelectItem value="America/Lima">Lima</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Formato de Fecha</Label>
                <Select value={config.dateFormat} onValueChange={(value) => handleConfigChange("dateFormat", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Seguridad</span>
            </CardTitle>
            <CardDescription>Configuración de seguridad y acceso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autenticación de Dos Factores</Label>
                <p className="text-sm text-gray-500">Agregar una capa extra de seguridad a tu cuenta</p>
              </div>
              <Switch
                checked={config.twoFactorAuth}
                onCheckedChange={(checked) => handleConfigChange("twoFactorAuth", checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Tiempo de Sesión (minutos)</Label>
              <Select
                value={config.sessionTimeout}
                onValueChange={(value) => handleConfigChange("sessionTimeout", value)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button variant="outline" className="w-full">
                Cambiar Contraseña
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Gestión de Datos</span>
            </CardTitle>
            <CardDescription>Exportar, importar y respaldar información</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={handleExportData}>
                Exportar Datos
              </Button>
              <Button variant="outline" onClick={handleImportData}>
                Importar Datos
              </Button>
              <Button variant="outline" onClick={handleBackup}>
                Crear Respaldo
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              "Guardando..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
