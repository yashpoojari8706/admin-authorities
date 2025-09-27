// Mock data structure for SOS reports from tourist safety app
export interface SOSReport {
  id: string
  timestamp: Date
  status: "pending" | "in-progress" | "resolved" | "false-alarm"
  priority: "low" | "medium" | "high" | "critical"
  user: {
    name: string
    phone: string
    email: string
    nationality: string
  }
  location: {
    latitude: number
    longitude: number
    address: string
    landmark?: string
    coordinates?: [number, number]
  }
  incident: {
    type: "medical" | "theft" | "assault" | "lost" | "accident" | "other"
    description: string
    photos: string[]
  }
  response: {
    assignedTo?: string
    estimatedArrival?: Date
    notes: string[]
  }
  incidentType?: string
}

// Mock SOS reports data (deprecated - now using real Supabase data)
export const mockSOSReports: any[] = [
  {
    id: "SOS-001",
    timestamp: new Date("2024-01-15T14:30:00Z"),
    status: "critical",
    priority: "critical",
    user: {
      name: "Sarah Johnson",
      phone: "+1-555-0123",
      email: "sarah.j@email.com",
      nationality: "USA",
    },
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: "123 Tourist Plaza, Downtown",
      landmark: "Near Central Park",
    },
    incident: {
      type: "medical",
      description: "Tourist collapsed, appears to be having difficulty breathing",
      photos: ["/placeholder-zk5vs.png"],
    },
    response: {
      assignedTo: "Unit Alpha-7",
      estimatedArrival: new Date("2024-01-15T14:45:00Z"),
      notes: ["Paramedics dispatched", "Tourist conscious but distressed"],
    },
    incidentType: "medical",
  },
  {
    id: "SOS-002",
    timestamp: new Date("2024-01-15T13:15:00Z"),
    status: "in-progress",
    priority: "high",
    user: {
      name: "Marco Rodriguez",
      phone: "+34-600-123456",
      email: "marco.r@email.com",
      nationality: "Spain",
    },
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: "456 Market Street",
      landmark: "Times Square area",
    },
    incident: {
      type: "theft",
      description: "Wallet and passport stolen by pickpocket",
      photos: ["/crowded-tourist-area-theft-scene.jpg"],
    },
    response: {
      assignedTo: "Officer Martinez",
      notes: ["Report filed", "Checking nearby CCTV footage"],
    },
    incidentType: "theft",
  },
  {
    id: "SOS-003",
    timestamp: new Date("2024-01-15T12:00:00Z"),
    status: "resolved",
    priority: "medium",
    user: {
      name: "Emma Thompson",
      phone: "+44-7700-900123",
      email: "emma.t@email.com",
      nationality: "UK",
    },
    location: {
      latitude: 40.7505,
      longitude: -73.9934,
      address: "789 Heritage Avenue",
      landmark: "Museum District",
    },
    incident: {
      type: "lost",
      description: "Lost in unfamiliar area, phone battery dead",
      photos: ["/confused-tourist-on-street.jpg"],
    },
    response: {
      assignedTo: "Tourist Guide Unit",
      notes: ["Tourist safely escorted to hotel", "Provided emergency contact info"],
    },
    incidentType: "lost",
  },
  {
    id: "SOS-004",
    timestamp: new Date("2024-01-15T11:30:00Z"),
    status: "pending",
    priority: "high",
    user: {
      name: "Yuki Tanaka",
      phone: "+81-90-1234-5678",
      email: "yuki.t@email.com",
      nationality: "Japan",
    },
    location: {
      latitude: 40.7282,
      longitude: -74.0776,
      address: "321 Waterfront Drive",
      landmark: "Harbor View",
    },
    incident: {
      type: "accident",
      description: "Bicycle accident, minor injuries but unable to move bike",
      photos: ["/bicycle-accident-scene.jpg"],
    },
    response: {
      notes: ["Awaiting response unit assignment"],
    },
    incidentType: "accident",
  },
  {
    id: "SOS-005",
    timestamp: new Date("2024-01-15T10:45:00Z"),
    status: "false-alarm",
    priority: "low",
    user: {
      name: "Pierre Dubois",
      phone: "+33-6-12-34-56-78",
      email: "pierre.d@email.com",
      nationality: "France",
    },
    location: {
      latitude: 40.7614,
      longitude: -73.9776,
      address: "654 Shopping District",
      landmark: "Fashion Avenue",
    },
    incident: {
      type: "other",
      description: "Accidentally pressed SOS button while taking photos",
      photos: [],
    },
    response: {
      notes: ["Confirmed false alarm via callback", "User apologized for mistake"],
    },
    incidentType: "other",
  },
  {
    id: "SOS-MUM-001",
    timestamp: new Date("2024-01-15T16:45:00Z"),
    status: "pending",
    priority: "critical",
    user: {
      name: "Raj Patel",
      phone: "+91-98765-43210",
      email: "raj.p@email.com",
      nationality: "India",
    },
    location: {
      latitude: 19.076,
      longitude: 72.8777,
      address: "Gateway of India, Apollo Bandar, Colaba",
      landmark: "Gateway of India Monument",
    },
    incident: {
      type: "medical",
      description: "Tourist experiencing severe chest pain near Gateway of India",
      photos: ["/placeholder-zk5vs.png"],
    },
    response: {
      assignedTo: "Mumbai Emergency Unit-1",
      estimatedArrival: new Date("2024-01-15T17:00:00Z"),
      notes: ["Ambulance dispatched", "Critical medical emergency"],
    },
    incidentType: "medical",
  },
  {
    id: "SOS-MUM-002",
    timestamp: new Date("2024-01-15T15:30:00Z"),
    status: "in-progress",
    priority: "high",
    user: {
      name: "Lisa Chen",
      phone: "+86-138-0013-8000",
      email: "lisa.c@email.com",
      nationality: "China",
    },
    location: {
      latitude: 19.033,
      longitude: 72.8297,
      address: "Juhu Beach, Juhu Tara Road",
      landmark: "Juhu Beach Main Area",
    },
    incident: {
      type: "theft",
      description: "Bag snatching incident at Juhu Beach, passport and money stolen",
      photos: ["/crowded-tourist-area-theft-scene.jpg"],
    },
    response: {
      assignedTo: "Juhu Police Station",
      notes: ["Police team dispatched", "Searching for suspects"],
    },
    incidentType: "theft",
  },
  {
    id: "SOS-MUM-003",
    timestamp: new Date("2024-01-15T14:15:00Z"),
    status: "pending",
    priority: "high",
    user: {
      name: "Ahmed Hassan",
      phone: "+971-50-123-4567",
      email: "ahmed.h@email.com",
      nationality: "UAE",
    },
    location: {
      latitude: 19.0825,
      longitude: 72.8231,
      address: "Marine Drive, Nariman Point",
      landmark: "Queen's Necklace Promenade",
    },
    incident: {
      type: "assault",
      description: "Tourist harassed and threatened by group near Marine Drive",
      photos: ["/placeholder-zk5vs.png"],
    },
    response: {
      assignedTo: "Marine Drive Patrol",
      notes: ["Patrol unit en route", "High priority response"],
    },
    incidentType: "assault",
  },
  {
    id: "SOS-MUM-004",
    timestamp: new Date("2024-01-15T13:45:00Z"),
    status: "in-progress",
    priority: "medium",
    user: {
      name: "Sophie Martin",
      phone: "+33-6-98-76-54-32",
      email: "sophie.m@email.com",
      nationality: "France",
    },
    location: {
      latitude: 19.0896,
      longitude: 72.8656,
      address: "Crawford Market, Dr. Dadabhai Naoroji Rd",
      landmark: "Crawford Market Main Entrance",
    },
    incident: {
      type: "lost",
      description: "Lost in Crawford Market area, unable to find way back to hotel",
      photos: ["/confused-tourist-on-street.jpg"],
    },
    response: {
      assignedTo: "Tourist Helpline Team",
      notes: ["Guide dispatched to assist", "Providing directions"],
    },
    incidentType: "lost",
  },
  {
    id: "SOS-MUM-005",
    timestamp: new Date("2024-01-15T12:30:00Z"),
    status: "resolved",
    priority: "medium",
    user: {
      name: "James Wilson",
      phone: "+44-7911-123456",
      email: "james.w@email.com",
      nationality: "UK",
    },
    location: {
      latitude: 19.1136,
      longitude: 72.8697,
      address: "Bandra-Worli Sea Link, Bandra West",
      landmark: "Sea Link Viewpoint",
    },
    incident: {
      type: "accident",
      description: "Minor vehicle accident near Sea Link, tourist vehicle breakdown",
      photos: ["/bicycle-accident-scene.jpg"],
    },
    response: {
      assignedTo: "Traffic Police Unit",
      notes: ["Vehicle towed", "Tourist provided alternate transport", "Case resolved"],
    },
    incidentType: "accident",
  },
  {
    id: "SOS-MUM-006",
    timestamp: new Date("2024-01-15T11:00:00Z"),
    status: "pending",
    priority: "critical",
    user: {
      name: "Maria Santos",
      phone: "+55-11-98765-4321",
      email: "maria.s@email.com",
      nationality: "Brazil",
    },
    location: {
      latitude: 19.0176,
      longitude: 72.8562,
      address: "Chhatrapati Shivaji Terminus, Fort",
      landmark: "CST Railway Station Main Building",
    },
    incident: {
      type: "medical",
      description: "Tourist collapsed at CST station, unconscious and unresponsive",
      photos: ["/placeholder-zk5vs.png"],
    },
    response: {
      assignedTo: "Railway Police & Medical Team",
      estimatedArrival: new Date("2024-01-15T11:15:00Z"),
      notes: ["Emergency medical team dispatched", "Critical condition"],
    },
    incidentType: "medical",
  },
]

// Statistics for dashboard overview
export const dashboardStats = {
  totalReports: mockSOSReports.length,
  activeReports: mockSOSReports.filter((r) => r.status === "pending" || r.status === "in-progress").length,
  resolvedToday: mockSOSReports.filter((r) => r.status === "resolved").length,
  criticalAlerts: mockSOSReports.filter((r) => r.priority === "critical").length,
  averageResponseTime: "8.5 minutes",
  responseRate: "94%",
}

export const mockReports = mockSOSReports.map((report) => ({
  ...report,
  incidentType: report.incident.type,
  location: {
    ...report.location,
    coordinates: [report.location.latitude, report.location.longitude] as [number, number],
  },
}))
