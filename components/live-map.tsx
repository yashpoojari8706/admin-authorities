"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Map, Maximize2, Filter, RefreshCw, MapPin, Navigation } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useRealtimeReports } from "@/lib/hooks/useRealtimeReports"

declare global {
  interface Window {
    L: any
  }
}

export function LiveMap() {
  const { reports: realtimeReports } = useRealtimeReports()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setLocationError(null)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationError('Unable to get your location')
          // Default to New York if location access is denied
          setUserLocation({ lat: 40.7128, lng: -74.006 })
        }
      )
    } else {
      setLocationError('Geolocation not supported')
      setUserLocation({ lat: 40.7128, lng: -74.006 })
    }
  }, [])

  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !window.L) {
        // Load CSS
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)

        // Load JS
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => {
          setIsMapLoaded(true)
        }
        document.head.appendChild(script)
      } else if (window.L) {
        setIsMapLoaded(true)
      }
    }

    loadLeaflet()
  }, [])

  useEffect(() => {
    if (isMapLoaded && mapRef.current && !mapInstanceRef.current && userLocation) {
      const map = window.L.map(mapRef.current).setView([userLocation.lat, userLocation.lng], 12)

      // Add OpenStreetMap tiles
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      mapInstanceRef.current = map

      // Add user's current location marker
      const userMarker = window.L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 10,
        fillColor: "#3b82f6", // blue
        color: "#ffffff",
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
      }).addTo(map)

      userMarker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-sm">📍 Your Location</h3>
          <p class="text-xs text-gray-600">Current Position</p>
          <p class="text-xs">${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}</p>
        </div>
      `)

      // Add SOS reports from real data
      realtimeReports.forEach((report: any) => {
        if (report.latitude && report.longitude) {
          // Determine marker color based on priority
          let markerColor = "#3b82f6" // blue default
          if (report.priority === "critical")
            markerColor = "#dc2626" // red
          else if (report.priority === "high")
            markerColor = "#ea580c" // orange
          else if (report.priority === "medium") markerColor = "#ca8a04" // yellow

          // Create custom marker
          const marker = window.L.circleMarker([report.latitude, report.longitude], {
            radius: 8,
            fillColor: markerColor,
            color: "#ffffff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map)

          // Add popup with report details
          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold text-sm">${report.incident_type} Emergency</h3>
              <p class="text-xs text-gray-600 mb-1">${report.user_name}</p>
              <p class="text-xs mb-2">${report.address}</p>
              <div class="flex items-center gap-1">
                <span class="inline-block w-2 h-2 rounded-full" style="background-color: ${markerColor}"></span>
                <span class="text-xs capitalize">${report.priority}</span>
              </div>
              <p class="text-xs text-blue-600 mt-1">Status: ${report.status}</p>
            </div>
          `)
        }
      })

      const responseUnits = [
        { name: "Unit Alpha-7", lat: 40.7589, lng: -73.9851, type: "medical" },
        { name: "Officer Martinez", lat: 40.7505, lng: -73.9934, type: "police" },
        { name: "Unit Bravo-3", lat: 40.7282, lng: -74.0776, type: "police" },
        { name: "Fire Rescue 12", lat: 40.7061, lng: -74.0087, type: "fire" },
      ]

      responseUnits.forEach((unit) => {
        const unitMarker = window.L.circleMarker([unit.lat, unit.lng], {
          radius: 6,
          fillColor: "#10b981", // green
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 1,
        }).addTo(map)

        unitMarker.bindPopup(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${unit.name}</h3>
            <p class="text-xs text-gray-600">${unit.type.charAt(0).toUpperCase() + unit.type.slice(1)} Unit</p>
            <p class="text-xs text-green-600">Available</p>
          </div>
        `)
      })
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isMapLoaded, userLocation, realtimeReports])

  const refreshMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize()
    }
  }

  const centerOnUserLocation = () => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Live Emergency Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              Live
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedFilter(selectedFilter === "all" ? "critical" : "all")}
            >
              <Filter className="h-4 w-4 mr-1" />
              {selectedFilter === "all" ? "All" : "Critical"}
            </Button>
            <Button variant="outline" size="sm" onClick={centerOnUserLocation} disabled={!userLocation}>
              <Navigation className="h-4 w-4 mr-1" />
              My Location
            </Button>
            <Button variant="outline" size="sm" onClick={refreshMap}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4 mr-1" />
              Fullscreen
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="w-full h-96 rounded-lg border border-gray-200" style={{ minHeight: "400px" }}>
          {!isMapLoaded && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">Loading Map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Location Status */}
        {locationError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{locationError}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Critical Emergency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span>Low Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Response Unit</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
