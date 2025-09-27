"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRealtimeReports } from "@/lib/hooks/useRealtimeReports"
import { MapPin, Clock, User, AlertTriangle, Eye } from "lucide-react"
import { ReportDetailsModal } from "@/components/report-details-modal"
import { ManualAlertModal } from "@/components/manual-alert-modal"
import { ResponseUnitManagementModal } from "@/components/response-unit-management-modal"
import { useState } from "react"

export function DashboardOverview() {
  const { reports: realtimeReports, loading } = useRealtimeReports(5)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isManualAlertOpen, setIsManualAlertOpen] = useState(false)
  const [isUnitManagementOpen, setIsUnitManagementOpen] = useState(false)

  const [responseUnits, setResponseUnits] = useState([
    {
      id: "unit-1",
      name: "Unit Alpha-7",
      type: "medical" as const,
      status: "on-scene" as const,
      location: "123 Tourist Plaza",
      assignedTo: "SOS-001",
      lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
      contact: "Radio Ch. 7",
    },
    {
      id: "unit-2",
      name: "Officer Martinez",
      type: "police" as const,
      status: "dispatched" as const,
      location: "En route to Market St",
      assignedTo: "SOS-002",
      lastUpdate: new Date(Date.now() - 5 * 60 * 1000),
      contact: "+1-555-0199",
    },
    {
      id: "unit-3",
      name: "Tourist Guide Unit",
      type: "tourist-guide" as const,
      status: "available" as const,
      location: "Central Station",
      lastUpdate: new Date(Date.now() - 10 * 60 * 1000),
      contact: "+1-555-0177",
    },
    {
      id: "unit-4",
      name: "Unit Bravo-3",
      type: "police" as const,
      status: "available" as const,
      location: "Harbor Patrol",
      lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
      contact: "Radio Ch. 3",
    },
    {
      id: "unit-5",
      name: "Fire Rescue 12",
      type: "fire" as const,
      status: "returning" as const,
      location: "Returning to Station",
      lastUpdate: new Date(Date.now() - 8 * 60 * 1000),
      contact: "Radio Ch. 12",
    },
  ])

  const activeReports = realtimeReports.filter(
    (report: any) => report.status === "pending" || report.status === "in-progress",
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-600 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800 border-red-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "false-alarm":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const handleViewDetails = (report: any) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = (reportId: any, status: any, notes: any) => {
    console.log("[v0] Status update:", { reportId, status, notes })
    setIsModalOpen(false)
  }

  const handleCreateManualAlert = (alertData: any) => {
    console.log("[v0] Manual alert created:", alertData)
    // In a real app, this would save to database
  }

  const handleDispatchUnit = (unitId: any, reportId: any, instructions: any) => {
    console.log("[v0] Dispatching unit:", { unitId, reportId, instructions })
    setResponseUnits((prev: any) =>
      prev.map((unit: any) =>
        unit.id === unitId ? { ...unit, status: "dispatched", assignedTo: reportId, lastUpdate: new Date() } : unit,
      ),
    )
  }

  const handleUpdateUnitStatus = (unitId: any, status: any, location: any) => {
    console.log("[v0] Updating unit status:", { unitId, status, location })
    setResponseUnits((prev: any) =>
      prev.map((unit: any) => (unit.id === unitId ? { ...unit, status, location, lastUpdate: new Date() } : unit)),
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Emergency Alerts
            </CardTitle>
            <Badge variant="destructive" className="text-xs">
              {activeReports.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {activeReports.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active emergencies at this time</p>
          ) : (
            <div className="space-y-4">
              {activeReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(report.priority)}>{report.priority.toUpperCase()}</Badge>
                      <Badge variant="outline" className={getStatusColor(report.status)}>
                        {report.status.replace("-", " ").toUpperCase()}
                      </Badge>
                      <span className="text-sm font-mono text-muted-foreground">{report.id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(new Date(report.timestamp))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{report.user_name}</p>
                        <p className="text-xs text-muted-foreground">{report.user_nationality}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{report.address}</p>
                        <p className="text-xs text-muted-foreground">{report.landmark}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium capitalize">{report.incident_type} Emergency</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{report.incident_description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {report.assigned_unit ? (
                        <span>
                          Assigned to: <strong>{report.assigned_unit}</strong>
                        </span>
                      ) : (
                        <span className="text-red-600">⚠ Awaiting assignment</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs bg-transparent"
                      onClick={() => handleViewDetails(report)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => setIsManualAlertOpen(true)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Create Manual Alert
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              View Live Map
            </Button>
            <Button
              className="w-full justify-start bg-transparent"
              variant="outline"
              onClick={() => setIsUnitManagementOpen(true)}
            >
              <User className="h-4 w-4 mr-2" />
              Manage Response Units
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">SOS Network</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-green-600">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">GPS Tracking</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-green-600">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Response Units</span>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-yellow-600">7/12 Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today's Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Reports</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Resolved</span>
              <span className="font-medium text-green-600">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">In Progress</span>
              <span className="font-medium text-blue-600">1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="font-medium text-red-600">1</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <ReportDetailsModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />

      <ManualAlertModal
        isOpen={isManualAlertOpen}
        onClose={() => setIsManualAlertOpen(false)}
        onCreateAlert={handleCreateManualAlert}
      />

      <ResponseUnitManagementModal
        isOpen={isUnitManagementOpen}
        onClose={() => setIsUnitManagementOpen(false)}
        units={responseUnits}
        onDispatchUnit={handleDispatchUnit}
        onUpdateUnitStatus={handleUpdateUnitStatus}
      />
    </div>
  )
}
