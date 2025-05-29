"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  FileText,
  Download,
  Upload,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  Activity,
  FileDown,
} from "lucide-react"
import { getPatients, savePatients, type Patient } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"

interface PatientFile {
  id: string
  name: string
  type: string
  size: number
  uploadDate: string
  url: string
}

export default function PatientDetailPage() {
  const params = useParams()
  const { toast } = useToast()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [files, setFiles] = useState<PatientFile[]>([])
  const [newHistoryEntry, setNewHistoryEntry] = useState({
    date: "",
    treatment: "",
    notes: "",
    evolution: "",
  })
  const [showAddHistory, setShowAddHistory] = useState(false)

  useEffect(() => {
    const patients = getPatients()
    const foundPatient = patients.find((p) => p.id === params.id)
    if (foundPatient) {
      setPatient(foundPatient)
      // Load files from localStorage
      const savedFiles = localStorage.getItem(`patient_files_${params.id}`)
      if (savedFiles) {
        setFiles(JSON.parse(savedFiles))
      }
    }
  }, [params.id])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles) return

    const newFiles: PatientFile[] = []

    Array.from(uploadedFiles).forEach((file) => {
      const newFile: PatientFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file), // In a real app, this would be uploaded to a server
      }
      newFiles.push(newFile)
    })

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    localStorage.setItem(`patient_files_${params.id}`, JSON.stringify(updatedFiles))

    toast({
      title: "Archivos subidos",
      description: `Se han subido ${newFiles.length} archivo(s) exitosamente`,
    })
  }

  const handleDeleteFile = (fileId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este archivo?")) {
      const updatedFiles = files.filter((f) => f.id !== fileId)
      setFiles(updatedFiles)
      localStorage.setItem(`patient_files_${params.id}`, JSON.stringify(updatedFiles))

      toast({
        title: "Archivo eliminado",
        description: "El archivo ha sido eliminado exitosamente",
      })
    }
  }

  const handleAddHistory = () => {
    if (!patient || !newHistoryEntry.date || !newHistoryEntry.treatment) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    const patients = getPatients()
    const updatedPatients = patients.map((p) => {
      if (p.id === patient.id) {
        const newHistory = {
          id: Date.now().toString(),
          ...newHistoryEntry,
        }
        return {
          ...p,
          medicalHistory: [...(p.medicalHistory || []), newHistory],
          treatments: p.treatments + 1,
          updatedAt: new Date().toISOString(),
        }
      }
      return p
    })

    savePatients(updatedPatients)
    setPatient(updatedPatients.find((p) => p.id === patient.id) || null)
    setNewHistoryEntry({ date: "", treatment: "", notes: "", evolution: "" })
    setShowAddHistory(false)

    toast({
      title: "Historial actualizado",
      description: "Se ha agregado una nueva entrada al historial médico",
    })
  }

  const handleDeletePatient = () => {
    if (confirm("¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.")) {
      const patients = getPatients()
      const updatedPatients = patients.filter((p) => p.id !== params.id)
      savePatients(updatedPatients)

      // Also delete patient files
      localStorage.removeItem(`patient_files_${params.id}`)

      toast({
        title: "Paciente eliminado",
        description: "El paciente ha sido eliminado exitosamente",
      })

      // router.push("/dashboard/pacientes")
      window.location.href = "/dashboard/pacientes"
    }
  }

  const generatePDF = () => {
    if (!patient) return

    // Create a new window for the PDF content
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const currentDate = new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const age = patient.birthDate
      ? Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      : "N/A"

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ficha del Paciente - ${patient.name}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #2563eb;
            font-size: 28px;
            margin-bottom: 5px;
          }
          
          .header h2 {
            color: #666;
            font-size: 18px;
            font-weight: normal;
          }
          
          .header .date {
            color: #888;
            font-size: 14px;
            margin-top: 10px;
          }
          
          .patient-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #2563eb;
          }
          
          .patient-info h3 {
            color: #2563eb;
            margin-bottom: 15px;
            font-size: 20px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 15px;
          }
          
          .info-item {
            display: flex;
            flex-direction: column;
          }
          
          .info-label {
            font-weight: bold;
            color: #555;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 3px;
          }
          
          .info-value {
            color: #333;
            font-size: 14px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .status-activo {
            background: #dcfce7;
            color: #166534;
          }
          
          .status-seguimiento {
            background: #fef3c7;
            color: #92400e;
          }
          
          .status-alta {
            background: #dbeafe;
            color: #1e40af;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section h3 {
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 18px;
          }
          
          .history-entry {
            background: white;
            border: 1px solid #e5e7eb;
            border-left: 4px solid #2563eb;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 0 8px 8px 0;
          }
          
          .history-header {
            display: flex;
            justify-content: between;
            align-items: center;
            margin-bottom: 10px;
          }
          
          .history-treatment {
            font-weight: bold;
            color: #2563eb;
            font-size: 16px;
          }
          
          .history-date {
            color: #666;
            font-size: 14px;
          }
          
          .history-notes {
            color: #555;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .history-evolution {
            color: #2563eb;
            font-weight: 500;
            font-size: 14px;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            text-align: center;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          
          .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
          }
          
          .stat-label {
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          
          .no-data {
            text-align: center;
            color: #888;
            font-style: italic;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .header {
              page-break-after: avoid;
            }
            
            .section {
              page-break-inside: avoid;
            }
            
            .history-entry {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🦴 Fisioterapia - Lic. Agustín</h1>
          <h2>Ficha del Paciente</h2>
          <div class="date">Generado el ${currentDate}</div>
        </div>

        <div class="patient-info">
          <h3>Información Personal</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Nombre Completo</span>
              <span class="info-value">${patient.name}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Cédula</span>
              <span class="info-value">${patient.cedula}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Teléfono</span>
              <span class="info-value">${patient.phone}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Email</span>
              <span class="info-value">${patient.email}</span>
            </div>
            ${
              patient.address
                ? `
            <div class="info-item">
              <span class="info-label">Dirección</span>
              <span class="info-value">${patient.address}</span>
            </div>
            `
                : ""
            }
            ${
              patient.birthDate
                ? `
            <div class="info-item">
              <span class="info-label">Fecha de Nacimiento</span>
              <span class="info-value">${new Date(patient.birthDate).toLocaleDateString("es-ES")} (${age} años)</span>
            </div>
            `
                : ""
            }
            ${
              patient.gender
                ? `
            <div class="info-item">
              <span class="info-label">Género</span>
              <span class="info-value">${patient.gender}</span>
            </div>
            `
                : ""
            }
            <div class="info-item">
              <span class="info-label">Estado</span>
              <span class="info-value">
                <span class="status-badge status-${patient.status.toLowerCase()}">${patient.status}</span>
              </span>
            </div>
          </div>
          ${
            patient.notes
              ? `
          <div class="info-item">
            <span class="info-label">Notas</span>
            <span class="info-value">${patient.notes}</span>
          </div>
          `
              : ""
          }
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${patient.treatments}</div>
            <div class="stat-label">Tratamientos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${patient.medicalHistory?.length || 0}</div>
            <div class="stat-label">Entradas en Historial</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${Math.floor(
              (new Date().getTime() - new Date(patient.createdAt).getTime()) / (1000 * 60 * 60 * 24),
            )}</div>
            <div class="stat-label">Días como Paciente</div>
          </div>
        </div>

        <div class="section">
          <h3>📋 Historial Médico</h3>
          ${
            patient.medicalHistory && patient.medicalHistory.length > 0
              ? patient.medicalHistory
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(
                    (entry) => `
                  <div class="history-entry">
                    <div class="history-header">
                      <span class="history-treatment">${entry.treatment}</span>
                      <span class="history-date">${new Date(entry.date).toLocaleDateString("es-ES")}</span>
                    </div>
                    ${entry.notes ? `<div class="history-notes"><strong>Notas:</strong> ${entry.notes}</div>` : ""}
                    ${
                      entry.evolution
                        ? `<div class="history-evolution"><strong>Evolución:</strong> ${entry.evolution}</div>`
                        : ""
                    }
                  </div>
                `,
                  )
                  .join("")
              : '<div class="no-data">No hay entradas en el historial médico</div>'
          }
        </div>

        <div class="footer">
          <p><strong>Lic. Agustín - Fisioterapeuta Profesional</strong></p>
          <p>Documento generado automáticamente el ${new Date().toLocaleString("es-ES")}</p>
          <p>Este documento contiene información médica confidencial</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    }

    toast({
      title: "PDF generado",
      description: "Se ha abierto la ventana de impresión para generar el PDF",
    })
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️"
    if (type.startsWith("video/")) return "🎥"
    if (type.includes("pdf")) return "📄"
    if (type.includes("word")) return "📝"
    return "📎"
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
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/pacientes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <User className="w-8 h-8" />
              <span>{patient.name}</span>
            </h1>
            <p className="text-gray-600 mt-1">👤 Información detallada del paciente</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={generatePDF} className="flex items-center space-x-2">
            <FileDown className="w-4 h-4" />
            <span>Exportar PDF</span>
          </Button>
          <Link href={`/dashboard/pacientes/${patient.id}/editar`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button variant="outline" onClick={handleDeletePatient} className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Información Personal</span>
                <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{patient.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Cédula</p>
                    <p className="font-medium">{patient.cedula}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>
              </div>

              {patient.address && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium">{patient.address}</p>
                  </div>
                </div>
              )}

              {patient.birthDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                    <p className="font-medium">{new Date(patient.birthDate).toLocaleDateString("es-ES")}</p>
                  </div>
                </div>
              )}

              {patient.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Notas</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{patient.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Historial Médico</span>
                </CardTitle>
                <Button size="sm" onClick={() => setShowAddHistory(!showAddHistory)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Entrada
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAddHistory && (
                <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-4">Nueva Entrada</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="date">Fecha *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newHistoryEntry.date}
                        onChange={(e) => setNewHistoryEntry((prev) => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="treatment">Tratamiento *</Label>
                      <Input
                        id="treatment"
                        value={newHistoryEntry.treatment}
                        onChange={(e) => setNewHistoryEntry((prev) => ({ ...prev, treatment: e.target.value }))}
                        placeholder="Tipo de tratamiento"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Notas</Label>
                      <Textarea
                        id="notes"
                        value={newHistoryEntry.notes}
                        onChange={(e) => setNewHistoryEntry((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Observaciones del tratamiento"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="evolution">Evolución</Label>
                      <Textarea
                        id="evolution"
                        value={newHistoryEntry.evolution}
                        onChange={(e) => setNewHistoryEntry((prev) => ({ ...prev, evolution: e.target.value }))}
                        placeholder="Evolución del paciente"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setShowAddHistory(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddHistory}>Guardar</Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                  patient.medicalHistory
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => (
                      <div key={entry.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{entry.treatment}</h4>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                        {entry.notes && <p className="text-sm text-gray-600 mb-2">{entry.notes}</p>}
                        {entry.evolution && <p className="text-sm text-blue-600 font-medium">{entry.evolution}</p>}
                      </div>
                    ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay entradas en el historial médico</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowAddHistory(true)}>
                      Agregar Primera Entrada
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{patient.treatments}</div>
                <p className="text-sm text-gray-600">Tratamientos</p>
              </div>
              <Separator />
              <div className="text-center">
                <div className="text-lg font-medium">{new Date(patient.createdAt).toLocaleDateString("es-ES")}</div>
                <p className="text-sm text-gray-600">Fecha de registro</p>
              </div>
              <Separator />
              <div className="text-center">
                <div className="text-lg font-medium">{patient.medicalHistory?.length || 0}</div>
                <p className="text-sm text-gray-600">Entradas en historial</p>
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Archivos</span>
                </CardTitle>
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button size="sm" asChild>
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Subir
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
              <CardDescription>Fotos, videos, documentos y otros archivos del paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.length > 0 ? (
                  files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-lg">{getFileIcon(file.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • {new Date(file.uploadDate).toLocaleDateString("es-ES")}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" asChild>
                          <a href={file.url} download={file.name}>
                            <Download className="w-3 h-3" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No hay archivos subidos</p>
                    <label htmlFor="file-upload">
                      <Button variant="outline" size="sm" className="mt-2" asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Subir Primer Archivo
                        </span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
