"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRealtimeDashboardStats } from "@/lib/hooks/useRealtimeReports"
import { AlertTriangle, Clock, CheckCircle, Activity } from "lucide-react"

export function StatsCards() {
  const { stats: dashboardStats, loading, error } = useRealtimeDashboardStats()

  if (loading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
      ))}
    </div>
  }

  if (error || !dashboardStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ Unable to load dashboard statistics</div>
            <p className="text-sm text-red-700">
              Please ensure the database is set up by running the SQL setup script.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const statsConfig = [
    {
      title: "Total Reports",
      value: dashboardStats.totalReports,
      icon: Activity,
      description: "All SOS reports today",
      color: "text-blue-600",
    },
    {
      title: "Active Emergencies",
      value: dashboardStats.activeReports,
      icon: AlertTriangle,
      description: "Requiring immediate attention",
      color: "text-red-600",
    },
    {
      title: "Resolved Today",
      value: dashboardStats.resolvedToday,
      icon: CheckCircle,
      description: "Successfully handled",
      color: "text-green-600",
    },
    {
      title: "Avg Response Time",
      value: dashboardStats.averageResponseTime,
      icon: Clock,
      description: "Current performance",
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              {stat.title === "Active Emergencies" && typeof stat.value === 'number' && stat.value > 0 && (
                <Badge variant="destructive" className="mt-2 text-xs">
                  Urgent Action Required
                </Badge>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
