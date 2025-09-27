import { DashboardOverview } from "@/components/dashboard-overview"
import { RecentReports } from "@/components/recent-reports"
import { StatsCards } from "@/components/stats-cards"
import { ManualAlerts } from "@/components/manual-alerts"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileText, Activity } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">SOS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AUTHORITIES Dashboard</h1>
                <p className="text-sm text-muted-foreground">Tourist Safety Emergency Response System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-2">
                <Link href="/reports">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-1" />
                    Reports
                  </Button>
                </Link>
                <Link href="/tracking">
                  <Button variant="outline" size="sm">
                    <Activity className="h-4 w-4 mr-1" />
                    Tracking
                  </Button>
                </Link>
              </nav>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-muted-foreground">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Statistics Overview */}
          <StatsCards />

          {/* Manual Alerts */}
          <ManualAlerts />

          {/* Dashboard Overview */}
          <DashboardOverview />

          {/* Recent Reports */}
          <RecentReports />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/reports" className="group">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Report Management</h3>
                <p className="text-sm text-muted-foreground">
                  View, filter, and manage all SOS emergency reports with detailed information and status updates.
                </p>
              </div>
            </Link>

            <Link href="/tracking" className="group">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="h-8 w-8 text-green-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Live Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time tracking of emergency responses, response units, and live status updates.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
