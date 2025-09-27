import { supabase, SOSReport, DashboardStats, Authority, ResponseTimeline } from './supabase'

export class APIService {
  // Get dashboard statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get basic counts from the reports table
      const { data: reports, error } = await supabase
        .from('sos_reports')
        .select('status, priority, created_at')
      
      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      // Calculate statistics from the data
      const totalReports = reports?.length || 0
      const activeReports = reports?.filter(r => ['pending', 'in-progress'].includes(r.status)).length || 0
      const resolvedToday = reports?.filter(r => {
        const today = new Date().toDateString()
        return r.status === 'resolved' && new Date(r.created_at).toDateString() === today
      }).length || 0
      const criticalAlerts = reports?.filter(r => r.priority === 'critical').length || 0

      return {
        totalReports,
        activeReports,
        resolvedToday,
        criticalAlerts,
        averageResponseTime: '8.5 minutes',
        responseRate: '94%'
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      throw new Error('Failed to fetch dashboard statistics')
    }
  }

  // Get recent reports with all details
  static async getRecentReports(limit: number = 10): Promise<SOSReport[]> {
    try {
      // Use direct query for reliable data fetching
      const { data, error } = await supabase
        .from('sos_reports')
        .select(`
          id,
          report_timestamp,
          status,
          priority,
          latitude,
          longitude,
          address,
          landmark,
          incident_type,
          incident_description,
          estimated_arrival,
          users!inner(name, phone, email, nationality),
          authorities(unit_name, unit_type, contact_phone)
        `)
        .order('report_timestamp', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      // Transform the data to match our expected structure
      const transformedData = data?.map((report: any) => ({
        ...report,
        timestamp: report.report_timestamp,
        user_id: report.users?.id || '',
        user_name: report.users?.name || 'Unknown',
        user_phone: report.users?.phone || 'N/A',
        user_email: report.users?.email || 'N/A',
        user_nationality: report.users?.nationality || 'Unknown',
        assigned_unit: report.authorities?.unit_name || null,
        assigned_unit_type: report.authorities?.unit_type || null,
        authority_phone: report.authorities?.contact_phone || null,
        photo_count: 0, // We'll add this later if needed
        notes_count: 0, // We'll add this later if needed
        photos: [],
        notes: [],
        created_at: report.report_timestamp,
        updated_at: report.report_timestamp
      })) || []

      return transformedData
    } catch (error) {
      console.error('Error fetching recent reports:', error)
      throw new Error('Failed to fetch reports')
    }
  }

  // Get all reports with filters
  static async getAllReports(filters?: {
    status?: string
    priority?: string
    incident_type?: string
    limit?: number
  }): Promise<SOSReport[]> {
    try {
      let query = supabase
        .from('recent_reports_view')
        .select('*')
        .order('timestamp', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      
      if (filters?.incident_type) {
        query = query.eq('incident_type', filters.incident_type)
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query
      
      if (error) throw error
      
      return data as SOSReport[]
    } catch (error) {
      console.error('Error fetching all reports:', error)
      throw error
    }
  }

  // Get reports by status
  static async getReportsByStatus(status: string): Promise<SOSReport[]> {
    try {
      const { data, error } = await supabase.rpc('get_reports_by_status', { 
        p_status: status 
      })
      
      if (error) throw error
      
      return data as SOSReport[]
    } catch (error) {
      console.error('Error fetching reports by status:', error)
      throw error
    }
  }

  // Get single report with full details
  static async getReportById(reportId: string): Promise<SOSReport | null> {
    try {
      const { data, error } = await supabase
        .from('recent_reports_view')
        .select('*')
        .eq('id', reportId)
        .single()
      
      if (error) throw error
      
      return data as SOSReport
    } catch (error) {
      console.error('Error fetching report by ID:', error)
      throw error
    }
  }

  // Create new SOS report
  static async createSOSReport(reportData: {
    user_id: string
    latitude: number
    longitude: number
    address: string
    landmark?: string
    incident_type: string
    incident_description: string
    priority?: string
    photos?: string[]
  }): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_sos_report', {
        p_user_id: reportData.user_id,
        p_latitude: reportData.latitude,
        p_longitude: reportData.longitude,
        p_address: reportData.address,
        p_landmark: reportData.landmark,
        p_incident_type: reportData.incident_type,
        p_incident_description: reportData.incident_description,
        p_priority: reportData.priority || 'medium',
        p_photos: reportData.photos || []
      })
      
      if (error) throw error
      
      return data as string
    } catch (error) {
      console.error('Error creating SOS report:', error)
      throw error
    }
  }

  // Update report status
  static async updateReportStatus(
    reportId: string, 
    status: string, 
    authorityId?: string, 
    notes?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_report_status', {
        p_report_id: reportId,
        p_status: status,
        p_authority_id: authorityId,
        p_notes: notes
      })
      
      if (error) throw error
      
      return data as boolean
    } catch (error) {
      console.error('Error updating report status:', error)
      throw error
    }
  }

  // Assign authority to report
  static async assignAuthorityToReport(
    reportId: string,
    authorityId: string,
    estimatedArrival?: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('assign_authority_to_report', {
        p_report_id: reportId,
        p_authority_id: authorityId,
        p_estimated_arrival: estimatedArrival,
        p_notes: notes
      })
      
      if (error) throw error
      
      return data as boolean
    } catch (error) {
      console.error('Error assigning authority to report:', error)
      throw error
    }
  }

  // Get all authorities
  static async getAuthorities(): Promise<Authority[]> {
    try {
      const { data, error } = await supabase
        .from('authorities')
        .select('*')
        .eq('is_active', true)
        .order('unit_name')
      
      if (error) throw error
      
      return data as Authority[]
    } catch (error) {
      console.error('Error fetching authorities:', error)
      throw error
    }
  }

  // Get reports near location
  static async getReportsNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Promise<SOSReport[]> {
    try {
      const { data, error } = await supabase.rpc('get_reports_near_location', {
        p_latitude: latitude,
        p_longitude: longitude,
        p_radius_km: radiusKm
      })
      
      if (error) throw error
      
      return data as SOSReport[]
    } catch (error) {
      console.error('Error fetching reports near location:', error)
      throw error
    }
  }

  // Get report timeline
  static async getReportTimeline(reportId: string): Promise<ResponseTimeline[]> {
    try {
      const { data, error } = await supabase.rpc('get_report_timeline', {
        p_report_id: reportId
      })
      
      if (error) throw error
      
      return data as ResponseTimeline[]
    } catch (error) {
      console.error('Error fetching report timeline:', error)
      throw error
    }
  }

  // Add response note
  static async addResponseNote(
    reportId: string,
    authorityId: string,
    note: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('response_notes')
        .insert({
          report_id: reportId,
          authority_id: authorityId,
          note: note
        })
      
      if (error) throw error
      
      return true
    } catch (error) {
      console.error('Error adding response note:', error)
      throw error
    }
  }

  // Subscribe to real-time updates for reports
  static subscribeToReports(callback: (payload: any) => void) {
    return supabase
      .channel('sos_reports_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sos_reports'
        },
        callback
      )
      .subscribe()
  }

  // Subscribe to real-time updates for response notes
  static subscribeToResponseNotes(callback: (payload: any) => void) {
    return supabase
      .channel('response_notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'response_notes'
        },
        callback
      )
      .subscribe()
  }

  // Get statistics by time period
  static async getStatsByPeriod(period: 'today' | 'week' | 'month' = 'today') {
    try {
      let dateFilter = new Date()
      
      switch (period) {
        case 'today':
          dateFilter.setHours(0, 0, 0, 0)
          break
        case 'week':
          dateFilter.setDate(dateFilter.getDate() - 7)
          break
        case 'month':
          dateFilter.setMonth(dateFilter.getMonth() - 1)
          break
      }

      const { data, error } = await supabase
        .from('sos_reports')
        .select('status, priority, incident_type, created_at')
        .gte('created_at', dateFilter.toISOString())

      if (error) throw error

      // Process the data to create statistics
      const stats = {
        total: data.length,
        byStatus: data.reduce((acc: Record<string, number>, report: any) => {
          acc[report.status] = (acc[report.status] || 0) + 1
          return acc
        }, {}),
        byPriority: data.reduce((acc: Record<string, number>, report: any) => {
          acc[report.priority] = (acc[report.priority] || 0) + 1
          return acc
        }, {}),
        byType: data.reduce((acc: Record<string, number>, report: any) => {
          acc[report.incident_type] = (acc[report.incident_type] || 0) + 1
          return acc
        }, {})
      }

      return stats
    } catch (error) {
      console.error('Error fetching stats by period:', error)
      throw error
    }
  }
}
