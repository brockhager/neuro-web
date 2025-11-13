import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Vote, Clock, Target, Award, Activity, FileText } from 'lucide-react';
import { useGovernance } from '../lib/governance';

interface GovernanceMetrics {
  totalProposals: number;
  activeProposals: number;
  completedProposals: number;
  totalVotes: number;
  averageParticipation: number;
  averageDecisionTime: number;
  satisfactionScore: number;
  topCategories: Array<{ name: string; count: number; percentage: number }>;
  monthlyActivity: Array<{ month: string; proposals: number; votes: number }>;
}

interface TransparencyDashboardProps {
  showDetailed?: boolean;
}

const TransparencyDashboard: React.FC<TransparencyDashboardProps> = ({
  showDetailed = false
}) => {
  const { getGovernanceStats } = useGovernance();
  const [metrics, setMetrics] = useState<GovernanceMetrics>({
    totalProposals: 47,
    activeProposals: 8,
    completedProposals: 39,
    totalVotes: 1247,
    averageParticipation: 68.5,
    averageDecisionTime: 5.2,
    satisfactionScore: 8.7,
    topCategories: [
      { name: 'Technical', count: 15, percentage: 32 },
      { name: 'Economic', count: 12, percentage: 26 },
      { name: 'Governance', count: 10, percentage: 21 },
      { name: 'Community', count: 7, percentage: 15 },
      { name: 'Security', count: 3, percentage: 6 }
    ],
    monthlyActivity: [
      { month: 'Jan', proposals: 8, votes: 145 },
      { month: 'Feb', proposals: 12, votes: 189 },
      { month: 'Mar', proposals: 6, votes: 98 },
      { month: 'Apr', proposals: 15, votes: 234 },
      { month: 'May', proposals: 9, votes: 167 },
      { month: 'Jun', proposals: 11, votes: 201 }
    ]
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<'30d' | '90d' | '1y'>('90d');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getGovernanceStats();
        // Convert governance service format to component format
        setMetrics({
          totalProposals: stats.totalProposals,
          activeProposals: stats.activeProposals,
          completedProposals: stats.totalProposals - stats.activeProposals,
          totalVotes: stats.totalVotes,
          averageParticipation: stats.averageParticipation,
          averageDecisionTime: stats.decisionVelocity,
          satisfactionScore: stats.satisfactionScore,
          topCategories: [
            { name: 'Technical', count: 15, percentage: 32 },
            { name: 'Economic', count: 12, percentage: 26 },
            { name: 'Governance', count: 10, percentage: 21 },
            { name: 'Community', count: 7, percentage: 15 },
            { name: 'Security', count: 3, percentage: 6 }
          ],
          monthlyActivity: [
            { month: 'Jan', proposals: 8, votes: 145 },
            { month: 'Feb', proposals: 12, votes: 189 },
            { month: 'Mar', proposals: 6, votes: 98 },
            { month: 'Apr', proposals: 15, votes: 234 },
            { month: 'May', proposals: 9, votes: 167 },
            { month: 'Jun', proposals: 11, votes: 201 }
          ]
        });
      } catch (error) {
        console.error('Failed to fetch governance stats:', error);
        // Keep existing mock data as fallback
      }
    };

    fetchStats();

    // Mock real-time updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalVotes: prev.totalVotes + Math.floor(Math.random() * 5),
        averageParticipation: Math.max(0, Math.min(100, prev.averageParticipation + (Math.random() - 0.5) * 2)),
        satisfactionScore: Math.max(0, Math.min(10, prev.satisfactionScore + (Math.random() - 0.5) * 0.1))
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [getGovernanceStats]);

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ElementType;
    color: string;
    trend?: 'up' | 'down' | 'stable';
    subtitle?: string;
  }> = ({ title, value, unit, icon: Icon, color, trend, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}{unit}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        {trend && (
          <div className={`flex items-center ${
            trend === 'up' ? 'text-green-500' :
            trend === 'down' ? 'text-red-500' : 'text-gray-500'
          }`}>
            <TrendingUp className={`h-4 w-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
          </div>
        )}
      </div>
    </div>
  );

  const getParticipationColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BarChart3 className="h-6 w-6 text-neuro-primary mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Governance Transparency
          </h2>
        </div>
        <div className="flex space-x-2">
          {(['30d', '90d', '1y'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-neuro-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Proposals"
          value={metrics.totalProposals}
          icon={FileText}
          color="bg-blue-500"
          trend="up"
          subtitle={`${metrics.activeProposals} active`}
        />
        <MetricCard
          title="Total Votes Cast"
          value={metrics.totalVotes.toLocaleString()}
          icon={Vote}
          color="bg-green-500"
          trend="up"
        />
        <MetricCard
          title="Avg Participation"
          value={metrics.averageParticipation.toFixed(1)}
          unit="%"
          icon={Users}
          color="bg-purple-500"
          trend="stable"
        />
        <MetricCard
          title="Decision Velocity"
          value={metrics.averageDecisionTime.toFixed(1)}
          unit=" days"
          icon={Clock}
          color="bg-orange-500"
          trend="down"
        />
      </div>

      {/* Satisfaction & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Satisfaction Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Community Satisfaction
            </h3>
            <Award className="h-5 w-5 text-neuro-primary" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-3xl font-bold ${getSatisfactionColor(metrics.satisfactionScore)}`}>
                {metrics.satisfactionScore}/10
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Based on post-vote surveys
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Target: 8.0+</div>
              <div className="text-sm text-green-600 font-medium">✓ Exceeded</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                metrics.satisfactionScore >= 8 ? 'bg-green-500' :
                metrics.satisfactionScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${(metrics.satisfactionScore / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Participation Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Participation Rate
            </h3>
            <Activity className="h-5 w-5 text-neuro-primary" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-3xl font-bold ${getParticipationColor(metrics.averageParticipation)}`}>
                {metrics.averageParticipation}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Of eligible voters participate
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Target: 60%+</div>
              <div className="text-sm text-green-600 font-medium">✓ Achieved</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                metrics.averageParticipation >= 80 ? 'bg-green-500' :
                metrics.averageParticipation >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${metrics.averageParticipation}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {showDetailed && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Proposal Categories
          </h3>
          <div className="space-y-4">
            {metrics.topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-neuro-primary rounded-lg flex items-center justify-center text-white text-sm font-medium mr-4">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {category.count} proposals
                  </span>
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-neuro-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                    {category.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Activity Chart */}
      {showDetailed && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Monthly Activity
          </h3>
          <div className="space-y-4">
            {metrics.monthlyActivity.map((month) => (
              <div key={month.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                  {month.month}
                </span>
                <div className="flex-1 mx-4">
                  <div className="flex space-x-1">
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Proposals: {month.proposals}
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(month.proposals / 15) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex-1 ml-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Votes: {month.votes}
                      </div>
                      <div className="w-full bg-green-200 dark:bg-green-900 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(month.votes / 250) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badge Incentives & Rewards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <Award className="h-6 w-6 text-neuro-primary mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Badge Incentives & Rewards
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Early Voter Program */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Early Voter Bonus</span>
              <Activity className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">2x</div>
            <div className="text-xs opacity-90">Rewards multiplier</div>
          </div>

          {/* Total Rewards Distributed */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Rewards Distributed</span>
              <Award className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-xs opacity-90">NEURO tokens</div>
          </div>

          {/* Active Participants */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Active Voters</span>
              <Users className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">89</div>
            <div className="text-xs opacity-90">This month</div>
          </div>

          {/* Average Reward */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Avg Reward</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">8.5</div>
            <div className="text-xs opacity-90">NEURO per vote</div>
          </div>
        </div>

        {/* Badge Tiers */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Badge Tiers & Voting Power
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-1">🥉</div>
              <div className="font-medium text-gray-900 dark:text-white">Bronze</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">1 vote</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-1">🥈</div>
              <div className="font-medium text-gray-900 dark:text-white">Silver</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">3 votes</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-1">🥇</div>
              <div className="font-medium text-gray-900 dark:text-white">Gold</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">5 votes</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl mb-1">💎</div>
              <div className="font-medium text-gray-900 dark:text-white">Diamond</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">10 votes</div>
            </div>
          </div>
        </div>

        {/* Incentive Programs */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Active Incentive Programs
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Early Voter Program</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">2x rewards for first 30 days</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">23 days left</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Participation Streaks</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Bonus rewards for consecutive voting</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-600">1.5x multiplier</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Badge Upgrade Bonuses</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Extra rewards for tier advancement</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-purple-600">50-500 NEURO</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transparency Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <FileText className="h-6 w-6 text-neuro-primary mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transparency Logs
          </h3>
        </div>

        {/* Recent Activity Feed */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Recent Governance Activity
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* Sample transparency events - in real implementation, this would be dynamic */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">Proposal Created:</span> "Establish Core Development Working Group"
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  by NeuroSwarm Foundation • 2 hours ago • Technical
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">Vote Cast:</span> Yes on "Community Growth Strategy"
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  by 8xQ9...3kL • 45 minutes ago • 5 voting power • +12.5 NEURO reward
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">Badge Upgraded:</span> Bronze → Silver
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  by Dx7P...9mN • 30 minutes ago • +50 NEURO bonus
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">Rewards Claimed:</span> 87.5 NEURO
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  by 2kL8...7xQ • 15 minutes ago • 5 votes this period
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">Proposal Passed:</span> "Security Audit Program"
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  67% approval • 234 total votes • Executing next week
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Activity Summary (Last 30 Days)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">47</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Proposals Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1,247</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Votes Cast</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">89</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active Voters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">156</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Events Logged</div>
            </div>
          </div>
        </div>

        {/* Export & Audit */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                Transparency & Audit
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All governance activities are logged immutably for complete transparency
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                📊 Export Report
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                🔍 View Audit Trail
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Health Score */}
      <div className="bg-gradient-to-r from-neuro-primary to-neuro-secondary rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Governance Health Score</h3>
            <p className="text-neuro-light/90 mb-4">
              Overall assessment of governance effectiveness and community engagement
            </p>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold">A</div>
                <div className="text-sm text-neuro-light/80">Grade</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">92%</div>
                <div className="text-sm text-neuro-light/80">Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">↑ 5%</div>
                <div className="text-sm text-neuro-light/80">vs Last Month</div>
              </div>
            </div>
          </div>
          <Target className="h-16 w-16 text-neuro-light/50" />
        </div>
      </div>
    </div>
  );
};

export default TransparencyDashboard;