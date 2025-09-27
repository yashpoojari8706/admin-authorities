"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRealtimeReports } from "@/lib/hooks/useRealtimeReports"
import { ReportDetailsModal } from "@/components/report-details-modal"
import { MapPin, Clock, User, Phone, Eye, MoreHorizontal } from "lucide-react"
import { useState } from "react"

export function RecentReports() {
  const { reports: recentReports, loading, error } = useRealtimeReports(10)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All SOS Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All SOS Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">⚠️ Unable to load reports</div>
            <p className="text-sm text-muted-foreground mb-4">
              This might be because the database hasn't been set up yet.
            </p>
            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-2">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-left">
                <li>Go to your <a href="https://app.supabase.com/project/ewqguiitezhxkzbmyioo" target="_blank" className="text-blue-600 underline">Supabase Dashboard</a></li>
                <li>Navigate to SQL Editor</li>
                <li>Copy and paste the contents of <code>supabase/complete_setup.sql</code></li>
                <li>Click Run to execute the script</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    )
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

  const formatTime = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const handleViewDetails = (report: any) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const handleStatusUpdate = (reportId: string, status: string, notes: string) => {
    console.log('Status update:', { reportId, status, notes })
    setIsModalOpen(false)
    // In a real app, this would update the database
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">All SOS Reports</CardTitle>
            <Button variant="outline" size="sm">
              View All Reports
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-medium">{report.id}</span>
                    <Badge className={getPriorityColor(report.priority)} size="sm">
                      {report.priority}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(report.status)} size="sm">
                      {report.status.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(report.timestamp)} at {formatTime(report.timestamp)}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{report.user_name}</p>
                      <p className="text-xs text-muted-foreground">{report.user_nationality}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{report.user_phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">{report.address}</p>
                      {report.landmark && (
                        <p className="text-xs text-muted-foreground">{report.landmark}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium capitalize mb-1">{report.incident_type} Emergency</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{report.incident_description}</p>
                  </div>

                  <div>
                    {report.assigned_unit ? (
                      <div>
                        <p className="text-sm font-medium">Assigned to:</p>
                        <p className="text-xs text-muted-foreground">{report.assigned_unit}</p>
                        {report.estimated_arrival && (
                          <p className="text-xs text-blue-600 mt-1">
                            ETA:{" "}
                            {new Date(report.estimated_arrival).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-red-600">⚠ Awaiting assignment</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {report.photo_count > 0 && (
                      <Badge variant="secondary" size="sm">
                        {report.photo_count} Photo{report.photo_count > 1 ? "s" : ""}
                      </Badge>
                    )}
                    {report.notes_count > 0 && (
                      <Badge variant="secondary" size="sm">
                        {report.notes_count} Note{report.notes_count > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(report)}>
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <ReportDetailsModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  )
}
