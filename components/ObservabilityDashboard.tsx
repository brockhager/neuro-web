import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  uptime: string;
  activeUsers: number;
  responseTime: number;
  errorRate: number;
}

interface ObservabilityDashboardProps {
  showDetailed?: boolean;
}

const ObservabilityDashboard: React.FC<ObservabilityDashboardProps> = ({
  showDetailed = false
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 67,
    network: 23,
    uptime: '7d 14h 32m',
    activeUsers: 1247,
    responseTime: 145,
    errorRate: 0.02
  });

  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>>([
    {
      id: '1',
      type: 'warning',
      message: 'High memory usage detected on validator node #3',
      timestamp: '2 minutes ago'
    },
    {
      id: '2',
      type: 'info',
      message: 'New contributor onboarded successfully',
      timestamp: '15 minutes ago'
    }
  ]);

  useEffect(() => {
    // Mock real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 15)),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor((Math.random() - 0.5) * 20)),
        responseTime: Math.max(50, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 50)),
        errorRate: Math.max(0, Math.min(1, prev.errorRate + (Math.random() - 0.5) * 0.01))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return null;
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ElementType;
    color: string;
    trend?: 'up' | 'down' | 'stable';
  }> = ({ title, value, unit, icon: Icon, color, trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}{unit}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center">
          {getTrendIcon(trend === 'up' ? 1 : trend === 'down' ? -1 : 0, 0)}
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="CPU Usage"
            value={metrics.cpu.toFixed(1)}
            unit="%"
            icon={Cpu}
            color="bg-blue-500"
            trend={metrics.cpu > 70 ? 'up' : metrics.cpu < 30 ? 'down' : 'stable'}
          />
          <MetricCard
            title="Memory Usage"
            value={metrics.memory.toFixed(1)}
            unit="%"
            icon={HardDrive}
            color="bg-green-500"
            trend={metrics.memory > 80 ? 'up' : 'stable'}
          />
          <MetricCard
            title="Network I/O"
            value={metrics.network.toFixed(1)}
            unit="%"
            icon={Wifi}
            color="bg-purple-500"
            trend={metrics.network > 50 ? 'up' : 'stable'}
          />
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers.toLocaleString()}
            icon={Activity}
            color="bg-orange-500"
            trend="up"
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Time</span>
              <span className={`text-sm font-medium ${getMetricColor(metrics.responseTime, { warning: 200, critical: 300 })}`}>
                {metrics.responseTime}ms
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.responseTime > 300 ? 'bg-red-500' :
                  metrics.responseTime > 200 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (metrics.responseTime / 500) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</span>
              <span className={`text-sm font-medium ${getMetricColor(metrics.errorRate * 100, { warning: 1, critical: 5 })}`}>
                {(metrics.errorRate * 100).toFixed(2)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.errorRate > 0.05 ? 'bg-red-500' :
                  metrics.errorRate > 0.01 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, metrics.errorRate * 1000)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">System Uptime</span>
              <span className="text-sm font-medium text-green-600">{metrics.uptime}</span>
            </div>
            <div className="flex items-center mt-2">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {showDetailed && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Alerts
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                  alert.type === 'error'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
              >
                {alert.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />}
                {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                {alert.type === 'info' && <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{alert.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monitoring Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-neuro-primary text-white rounded-lg hover:bg-neuro-primary/90 transition-colors text-sm font-medium">
            View Detailed Logs
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
            Export Metrics
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
            Configure Alerts
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObservabilityDashboard;