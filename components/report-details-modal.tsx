"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SOSReport } from "@/lib/supabase"
import { MapPin, Clock, User, Phone, Mail, Flag, Camera, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface ReportDetailsModalProps {
  report: SOSReport | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (reportId: string, status: string, notes: string) => void
}

export function ReportDetailsModal({ report, isOpen, onClose, onStatusUpdate }: ReportDetailsModalProps) {
  const [newStatus, setNewStatus] = useState("")
  const [newNote, setNewNote] = useState("")

  if (!report) return null

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

  const formatTime = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleString()
  }

  const handleStatusUpdate = () => {
    if (newStatus && newNote.trim()) {
      onStatusUpdate(report.id, newStatus, newNote)
      setNewStatus("")
      setNewNote("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Emergency Report Details - {report.id}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <Badge className={getPriorityColor(report.priority)}>{report.priority.toUpperCase()} PRIORITY</Badge>
            <Badge variant="outline" className={getStatusColor(report.status)}>
              {report.status.replace("-", " ").toUpperCase()}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTime(report.timestamp)}
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Tourist Information
              </h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{report.user_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{report.user_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{report.user_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-muted-foreground" />
                  <span>{report.user_nationality}</span>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </h3>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{report.address}</p>
                    {report.landmark && (
                      <p className="text-sm text-muted-foreground">{report.landmark}</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Coordinates: {report.latitude}, {report.longitude}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Incident Information
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div>
                <span className="font-medium">Type: </span>
                <Badge variant="outline" className="capitalize">
                  {report.incident_type} Emergency
                </Badge>
              </div>
              <div>
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-sm">{report.incident_description}</p>
              </div>

              {/* Photos */}
              {report.photos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="h-4 w-4" />
                    <span className="font-medium">Photos ({report.photos.length})</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {report.photos.map((photo: string, index: number) => (
                      <div key={index} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <Image
                          src={photo || "/placeholder.svg"}
                          alt={`Incident photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Response Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Response Status</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              {report.assigned_unit ? (
                <div>
                  <span className="font-medium">Assigned to: </span>
                  <Badge variant="outline">{report.assigned_unit}</Badge>
                </div>
              ) : (
                <div className="text-red-600 font-medium">⚠ Awaiting assignment</div>
              )}

              {report.estimated_arrival && (
                <div>
                  <span className="font-medium">ETA: </span>
                  <span>{formatTime(report.estimated_arrival)}</span>
                </div>
              )}

              {report.notes.length > 0 && (
                <div>
                  <span className="font-medium">Response Notes:</span>
                  <ul className="mt-1 space-y-1">
                    {report.notes.map((note: string, index: number) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Update Status Section */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-lg">Update Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="false-alarm">False Alarm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Add Note</label>
                <Textarea
                  placeholder="Add response note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleStatusUpdate} disabled={!newStatus || !newNote.trim()}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Status
              </Button>
              <Button variant="outline" onClick={onClose}>
                <XCircle className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
