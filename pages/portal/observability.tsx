import React from 'react';
import PortalLayout from '../../components/PortalLayout';
import ObservabilityDashboard from '../../components/ObservabilityDashboard';
import { Activity, BarChart3, Settings } from 'lucide-react';

const ObservabilityPage: React.FC = () => {
  return (
    <PortalLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Activity className="h-8 w-8 text-neuro-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              System Observability
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Monitor system health, performance metrics, and infrastructure status
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Status</p>
                <p className="text-lg font-semibold text-green-600">Healthy</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Nodes</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">47/50</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">145ms</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">99.9%</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Observability Dashboard */}
        <ObservabilityDashboard showDetailed={true} />
      </div>
    </PortalLayout>
  );
};

export default ObservabilityPage;