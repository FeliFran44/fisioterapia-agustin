"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { getAppointments, type Appointment } from "@/lib/db"

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    const loadedAppointments = getAppointments()
    setAppointments(loadedAppointments)
  }, [])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return appointments.filter((apt) => apt.date === dateString)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmada":
        return "bg-green-100 text-green-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "cancelada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const days = getDaysInMonth(currentDate)
  const selectedDateAppointments = getAppointmentsForDate(selectedDate)
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Calendar className="w-8 h-8" />
            <span>Agenda de Citas</span>
          </h1>
          <p className="text-gray-600 mt-1">📅 Gestiona las citas y horarios de tus pacientes</p>
        </div>
        <Link href="/dashboard/agenda/nueva">
          <Button className="mt-4 md:mt-0 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nueva Cita</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2 h-20"></div>
                }

                const dayAppointments = getAppointmentsForDate(day)
                const isSelected = day.toDateString() === selectedDate.toDateString()
                const isToday = day.toDateString() === new Date().toDateString()

                return (
                  <div
                    key={index}
                    className={`p-2 h-20 border rounded cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-100 border-blue-300"
                        : isToday
                          ? "bg-green-50 border-green-200"
                          : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="text-sm font-medium">{day.getDate()}</div>
                    {dayAppointments.length > 0 && (
                      <div className="mt-1">
                        <div className="text-xs bg-blue-500 text-white rounded px-1">
                          {dayAppointments.length} cita{dayAppointments.length > 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Appointments for selected date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Citas del Día</span>
            </CardTitle>
            <CardDescription>
              {selectedDate.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No hay citas programadas</p>
                <Link href="/dashboard/agenda/nueva">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Cita
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{appointment.time}</div>
                        <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{appointment.patientName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {appointment.type} ({appointment.duration} min)
                          </span>
                        </div>
                        {appointment.notes && <div className="text-xs text-gray-500 mt-2">{appointment.notes}</div>}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{appointments.length}</div>
            <p className="text-sm text-gray-600">Total Citas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter((a) => a.status === "confirmada").length}
            </div>
            <p className="text-sm text-gray-600">Confirmadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter((a) => a.status === "pendiente").length}
            </div>
            <p className="text-sm text-gray-600">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {appointments.filter((a) => a.status === "cancelada").length}
            </div>
            <p className="text-sm text-gray-600">Canceladas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
