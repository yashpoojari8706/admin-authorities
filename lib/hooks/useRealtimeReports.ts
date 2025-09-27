"use client"

import { useEffect, useState } from 'react'
import { APIService } from '../api-service'
import { SOSReport, DashboardStats } from '../supabase'

export function useRealtimeReports(initialLimit: number = 10) {
  const [reports, setReports] = useState<SOSReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await APIService.getRecentReports(initialLimit)
        setReports(data)
      } catch (err) {
        console.error('Failed to fetch reports:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch reports')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [initialLimit])

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = APIService.subscribeToReports((payload) => {
      console.log('Real-time update received:', payload)
      
      if (payload.eventType === 'INSERT') {
        // Add new report to the beginning of the list
        setReports((prev: SOSReport[]) => [payload.new, ...prev.slice(0, initialLimit - 1)])
      } else if (payload.eventType === 'UPDATE') {
        // Update existing report
        setReports((prev: SOSReport[]) => 
          prev.map((report: SOSReport) => 
            report.id === payload.new.id ? { ...report, ...payload.new } : report
          )
        )
      } else if (payload.eventType === 'DELETE') {
        // Remove deleted report
        setReports((prev: SOSReport[]) => prev.filter((report: SOSReport) => report.id !== payload.old.id))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialLimit])

  const refreshReports = async () => {
    try {
      setLoading(true)
      const data = await APIService.getRecentReports(initialLimit)
      setReports(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh reports')
    } finally {
      setLoading(false)
    }
  }

  return {
    reports,
    loading,
    error,
    refreshReports
  }
}

export function useRealtimeDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await APIService.getDashboardStats()
        setStats(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Subscribe to real-time updates for reports (which affects stats)
  useEffect(() => {
    const subscription = APIService.subscribeToReports(async () => {
      // Refresh stats when reports change
      try {
        const data = await APIService.getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error('Failed to refresh stats:', err)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const refreshStats = async () => {
    try {
      setLoading(true)
      const data = await APIService.getDashboardStats()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh stats')
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    loading,
    error,
    refreshStats
  }
}

export function useReportDetails(reportId: string) {
  const [report, setReport] = useState<SOSReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return

      try {
        setLoading(true)
        const data = await APIService.getReportById(reportId)
        setReport(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch report')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportId])

  // Subscribe to real-time updates for this specific report
  useEffect(() => {
    if (!reportId) return

    const subscription = APIService.subscribeToReports((payload) => {
      if (payload.new?.id === reportId || payload.old?.id === reportId) {
        if (payload.eventType === 'UPDATE') {
          setReport((prev: SOSReport | null) => prev ? { ...prev, ...payload.new } : payload.new)
        } else if (payload.eventType === 'DELETE') {
          setReport(null)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [reportId])

  const refreshReport = async () => {
    if (!reportId) return

    try {
      setLoading(true)
      const data = await APIService.getReportById(reportId)
      setReport(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh report')
    } finally {
      setLoading(false)
    }
  }

  return {
    report,
    loading,
    error,
    refreshReport
  }
}
