import React, { useState, useEffect, useCallback } from 'react'
import { NextPage } from 'next'
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Cpu,
  AlertTriangle,
  Repeat,
  Activity,
  Users,
  Wallet,
  Loader2,
} from 'lucide-react'

// --- Configuration ---
const METRICS_ENDPOINT = '/api/metrics'
const POLLING_INTERVAL_MS = 15_000

/**
 * Parse minimal Prometheus exposition-format metrics for the two counters we care about.
 */
const parsePrometheusMetrics = (text: string) => {
  const metrics: Record<string, number> = {}
  const retryMatch = text.match(/^router_refund_retries_total\s+([0-9.]+)/m)
  const alertMatch = text.match(/^router_refund_alerts_total\s+([0-9.]+)/m)
  if (retryMatch) metrics.router_refund_retries_total = parseFloat(retryMatch[1])
  if (alertMatch) metrics.router_refund_alerts_total = parseFloat(alertMatch[1])
  return metrics
}

const useLiveMetrics = (adminToken?: string | null) => {
  const [metrics, setMetrics] = useState({ router_refund_retries_total: 0, router_refund_alerts_total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    if (!adminToken) {
      setIsLoading(false)
      setError('unauthorized')
      setMetrics({ router_refund_retries_total: -1, router_refund_alerts_total: -1 })
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(METRICS_ENDPOINT, { headers: { 'x-admin-metrics-token': adminToken } })
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const text = await res.text()
      const parsed = parsePrometheusMetrics(text)
      setMetrics(prev => ({ ...prev, ...parsed }))
    } catch (err: any) {
      console.error('Failed fetching metrics', err)
      setError(String(err?.message ?? err))
      setMetrics({ router_refund_retries_total: -1, router_refund_alerts_total: -1 })
    } finally {
      setIsLoading(false)
    }
  }, [adminToken])

  useEffect(() => {
    fetchMetrics()
    const t = setInterval(fetchMetrics, POLLING_INTERVAL_MS)
    return () => clearInterval(t)
  }, [fetchMetrics])

  return { metrics, isLoading, error }
}

// Mock Data and Constants
const MODULES = [
  { id: 'User', title: 'User & Job Tracking', icon: User, description: 'Submit new jobs and monitor the status of active requests.' },
  { id: 'Admin', title: 'Admin & Reconciliation Ops', icon: ShieldCheck, description: 'Monitor critical refund metrics, throttling, and system alerts.' },
  { id: 'Validator', title: 'Validator Queue & Stake', icon: Cpu, description: 'View assigned job queues, current stake status, and performance reputation.' },
]

const mockAdminData = {
  activeAlerts: 3,
  jobsAwaitingRefund: 12,
  totalRefundRetriesLast24h: 47,
  lastCriticalAlert: '2025-12-01 10:30:15 UTC (Refund Throttling)',
}

// Reusable Button Component
const DashboardButton: React.FC<any> = ({ title, description, icon: Icon, onClick, disabled = false }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`flex flex-col items-start p-6 bg-white/5 backdrop-blur-sm border border-indigo-700/50 rounded-xl shadow-xl transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700/10 transform hover:scale-[1.02]'}`}
  >
    <div className="flex items-center space-x-4 mb-2">
      <Icon className="w-8 h-8 text-indigo-400" />
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
    </div>
    <p className="text-gray-400 text-left text-sm mt-1">{description}</p>
  </button>
)

const HubView: React.FC<{ setView: (v: string) => void; userRole: 'Admin' | 'User' | 'Validator' }> = ({ setView, userRole }) => (
  <div className="p-8 max-w-7xl mx-auto">
    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">NeuroSwarm Operations Hub</h1>
    <p className="text-lg text-indigo-300 mb-12">Select a module to view specialized status and controls.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {MODULES.map((module) => {
        const accessible = userRole === 'Admin' || module.id === userRole
        return (
        <DashboardButton
          key={module.id}
          title={module.title}
          description={module.description}
          icon={module.icon}
          onClick={() => setView(module.id)}
          disabled={!accessible}
        />
        )
      })}
    </div>
  </div>
)

const UserView: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-white mb-6 flex items-center"><User className="w-6 h-6 mr-3 text-indigo-400" /> User & Job Tracking</h1>
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-white mb-4">New Job Submission</h2>
      <div className="space-y-4">
        <textarea
          placeholder="Paste your compute manifest (JSON/YAML) here..."
          rows={5}
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-md">Submit Decentralized Job</button>
      </div>
    </div>
    <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-white mb-4">Active Jobs (Decentralized State)</h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
          <p className="text-gray-300 font-mono text-sm">0x4aB1...c9fE</p>
          <span className="px-3 py-1 text-sm font-medium text-green-300 bg-green-900/50 rounded-full">Completed</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
          <p className="text-gray-300 font-mono text-sm">0x9cE2...aB11</p>
          <span className="px-3 py-1 text-sm font-medium text-yellow-300 bg-yellow-900/50 rounded-full">Processing</span>
        </div>
      </div>
    </div>
  </div>
)

const AdminView: React.FC<{ adminToken?: string | null }> = ({ adminToken }) => {
  const { metrics, isLoading, error } = useLiveMetrics(adminToken ?? null)

  const getValue = (key: 'router_refund_retries_total' | 'router_refund_alerts_total', defaultVal = 0) => {
    if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-gray-400 inline-block" />
    if (error) return '---'
    const v = (metrics as any)[key]
    if (typeof v === 'number') return v < 0 ? '---' : v.toFixed(0)
    return defaultVal
  }

  const alertsValue = (metrics as any).router_refund_alerts_total ?? 0
  const retriesValue = (metrics as any).router_refund_retries_total ?? 0

  const alertsColor = alertsValue > 0 ? 'red' : 'green'
  const retriesColor = retriesValue > 50 ? 'yellow' : 'indigo'

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center"><ShieldCheck className="w-6 h-6 mr-3 text-indigo-400" /> Admin & Reconciliation Ops</h1>
      <p className="text-gray-400 mb-6">Monitoring the centralized Router API operational state and financial safety-critical paths.</p>

      {error && (
        <div className="p-4 mb-4 text-sm rounded-lg bg-red-800/50 text-red-300 border border-red-700">
          <AlertTriangle className="w-4 h-4 inline mr-2" /> Metrics connection failed — check Router API or proxy.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 border rounded-xl shadow-lg ${alertsColor === 'red' ? 'bg-red-900/40 border-red-700' : 'bg-green-900/40 border-green-700'}`}>
          <AlertTriangle className={`w-8 h-8 mb-3 ${alertsColor === 'red' ? 'text-red-400' : 'text-green-400'}`} />
          <p className={`text-sm ${alertsColor === 'red' ? 'text-red-300' : 'text-green-300'}`}>Total Critical Alerts (counter)</p>
          <p className="text-4xl font-extrabold text-white">{getValue('router_refund_alerts_total')}</p>
        </div>

        <div className={`p-6 border rounded-xl shadow-lg ${retriesColor === 'yellow' ? 'bg-yellow-900/40 border-yellow-700' : 'bg-indigo-900/40 border-indigo-700'}`}>
          <Repeat className={`w-8 h-8 mb-3 ${retriesColor === 'yellow' ? 'text-yellow-400' : 'text-indigo-400'}`} />
          <p className={`text-sm ${retriesColor === 'yellow' ? 'text-yellow-300' : 'text-indigo-300'}`}>Total Refund Retries (counter)</p>
          <p className="text-4xl font-extrabold text-white">{getValue('router_refund_retries_total')}</p>
        </div>

        <div className="p-6 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
          <Wallet className="w-8 h-8 text-gray-400 mb-3" />
          <p className="text-sm text-gray-300">Jobs Awaiting Refund TX (Mock)</p>
          <p className="text-4xl font-extrabold text-white">12</p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-indigo-400" /> Reconciliation Status</h2>
        <p className="text-gray-300 mb-4">Last Metric Poll: <span className="text-indigo-400 font-mono">{isLoading ? 'Loading...' : new Date().toLocaleTimeString()}</span></p>

        <div className="flex justify-center mt-4">
          <button className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-sm text-white rounded-lg transition mt-4">View Full Grafana Dashboard</button>
        </div>
      </div>
    </div>
  )
}

const ValidatorView: React.FC = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-white mb-6 flex items-center"><Cpu className="w-6 h-6 mr-3 text-indigo-400" /> Validator Queue & Stake</h1>
    <p className="text-gray-400 mb-6">Monitoring the decentralized validator network health and operational metrics.</p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-green-400" /> Active Validators</h2>
        <p className="text-5xl font-extrabold text-green-400">42 / 50</p>
        <p className="text-gray-400 mt-2">Currently online and accepting jobs.</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><Wallet className="w-5 h-5 mr-2 text-yellow-400" /> Total Staked Value</h2>
        <p className="text-5xl font-extrabold text-yellow-400">1.8M NST</p>
        <p className="text-gray-400 mt-2">Current reputation score average: 9.3/10</p>
      </div>
    </div>
  </div>
)

const OpsHub: NextPage = () => {
  const [currentView, setCurrentView] = useState<string>('Hub')
  // Mock RBAC - simple role selector for demo purposes
  const [userRole, setUserRole] = useState<'Admin' | 'User' | 'Validator'>('User')

  const renderView = () => {
    switch (currentView) {
      case 'User':
        return <UserView />
      case 'Admin':
        if (userRole !== 'Admin') {
          return (
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-3">Access Restricted</h2>
              <div className="p-4 rounded-lg bg-red-900/40 border border-red-700 text-red-200">
                <p className="mb-2">You do not have sufficient privileges to view this dashboard.</p>
                <p className="text-sm text-gray-300">Switch role to <span className="font-semibold">Admin</span> to access reconciliation tools and sensitive metrics.</p>
              </div>
            </div>
          )
        }
        // Pass the public token (demo only) into AdminView so it can call the secured proxy.
        return <AdminView adminToken={process.env.NEXT_PUBLIC_ADMIN_METRICS_TOKEN} />
      case 'Validator':
        return <ValidatorView />
      case 'Hub':
      default:
        return <HubView setView={setCurrentView} userRole={userRole} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans antialiased text-white">
      <style jsx global>{`
        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <nav className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setCurrentView('Hub')}>
            <LayoutDashboard className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-bold text-white">NeuroSwarm Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-300 mr-2">Role</div>
            <div className="flex items-center space-x-2">
              {(['User','Validator','Admin'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRole(r)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition border ${userRole === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-transparent text-gray-300 border-gray-700 hover:border-indigo-600 hover:text-white'}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentView('Hub')}
              className="px-3 py-1 bg-indigo-600/10 border border-indigo-600 text-indigo-400 text-sm font-medium rounded-full hover:bg-indigo-600/20 transition"
            >
              <LayoutDashboard className="w-4 h-4 inline-block mr-1" /> Back to Hub
            </button>
          </div>
        </div>
      </nav>

      <main className="pb-16 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{renderView()}</div>
      </main>
      <div className="max-w-7xl mx-auto px-8 pb-4 text-center text-xs text-gray-600">NeuroSwarm: Decentralized Compute Layer | Master Hub Architecture</div>
    </div>
  )
}

export default OpsHub
