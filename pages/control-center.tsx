import React, { useState, useEffect, useCallback, useContext, createContext, ReactNode } from 'react';
import { LayoutDashboard, User, ShieldCheck, Cpu, AlertTriangle, Repeat, Activity, Users, Wallet, Loader2, Lock, Clock, CheckCircle, ListTodo, SlidersHorizontal, BarChart3, LucideIcon } from 'lucide-react';

// --- Configuration ---
const METRICS_ENDPOINT = '/api/metrics';
const POLLING_INTERVAL_MS = 15000;

// --- MOCK JWT/AUTH SETUP ---
const ADMIN_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQWRtaW4ifQ';
const USER_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiVXNlciJ9';

const ROLES = ['Admin', 'User', 'Validator', 'Guest'] as const;
type UserRole = typeof ROLES[number];

// Map role to its corresponding mock JWT
const getJwtForRole = (role: UserRole): string => {
  switch (role) {
    case 'Admin': return ADMIN_JWT;
    case 'User': return USER_JWT;
    case 'Validator': return USER_JWT;
    default: return '';
  }
}

// --- 1. Authentication and Role Context ---
interface AuthContextType {
  userRole: UserRole;
  jwtToken: string;
  shortToken?: string | null;
  setUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  userRole: 'Guest',
  jwtToken: '',
  setUserRole: () => { },
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const [jwtToken, setJwtToken] = useState(getJwtForRole('Admin'));
  const [shortToken, setShortToken] = useState<string | null>(null);
  const [shortTokenExpiry, setShortTokenExpiry] = useState<number | null>(null);
  const [shortTokenTimer, setShortTokenTimer] = useState<any>(null);

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    setJwtToken(getJwtForRole(newRole));
    // Clear short token so it will be re-acquired for the new role
    setShortToken(null);
    setShortTokenExpiry(null);
    if (shortTokenTimer) { clearTimeout(shortTokenTimer); setShortTokenTimer(null); }
  }

  // Exchange long-lived token for a short-lived server-signed session token
  const exchangeShortToken = useCallback(async (longToken: string) => {
    try {
      const r = await fetch('/api/auth/token-swap', { method: 'POST', headers: { Authorization: `Bearer ${longToken}` } });
      if (!r.ok) {
        console.warn('Short token swap failed', r.status);
        return null;
      }
      const body = await r.json();
      const token = body.token as string;
      const expiresIn = body.expiresInSec as number || 300;
      const expiry = Date.now() + (expiresIn * 1000);
      setShortToken(token);
      setShortTokenExpiry(expiry);

      // Refresh timer -> refresh 30s before expiry, or at 90% of ttl
      const refreshMs = Math.max(15000, expiresIn * 1000 * 0.9);
      if (shortTokenTimer) clearTimeout(shortTokenTimer);
      const t = setTimeout(() => exchangeShortToken(longToken), refreshMs);
      setShortTokenTimer(t);

      return token;
    } catch (err) {
      console.warn('Failed to fetch short token', err);
      return null;
    }
  }, [shortTokenTimer]);

  useEffect(() => {
    // Immediately attempt to swap to a short token if we have a long token
    if (jwtToken) exchangeShortToken(jwtToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortToken]);

  return (
    <AuthContext.Provider value={{ userRole, jwtToken, shortToken, setUserRole: handleRoleChange }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Module Definitions (Mapping to Dashboards) ---

interface ModuleDef {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  requiredRole: UserRole;
}

const MODULES: ModuleDef[] = [
  { id: 'JobTracking', title: 'Job Tracking Dashboard', icon: ListTodo, description: 'Submit new jobs and monitor the status of active requests.', requiredRole: 'User' },
  { id: 'Reconciliation', title: 'Reconciliation Dashboard', icon: BarChart3, description: 'Monitor critical financial reconciliation metrics and system alerts.', requiredRole: 'Admin' },
  { id: 'Validator', title: 'Validator Dashboard', icon: Cpu, description: 'View assigned job queues, current stake status, and performance reputation.', requiredRole: 'Validator' },
  { id: 'SystemStatus', title: 'System Status', icon: SlidersHorizontal, description: 'Overall health and configuration of the NeuroSwarm cluster.', requiredRole: 'Guest' },
  { id: 'MonitorDashboard', title: 'Monitor Dashboard', icon: Activity, description: 'Legacy monitoring dashboard with real-time node status and network health.', requiredRole: 'Guest' },
];

// --- Metric Fetching Hook (Secured with JWT) ---
interface MetricsData {
  router_refund_retries_total: number;
  router_refund_alerts_total: number;
  reconciliation_success_rate: number;
  unsigned_refunds_pending: number;
  job_queue_depth: number;
}

const parsePrometheusMetrics = (metricsText: string): MetricsData => {
  const metrics: Partial<MetricsData> = {};
  const regexes = {
    router_refund_retries_total: /^router_refund_retries_total\s+([0-9.]+)/m,
    router_refund_alerts_total: /^router_refund_alerts_total\s+([0-9.]+)/m,
    reconciliation_success_rate: /^reconciliation_success_rate\s+([0-9.]+)/m,
    unsigned_refunds_pending: /^unsigned_refunds_pending\s+([0-9.]+)/m,
    job_queue_depth: /^job_queue_depth\s+([0-9.]+)/m,
  };

  Object.entries(regexes).forEach(([key, regex]) => {
    const match = metricsText.match(regex);
    if (match) { (metrics as any)[key] = parseFloat(match[1]); }
  });

  // Mock a fluctuating success rate if not found
  if (typeof metrics.reconciliation_success_rate === 'undefined') {
    metrics.reconciliation_success_rate = Math.random() * (0.99 - 0.85) + 0.85;
  }

  return metrics as MetricsData;
};

const useLiveMetrics = () => {
  const { userRole, shortToken } = useContext(AuthContext);
  const [metrics, setMetrics] = useState<MetricsData>({
    router_refund_retries_total: 0,
    router_refund_alerts_total: 0,
    reconciliation_success_rate: 0,
    unsigned_refunds_pending: 0,
    job_queue_depth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    // Only fetch for the Reconciliation Dashboard (Admin role)
    if (userRole !== 'Admin' || !shortToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(METRICS_ENDPOINT, {
        headers: {
          'Authorization': `Bearer ${shortToken}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(`Auth Failed (${response.status}). Token invalid or unauthorized.`);
      }
      if (!response.ok) {
        throw new Error(`Proxy failed with Status ${response.status}`);
      }

      const text = await response.text();
      const parsedMetrics = parsePrometheusMetrics(text);
      setMetrics(parsedMetrics);
    } catch (err: any) {
      console.error("Failed to fetch metrics:", err.message);
      setError(err.message);
      setMetrics({
        router_refund_retries_total: -1,
        router_refund_alerts_total: -1,
        reconciliation_success_rate: -1,
        unsigned_refunds_pending: -1,
        job_queue_depth: -1,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userRole, shortToken]);

  useEffect(() => {
    if (userRole === 'Admin' && shortToken) {
      fetchMetrics();
      const interval = setInterval(fetchMetrics, POLLING_INTERVAL_MS);
      return () => clearInterval(interval);
    }
    return () => { };
  }, [fetchMetrics, userRole, shortToken]);

  return { metrics, isLoading, error };
};

// --- Helper Components for Dashboard Visuals ---

interface GaugeProps {
  value: number;
  title: string;
  unit?: string;
  min?: number;
  max?: number;
  threshold?: number;
}

const Gauge: React.FC<GaugeProps> = ({ value, title, unit = '%', min = 0, max = 100, threshold = 90 }) => {
  const normalizedValue = Math.max(min, Math.min(max, value));
  const rotation = (normalizedValue / max) * 180;

  let colorClass = 'text-green-400';
  if (normalizedValue < threshold && normalizedValue >= 80) colorClass = 'text-yellow-400';
  if (normalizedValue < 80) colorClass = 'text-red-400';

  if (value < 0) colorClass = 'text-gray-500';

  return (
    <div className="flex flex-col items-center p-4 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg h-full">
      <p className="text-sm text-gray-400 mb-4">{title}</p>
      <div className="relative w-32 h-16 overflow-hidden">
        {/* The background arc */}
        <div className="w-32 h-16 rounded-t-[64px] bg-gray-700/50 absolute top-0 transform origin-bottom border-b-0"></div>

        {/* The rotating meter */}
        <div
          className="w-32 h-16 rounded-t-[64px] absolute top-0 transform origin-bottom transition-transform duration-1000"
          style={{
            transform: `rotate(${rotation}deg)`,
            background: colorClass.replace('text-', 'bg-'),
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
          }}
        ></div>

        {/* Center mask */}
        <div className="w-20 h-10 rounded-t-[40px] bg-gray-900 absolute top-6 left-1/2 transform -translate-x-1/2"></div>
      </div>
      <div className="text-center mt-3">
        <p className={`text-3xl font-extrabold ${colorClass}`}>
          {value < 0 ? '---' : `${normalizedValue.toFixed(1)}${unit}`}
        </p>
      </div>
    </div>
  );
};

interface StatusCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  colorClass: string;
  error?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, icon: Icon, colorClass, error }) => (
  <div className={`p-5 border rounded-xl shadow-xl transition-all duration-300 ${error ? 'bg-red-900/40 border-red-700' : `${colorClass.replace('text-', 'bg-')}/40 border-${colorClass.replace('text-', 'border-')}`}`}>
    <div className="flex justify-between items-center mb-2">
      <Icon className={`w-8 h-8 ${colorClass}`} />
      <span className="text-sm font-semibold text-gray-300">{title}</span>
    </div>
    <p className="text-4xl font-extrabold text-white">
      {error ? 'ERR' : (value < 0 ? '---' : value.toFixed(0))}
    </p>
  </div>
);

// --- View Restriction Component ---
const PermissionDenied: React.FC<{ requiredRole: string }> = ({ requiredRole }) => (
  <div className="p-12 text-center bg-gray-800/50 border border-red-700/50 rounded-xl shadow-2xl mt-12">
    <Lock className="w-12 h-12 mx-auto text-red-500 mb-4" />
    <h2 className="text-3xl font-bold text-red-400 mb-2">Access Restricted</h2>
    <p className="text-gray-400">You must have the **{requiredRole}** role to access this dashboard.</p>
    <p className="text-gray-500 text-sm mt-2">Current Role: {useContext(AuthContext).userRole}</p>
  </div>
);


// --- 2. The Main Control Center View (Launchpad) ---
const ControlCenterView: React.FC<{ setView: (v: string) => void }> = ({ setView }) => {
  const { userRole, shortToken } = useContext(AuthContext);

  const isModuleAccessible = (module: ModuleDef) => {
    if (module.requiredRole === 'Guest') return true; // System Status is open to all
    // Admins can see everything, others only see their required role module.
    return userRole === 'Admin' || userRole === module.requiredRole;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">NeuroSwarm Control Center</h1>
      <p className="text-lg text-indigo-300 mb-6">Central control and launchpad for all operational dashboards.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {MODULES.map((module) => (
          <div key={module.id} className="h-44">
            <DashboardButton
              title={module.title}
              description={module.description}
              icon={module.icon}
              onClick={() => setView(module.id)}
              // disable the button when not accessible
              {...(isModuleAccessible(module) ? {} : { disabled: true })}
            />
            {!isModuleAccessible(module) && (
              <p className="text-xs text-gray-400 mt-2">Requires role: <span className="font-semibold text-gray-200">{module.requiredRole}</span></p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-2">Quick Links</h2>
          <ul className="text-sm text-gray-300 space-y-2">
            <li><a href="/control-center" className="text-indigo-400 hover:underline">Control Center Home</a></li>
            <li><a href="/control-center#reconciliation" className="text-indigo-400 hover:underline">Reconciliation Dashboard</a></li>
            <li><a href="/control-center#job-tracking" className="text-indigo-400 hover:underline">Job Tracking Dashboard</a></li>
            <li><a href="/control-center#validator" className="text-indigo-400 hover:underline">Validator Dashboard</a></li>
            <li><a href="/monitor-dashboard.html" className="text-indigo-400 hover:underline">Legacy Monitor Dashboard</a></li>
          </ul>
        </div>

        <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-2">Operational Actions</h2>
          <p className="text-sm text-gray-400 mb-3">From here you can quickly navigate to the operational dashboards to triage, or click through to Grafana.</p>
          <div className="flex space-x-3">
            <a href="/control-center#reconciliation" className="px-3 py-2 bg-indigo-600 text-sm rounded-md">Open Reconciliation</a>
            <a href="/control-center#job-tracking" className="px-3 py-2 bg-gray-700 text-sm rounded-md">Open Job Tracking</a>
            <a href="/control-center#validator" className="px-3 py-2 bg-gray-700 text-sm rounded-md">Open Validator</a>
          </div>
        </div>

        <div className="p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-2">External Tools</h2>
          <p className="text-sm text-gray-400 mb-3">One-click links to Grafana and alerting primitives.</p>
          <div className="flex flex-col gap-2">
            <a href="/grafana" className="px-3 py-2 bg-indigo-600 text-sm rounded-md">Grafana</a>
            <a href="/alerting" className="px-3 py-2 bg-gray-700 text-sm rounded-md">Alert Sink Console</a>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. Reconciliation Dashboard (Formerly Admin View) ---
const ReconciliationDashboard = () => {
  const { userRole } = useContext(AuthContext);
  if (userRole !== 'Admin') {
    return <PermissionDenied requiredRole="Admin" />;
  }

  const { metrics, isLoading, error } = useLiveMetrics();

  // Firestore incidents (realtime-ish via short polling) — Admin-only
  const [incidents, setIncidents] = useState<Array<any>>([]);
  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch('/api/firestore/incidents', { headers: { 'Authorization': `Bearer ${shortToken}` } });
      if (res.ok) {
        const json = await res.json();
        setIncidents(json.items || []);
      } else {
        console.warn('Failed to fetch incidents', res.status);
      }
    } catch (err) {
      console.warn('Failed to fetch incidents', err);
    }
  }, [shortToken]);

  useEffect(() => {
    if (userRole !== 'Admin' || !shortToken) return;
    fetchIncidents();
    const i = setInterval(fetchIncidents, 3000);
    return () => clearInterval(i);
  }, [fetchIncidents, userRole, shortToken]);

  const alertCount = metrics.router_refund_alerts_total;
  const pendingUnsigned = metrics.unsigned_refunds_pending;
  const successRate = (metrics.reconciliation_success_rate * 100);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center"><BarChart3 className="w-6 h-6 mr-3 text-indigo-400" /> Reconciliation Dashboard</h1>
      <p className="text-gray-400 mb-6">Real-time observability into critical Router API financial and operational health.</p>

      {/* Connection Status and Last Update */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
        <p className={`text-sm font-medium ${error ? 'text-red-400' : 'text-green-400'}`}>
          <Clock className="w-4 h-4 inline mr-2" />
          Status: {error ? `Disconnected: ${error}` : 'Live (Polling)'}
        </p>
        <p className="text-sm text-gray-400">
          Last Update: <span className="font-mono">{isLoading ? 'Loading...' : new Date().toLocaleTimeString()}</span>
        </p>
      </div>

      {/* Row 1: CRITICAL OPERATIONAL HEALTH (Gauges and Core Rate) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        {/* Gauge 1: Reconciliation Success Rate */}
        <div className="md:col-span-1">
          <Gauge
            value={successRate}
            title="Reconciliation Success Rate"
            unit="%"
            min={0}
            max={100}
            threshold={90}
          />
        </div>

        {/* Card 1: Critical Alerts Total */}
        <div className="md:col-span-1">
          <StatusCard
            title="Critical Alerts (Total)"
            value={alertCount}
            icon={AlertTriangle}
            colorClass={alertCount > 0 ? 'text-red-400' : 'text-green-400'}
            error={metrics.router_refund_alerts_total < 0}
          />
        </div>

        {/* Card 2: Pending Unsigned Refunds */}
        <div className="md:col-span-1">
          <StatusCard
            title="Unsigned Refunds Pending"
            value={pendingUnsigned}
            icon={Wallet}
            colorClass={pendingUnsigned > 5 ? 'text-red-400' : 'text-yellow-400'}
            error={metrics.unsigned_refunds_pending < 0}
          />
        </div>

        {/* Card 3: Refund Retries Total */}
        <div className="md:col-span-1">
          <StatusCard
            title="Refund Retries (Total)"
            value={metrics.router_refund_retries_total}
            icon={Repeat}
            colorClass={metrics.router_refund_retries_total > 10 ? 'text-yellow-400' : 'text-indigo-400'}
            error={metrics.router_refund_retries_total < 0}
          />
        </div>
      </div>

      {/* Row 2: Queue Health and System Load */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-indigo-400" /> System Load & Queue Health</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Metric 4: Job Queue Depth */}
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-400">Router Job Queue Depth</p>
            <p className={`text-3xl font-bold ${metrics.job_queue_depth > 100 ? 'text-red-400' : 'text-green-400'}`}>
              {metrics.job_queue_depth < 0 ? '---' : metrics.job_queue_depth.toFixed(0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total jobs awaiting processing.</p>
          </div>

          {/* Mock Metric: Average Reconciliation Latency */}
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-400">Avg Reconcile Latency (Last 5m)</p>
            <p className="text-3xl font-bold text-green-400">
              42<span className="text-xl font-normal ml-1">ms</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Target is sub-100ms.</p>
          </div>

          {/* Mock Metric: Last Successful Reconciliation Time */}
          <div className="p-4 bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-400">Last Success Time</p>
            <p className="text-3xl font-bold text-green-400">
              <CheckCircle className="w-6 h-6 inline mr-2" /> 2 seconds ago
            </p>
            <p className="text-xs text-gray-500 mt-1">Indicator of reconciler uptime.</p>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm text-white rounded-lg transition shadow-md">
            View Full Grafana Dashboards →
          </button>
        </div>
      </div>

      {/* Row 3: Incidents panel (Admin-only) */}
      <div className="mt-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Incidents (Realtime)</h2>
        {userRole !== 'Admin' ? (
          <p className="text-sm text-gray-400">Incidents are only visible to Admin users.</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-auto">
            {incidents.length === 0 ? (
              <p className="text-sm text-gray-400">No incidents recorded.</p>
            ) : (
              incidents.map((it: any) => (
                <div key={it.id} className="p-3 bg-gray-900/70 border border-gray-700 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-semibold text-white">{it.alertname}</div>
                      <div className="text-xs text-gray-400">{it.summary || 'No summary'}</div>
                    </div>
                    <div className="text-xs text-gray-300">{it.severity?.toUpperCase() || 'INFO'}</div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">Instance: {it.instance} • Last seen: {it.lastSeenAt ? new Date(it.lastSeenAt).toLocaleString() : 'N/A'}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Job Tracking Dashboard (Formerly User View) ---
const JobTrackingDashboard = () => {
  const { userRole, shortToken } = useContext(AuthContext);
  if (userRole !== 'User') return <PermissionDenied requiredRole="User" />;

  // Form state
  const [jobName, setJobName] = useState('Example Job');
  const [model, setModel] = useState('gpt-4');
  const [promptText, setPromptText] = useState('Describe the future of distributed AI');
  const [maxTokens, setMaxTokens] = useState(256);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Pending jobs list (short-polling via server proxy)
  const [pendingJobs, setPendingJobs] = useState<Array<any>>([]);

  const fetchPendingJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/firestore/pending-jobs', { headers: { 'Authorization': `Bearer ${shortToken}` } });
      if (!res.ok) return;
      const json = await res.json();
      setPendingJobs(json.items || []);
    } catch (err) {
      // ignore for now
    }
  }, [shortToken]);

  useEffect(() => {
    fetchPendingJobs();
    const t = setInterval(fetchPendingJobs, 3000);
    return () => clearInterval(t);
  }, [fetchPendingJobs]);

  const submitJob = async () => {
    setSubmitting(true);
    setMessage(null);
    const body = {
      user_wallet: 'demo-wallet-1',
      prompt: promptText,
      model,
      max_tokens: maxTokens,
      nsd_burned: '0',
      burn_tx_signature: 'dev-burn-sig'
    };

    try {
      const res = await fetch('/api/router/submit-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${shortToken}` },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(`Submission failed: ${data?.error || res.statusText || 'unknown'}`);
      } else {
        setMessage(`Job submitted: ${data?.job_id || JSON.stringify(data)}`);
        fetchPendingJobs();
      }
    } catch (err: any) {
      setMessage(`Request error: ${err?.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center"><ListTodo className="w-6 h-6 mr-3 text-indigo-400" /> Job Tracking Dashboard</h1>
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4">New Job Submission</h2>
        <div className="space-y-4">
          <input value={jobName} onChange={e => setJobName(e.target.value)} placeholder="Job name" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={model} onChange={e => setModel(e.target.value)} placeholder="Model (e.g. gpt-4)" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            <input value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value || '0'))} placeholder="Max tokens" type="number" className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-white" />
            <input value={'demo-wallet-1'} disabled className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400" />
          </div>
          <textarea value={promptText} onChange={(e) => setPromptText(e.target.value)} placeholder="Write the prompt for your decentralized job" rows={5} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500" />
          <div className="flex items-center space-x-3">
            <button onClick={submitJob} disabled={submitting} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition shadow-md disabled:opacity-60">{submitting ? 'Submitting…' : 'Submit Decentralized Job'}</button>
            {message && <div className="text-sm text-gray-300">{message}</div>}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Pending Jobs (Live)</h2>
        <div className="space-y-2 max-h-64 overflow-auto">
          {pendingJobs.length === 0 ? (
            <p className="text-sm text-gray-400">No pending jobs (waiting for Router/Validators).</p>
          ) : (
            pendingJobs.map((j: any) => (
              <div key={j.id || j.documentId} className="p-3 bg-gray-900/70 border border-gray-700 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-semibold text-white">{j.job_name || j.prompt?.slice?.(0,60) || j.id}</div>
                    <div className="text-xs text-gray-400">Model: {j.model || 'unknown'} • Wallet: {j.user_wallet || 'N/A'}</div>
                  </div>
                  <div className="text-xs text-gray-300">{j.status || 'pending'}</div>
                </div>
                <div className="mt-2 text-xs text-gray-400">Received: {j.received_at ? new Date(j.received_at).toLocaleString() : 'N/A'}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- Validator Dashboard (Formerly Validator View) ---
const ValidatorDashboard = () => {
  const { userRole } = useContext(AuthContext);
  if (userRole !== 'Validator') return <PermissionDenied requiredRole="Validator" />;

  return (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-white mb-6 flex items-center"><Cpu className="w-6 h-6 mr-3 text-indigo-400" /> Validator Dashboard</h1>
    <p className="text-gray-400 mb-6">Monitoring the decentralized validator network health and operational metrics.</p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-green-400" /> Active Validators</h2>
        <p className="text-5xl font-extrabold text-green-400">42 / 50</p>
        <p className="text-gray-400 mt-2">Currently online and accepting jobs.</p>
      </div>
    </div>
  </div>
  );
};

// --- System Status Dashboard (New General View) ---
const SystemStatusDashboard = () => (
  <div className="p-8">
    <h1 className="text-3xl font-bold text-white mb-6 flex items-center"><SlidersHorizontal className="w-6 h-6 mr-3 text-indigo-400" /> System Status</h1>
    <p className="text-gray-400 mb-6">General health and configuration overview of the NeuroSwarm cluster.</p>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-400" /> Router API Status</h2>
        <p className="text-5xl font-extrabold text-green-400">OPERATIONAL</p>
        <p className="text-gray-400 mt-2">All primary services are running.</p>
      </div>
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center"><Cpu className="w-5 h-5 mr-2 text-indigo-400" /> Network Latency</h2>
        <p className="text-5xl font-extrabold text-indigo-400">78ms</p>
        <p className="text-gray-400 mt-2">Average ping across core nodes.</p>
      </div>
    </div>
  </div>
);


// --- Main App Component ---
const AppContent = () => {
  const [currentView, setView] = useState('Hub'); // 'Hub' now represents the ControlCenterView
  const { userRole, setUserRole } = useContext(AuthContext);

  const renderView = () => {
    switch (currentView) {
      case 'JobTracking':
        return <JobTrackingDashboard />;
      case 'Reconciliation':
        return <ReconciliationDashboard />;
      case 'Validator':
        return <ValidatorDashboard />;
      case 'SystemStatus':
        return <SystemStatusDashboard />;
      case 'Hub':
      default:
        return <ControlCenterView setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans antialiased text-white">
      <style jsx global>{`
        body { margin: 0; font-family: 'Inter', sans-serif; }
        .router-font { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-md border-b border-gray-700/50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setView('Hub')}>
            <LayoutDashboard className="w-6 h-6 text-indigo-400" />
            <span className="text-xl font-bold text-white">NeuroSwarm Control Center</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400 hidden sm:inline">User Role:</span>

            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="p-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:ring-indigo-500 focus:border-indigo-500"
              title="Select your current user role"
            >
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            {currentView !== 'Hub' && (
              <button
                onClick={() => setView('Hub')}
                className="px-3 py-1 bg-indigo-600/10 border border-indigo-600 text-indigo-400 text-sm font-medium rounded-full hover:bg-indigo-600/20 transition hidden md:inline-flex items-center"
              >
                <LayoutDashboard className="w-4 h-4 inline-block mr-1" /> Back to Control Center
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="pb-16 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderView()}
        </div>
      </main>
      <div className="max-w-7xl mx-auto px-8 pb-4 text-center text-xs text-gray-600">
        NeuroSwarm: Decentralized Compute Layer | Master Control Architecture
      </div>
    </div>
  );
};

// Export the component wrapped in the AuthProvider
const ControlCenter = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

// Helper component for the Control Center View buttons
interface DashboardButtonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ title, description, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-start p-6 bg-white/5 backdrop-blur-sm border border-indigo-700/50 rounded-xl shadow-xl hover:bg-indigo-700/10 transition-all duration-300 transform hover:scale-[1.02] h-full w-full"
  >
    <div className="flex items-center space-x-4 mb-2">
      <Icon className="w-8 h-8 text-indigo-400" />
      <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
    </div>
    <p className="text-gray-400 text-left text-sm mt-1">{description}</p>
  </button>
);

export default ControlCenter;
