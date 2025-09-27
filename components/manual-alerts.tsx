"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, MapPin, User, Eye, X } from "lucide-react"

interface ManualAlert {
  id: string
  title: string
  description: string
  location: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  reportedBy: string
  status: 'active' | 'resolved'
}

export function ManualAlerts() {
  const [manualAlerts, setManualAlerts] = useState<ManualAlert[]>([])

  // Load manual alerts from localStorage on component mount
  useEffect(() => {
    const savedAlerts = localStorage.getItem('manualAlerts')
    if (savedAlerts) {
      const alerts = JSON.parse(savedAlerts).map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp)
      }))
      setManualAlerts(alerts)
    }
  }, [])

  // Listen for new manual alerts
  useEffect(() => {
    const handleNewAlert = (event: CustomEvent) => {
      const newAlert: ManualAlert = {
        ...event.detail,
        id: `MANUAL-${Date.now()}`,
        timestamp: new Date(),
        status: 'active' as const
      }
      
      setManualAlerts(prev => {
        const updated = [newAlert, ...prev]
        localStorage.setItem('manualAlerts', JSON.stringify(updated))
        return updated
      })
    }

    window.addEventListener('newManualAlert', handleNewAlert as EventListener)
    return () => window.removeEventListener('newManualAlert', handleNewAlert as EventListener)
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const resolveAlert = (alertId: string) => {
    setManualAlerts(prev => {
      const updated = prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'resolved' as const } : alert
      )
      localStorage.setItem('manualAlerts', JSON.stringify(updated))
      return updated
    })
  }

  const deleteAlert = (alertId: string) => {
    setManualAlerts(prev => {
      const updated = prev.filter(alert => alert.id !== alertId)
      localStorage.setItem('manualAlerts', JSON.stringify(updated))
      return updated
    })
  }

  const activeAlerts = manualAlerts.filter(alert => alert.status === 'active')

  if (activeAlerts.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          Manual Alerts ({activeAlerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeAlerts.map((alert) => (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4 bg-orange-50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(alert.priority)}>
                    {alert.priority.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium text-gray-600">
                    {alert.id}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {alert.timestamp.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                  <p className="text-xs text-muted-foreground">{alert.description}</p>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm">{alert.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm">Reported by:</p>
                    <p className="text-xs text-muted-foreground">{alert.reportedBy}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-orange-200">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  Manual Alert
                </Badge>
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
