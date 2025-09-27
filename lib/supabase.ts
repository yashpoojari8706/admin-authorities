import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types
export interface User {
  id: string
  name: string
  phone: string
  email: string
  nationality: string
  created_at: string
  updated_at: string
}

export interface Authority {
  id: string
  unit_name: string
  unit_type: 'police' | 'medical' | 'fire' | 'tourist_guide'
  contact_phone: string
  contact_email?: string
  is_active: boolean
  current_location?: {
    latitude: number
    longitude: number
  }
  created_at: string
  updated_at: string
}

export interface SOSReport {
  id: string
  user_id: string
  timestamp: string
  report_timestamp: string
  status: 'pending' | 'in-progress' | 'resolved' | 'false-alarm'
  priority: 'low' | 'medium' | 'high' | 'critical'
  latitude: number
  longitude: number
  address: string
  landmark?: string
  incident_type: 'medical' | 'theft' | 'assault' | 'lost' | 'accident' | 'other'
  incident_description: string
  assigned_to?: string
  estimated_arrival?: string
  created_at: string
  updated_at: string
  
  // Transformed user data
  user_name: string
  user_phone: string
  user_email: string
  user_nationality: string
  
  // Transformed authority data
  assigned_unit?: string | null
  assigned_unit_type?: string | null
  authority_phone?: string | null
  
  // Counts and arrays
  photo_count: number
  notes_count: number
  photos: string[]
  notes: string[]
  
  // Original nested data (optional for backward compatibility)
  user?: User
  authority?: Authority
}

export interface IncidentPhoto {
  id: string
  report_id: string
  photo_url: string
  uploaded_at: string
}

export interface ResponseNote {
  id: string
  report_id: string
  authority_id?: string
  note: string
  created_at: string
  authority?: Authority
}

export interface ResponseTimeline {
  id: string
  report_id: string
  status: 'pending' | 'in-progress' | 'resolved' | 'false-alarm'
  changed_by?: string
  notes?: string
  created_at: string
  authority?: Authority
}

export interface DashboardStats {
  totalReports: number
  activeReports: number
  resolvedToday: number
  criticalAlerts: number
  averageResponseTime: string
  responseRate: string
}
