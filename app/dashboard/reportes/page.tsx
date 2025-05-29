"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, Users, Calendar, Download, FileText } from "lucide-react"
import { getPatients, getAppointments, type Patient, type Appointment } from "@/lib/db"

export default function ReportesPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")

  useEffect(() => {
    setPatients(getPatients())
    setAppointments(getAppointments())
  }, [])

  // Calculate statistics
  const totalPatients = patients.length
  const activePatients = patients.filter((p) => p.status === "Activo").length
  const followupPatients = patients.filter((p) => p.status === "Seguimiento").length
  const dischargedPatients = patients.filter((p) => p.status === "Alta").length

  const totalAppointments = appointments.length
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmada").length
  const pendingAppointments = appointments.filter((a) => a.status === "pendiente").length
  const cancelledAppointments = appointments.filter((a) => a.status === "cancelada").length

  const totalTreatments = patients.reduce((sum, patient) => sum + patient.treatments, 0)
  const avgTreatmentsPerPatient = totalPatients > 0 ? (totalTreatments / totalPatients).toFixed(1) : 0

  // Treatment types analysis
  const treatmentTypes = [
    { name: "🦴 Terapia Manual", count: Math.floor(totalTreatments * 0.4) },
    { name: "❤️ Rehabilitación", count: Math.floor(totalTreatments * 0.3) },
    { name: "🧠 Evaluación", count: Math.floor(totalTreatments * 0.2) },
    { name: "🏃 Ejercicios", count: Math.floor(totalTreatments * 0.1) },
  ]

  // Performance metrics
  const recoveryRate = totalPatients > 0 ? ((dischargedPatients / totalPatients) * 100).toFixed(1) : 0
  const adherenceRate = totalAppointments > 0 ? ((confirmedAppointments / totalAppointments) * 100).toFixed(1) : 0
  const satisfactionRate = "92.5" // Mock data

  const handleExportPDF = () => {
    // Mock export functionality
    alert("Funcionalidad de exportación PDF en desarrollo")
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-8 h-8" />
            <span>Reportes y Estadísticas</span>
          </h1>
          <p className="text-gray-600 mt-1">📊 Análisis completo del rendimiento de tu consulta</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handlePrint}>
            <FileText className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Patient Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Estadísticas de Pacientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{totalPatients}</div>
              <div className="text-sm text-gray-600">Total Pacientes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{activePatients}</div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{followupPatients}</div>
              <div className="text-sm text-gray-600">Seguimiento</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">{dischargedPatients}</div>
              <div className="text-sm text-gray-600">Alta</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Estadísticas de Citas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{totalAppointments}</div>
              <div className="text-sm text-gray-600">Total Citas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{confirmedAppointments}</div>
              <div className="text-sm text-gray-600">Confirmadas</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600">{pendingAppointments}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">{cancelledAppointments}</div>
              <div className="text-sm text-gray-600">Canceladas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Treatment Types */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Tratamiento</CardTitle>
            <CardDescription>Distribución por tipo de terapia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {treatmentTypes.map((treatment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{treatment.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${(treatment.count / totalTreatments) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{treatment.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Métricas de Rendimiento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Tasa de Recuperación</span>
                  <span className="text-sm text-gray-600">{recoveryRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${recoveryRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Adherencia al Tratamiento</span>
                  <span className="text-sm text-gray-600">{adherenceRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${adherenceRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Satisfacción del Paciente</span>
                  <span className="text-sm text-gray-600">{satisfactionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${satisfactionRate}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Promedio de Tratamientos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{avgTreatmentsPerPatient}</div>
              <p className="text-sm text-gray-600">Por paciente</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiempo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">45</div>
              <p className="text-sm text-gray-600">Minutos por sesión</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eficiencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">94%</div>
              <p className="text-sm text-gray-600">Utilización de agenda</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
