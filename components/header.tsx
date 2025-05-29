"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Users, Calendar, BarChart3, Settings, LogOut, Menu, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Header() {
  const [currentTime, setCurrentTime] = useState("")
  const [username, setUsername] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      )
    }

    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("username")
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente",
    })
    router.push("/")
  }

  const navigation = [
    { name: "Inicio", href: "/dashboard", icon: Home },
    { name: "Pacientes", href: "/dashboard/pacientes", icon: Users },
    { name: "Agenda", href: "/dashboard/agenda", icon: Calendar },
    { name: "Reportes", href: "/dashboard/reportes", icon: BarChart3 },
    { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🦴</span>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Fisioterapia</h1>
                <p className="text-xs text-gray-600">Lic. Agustín</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Info and Logout */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">Hola, {username}</p>
              <p className="text-xs text-gray-600 capitalize">{currentTime}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-1">
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              <div className="border-t pt-2 mt-2">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-800">Hola, {username}</p>
                  <p className="text-xs text-gray-600 capitalize">{currentTime}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="mx-3 flex items-center space-x-1">
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
