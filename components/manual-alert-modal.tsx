"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AlertTriangle, MapPin, Camera, Plus, X, Target } from "lucide-react"
import { useState } from "react"

interface ManualAlertModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateAlert: (alertData: any) => void
}

export function ManualAlertModal({ isOpen, onClose, onCreateAlert }: ManualAlertModalProps) {
  const [formData, setFormData] = useState({
    priority: "",
    incidentType: "",
    description: "",
    location: {
      address: "",
      landmark: "",
      latitude: "",
      longitude: "",
    },
    assignedTo: "",
  })

  const [photos, setPhotos] = useState<string[]>([])

  const handleInputChange = (section: string, field: string, value: string) => {
    if (section === "location") {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString(),
            },
          }))
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get current location. Please enter coordinates manually.")
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  const handleSubmit = () => {
    const alertData = {
      title: `${formData.incidentType} Emergency`,
      description: formData.description,
      location: formData.location.address || `${formData.location.latitude}, ${formData.location.longitude}`,
      priority: formData.priority,
      reportedBy: "Police Authority",
      assignedTo: formData.assignedTo,
      photos,
    }

    console.log("[v0] Creating police manual alert:", alertData)
    
    // Dispatch custom event for manual alerts component
    const event = new CustomEvent('newManualAlert', { detail: alertData })
    window.dispatchEvent(event)
    
    // Also call the original callback for backward compatibility
    onCreateAlert(alertData)

    // Reset form
    setFormData({
      priority: "",
      incidentType: "",
      description: "",
      location: { address: "", landmark: "", latitude: "", longitude: "" },
      assignedTo: "",
    })
    setPhotos([])
    onClose()
  }

  const isFormValid = () => {
    return (
      formData.priority &&
      formData.incidentType &&
      formData.description &&
      formData.location.latitude &&
      formData.location.longitude
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Report Emergency at Location
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Report an emergency situation at specific coordinates for immediate response
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Priority and Incident Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level *</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange("", "priority", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incidentType">Incident Type *</Label>
              <Select
                value={formData.incidentType}
                onValueChange={(value) => handleInputChange("", "incidentType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medical">Medical Emergency</SelectItem>
                  <SelectItem value="theft">Theft/Robbery</SelectItem>
                  <SelectItem value="assault">Assault</SelectItem>
                  <SelectItem value="lost">Lost Tourist</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="suspicious">Suspicious Activity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Emergency Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the emergency situation and any immediate actions needed..."
              value={formData.description}
              onChange={(e) => handleInputChange("", "description", e.target.value)}
              rows={3}
            />
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Emergency Location *
              </h3>
              <Button variant="outline" size="sm" onClick={getCurrentLocation}>
                <Target className="h-4 w-4 mr-1" />
                Use Current Location
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  placeholder="e.g., 40.7128"
                  value={formData.location.latitude}
                  onChange={(e) => handleInputChange("location", "latitude", e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  placeholder="e.g., -74.0060"
                  value={formData.location.longitude}
                  onChange={(e) => handleInputChange("location", "longitude", e.target.value)}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address/Description</Label>
                <Input
                  id="address"
                  placeholder="Street address or location description"
                  value={formData.location.address}
                  onChange={(e) => handleInputChange("location", "address", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landmark">Nearby Landmark</Label>
                <Input
                  id="landmark"
                  placeholder="e.g., Near Central Park entrance"
                  value={formData.location.landmark}
                  onChange={(e) => handleInputChange("location", "landmark", e.target.value)}
                />
              </div>
            </div>

            {formData.location.latitude && formData.location.longitude && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Coordinates:</strong> {formData.location.latitude}, {formData.location.longitude}
                </p>
                <p className="text-xs text-blue-600 mt-1">Emergency will be marked at this exact location on the map</p>
              </div>
            )}
          </div>

          {/* Photos Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Evidence Photos ({photos.length})
              </h3>
              <Button variant="outline" size="sm" onClick={() => setPhotos((prev) => [...prev, "/placeholder.svg"])}>
                <Plus className="h-4 w-4 mr-1" />
                Add Photo
              </Button>
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assignment */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign to Response Unit</Label>
            <Select value={formData.assignedTo} onValueChange={(value) => handleInputChange("", "assignedTo", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select response unit (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unit Alpha-7">Unit Alpha-7 (Medical)</SelectItem>
                <SelectItem value="Officer Martinez">Officer Martinez (Police)</SelectItem>
                <SelectItem value="Tourist Guide Unit">Tourist Guide Unit</SelectItem>
                <SelectItem value="Unit Bravo-3">Unit Bravo-3 (Police)</SelectItem>
                <SelectItem value="Fire Rescue 12">Fire Rescue 12 (Fire)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSubmit} disabled={!isFormValid()} className="flex-1">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report Emergency at Location
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
