import React, { useState } from 'react';
import PortalLayout from '../../components/PortalLayout';
import ProposalSubmission from '../../components/ProposalSubmission';
import VotingInterface from '../../components/VotingInterface';
import GovernanceFeed from '../../components/GovernanceFeed';
import TransparencyDashboard from '../../components/TransparencyDashboard';
import { FileText, Vote, BarChart3, Plus, HelpCircle } from 'lucide-react';

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: string;
  proposer: string;
  timestamp: string;
  status: 'active' | 'passed' | 'failed' | 'expired';
  votes: {
    yes: number;
    no: number;
    abstain: number;
  };
  voters: string[];
  votingPeriod: number;
  quorum: number;
  totalVotingPower: number;
}

const GovernancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'submit' | 'transparency' | 'help'>('feed');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const tabs = [
    {
      id: 'feed' as const,
      label: 'Governance Feed',
      icon: FileText,
      description: 'Browse and vote on active proposals'
    },
    {
      id: 'submit' as const,
      label: 'Submit Proposal',
      icon: Plus,
      description: 'Create a new governance proposal'
    },
    {
      id: 'help' as const,
      label: 'How to Vote',
      icon: HelpCircle,
      description: 'Quick start guide for governance participation'
    },
    {
      id: 'transparency' as const,
      label: 'Transparency',
      icon: BarChart3,
      description: 'View governance metrics and analytics'
    }
  ];

  const handleProposalSubmitted = (newProposal: any) => {
    const proposal: Proposal = {
      ...newProposal,
      status: 'active',
      votes: { yes: 0, no: 0, abstain: 0 },
      voters: [],
      totalVotingPower: 100 // Mock value
    };
    setProposals(prev => [proposal, ...prev]);
  };

  const handleVoteSubmitted = (proposalId: string, vote: string, votingPower: number) => {
    setProposals(prev => prev.map(proposal => {
      if (proposal.id === proposalId) {
        return {
          ...proposal,
          votes: {
            ...proposal.votes,
            [vote]: proposal.votes[vote as keyof typeof proposal.votes] + votingPower
          },
          voters: [...proposal.voters, 'current-user'] // Mock voter
        };
      }
      return proposal;
    }));
  };

  const handleProposalClick = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setActiveTab('feed'); // Switch to feed tab to show voting interface
  };

  return (
    <PortalLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Vote className="h-8 w-8 text-neuro-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Governance Hub
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Participate in NeuroSwarm's decentralized governance system
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-neuro-primary shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Description */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{tabs.find(tab => tab.id === activeTab)?.label}:</strong>{' '}
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'feed' && (
          <div className="space-y-8">
            {/* Selected Proposal Voting Interface */}
            {selectedProposal && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Vote on Proposal
                  </h2>
                  <button
                    onClick={() => setSelectedProposal(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                <VotingInterface
                  proposal={selectedProposal}
                  onVoteSubmitted={handleVoteSubmitted}
                  userVotingPower={3} // Mock voting power based on badge tier
                />
              </div>
            )}

            {/* Governance Feed */}
            <GovernanceFeed
              proposals={proposals}
              onProposalClick={handleProposalClick}
            />
          </div>
        )}

        {activeTab === 'submit' && (
          <ProposalSubmission onProposalSubmitted={handleProposalSubmitted} />
        )}

        {activeTab === 'help' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center mb-6">
              <HelpCircle className="h-8 w-8 text-neuro-primary mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                How to Vote in NeuroSwarm Governance
              </h2>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🚀 Quick Start (5 minutes)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prerequisites */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Prerequisites</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>✅ NeuroSwarm contributor account</li>
                    <li>✅ At least Bronze badge</li>
                    <li>✅ Connected Solana wallet</li>
                    <li>✅ Active within last 90 days</li>
                  </ul>
                </div>

                {/* Voting Power */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Your Voting Power</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">🥉 Bronze Badge:</span>
                      <span className="font-medium text-orange-600">1 vote</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">🥈 Silver Badge:</span>
                      <span className="font-medium text-gray-600">3 votes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">🥇 Gold Badge:</span>
                      <span className="font-medium text-yellow-600">5 votes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">💎 Diamond Badge:</span>
                      <span className="font-medium text-blue-600">10 votes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step by Step */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📋 Step-by-Step Voting Guide
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-neuro-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Access Governance Portal</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Visit the Governance tab and connect your Solana wallet if prompted.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-neuro-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Browse Active Proposals</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Use filters and search to find proposals by category, status, or keywords.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-neuro-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Review Proposal Details</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Read the full proposal, check proposer credentials, and review supporting documentation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-neuro-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Cast Your Vote</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Choose Yes, No, or Abstain. Your vote weight depends on your badge tier.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-neuro-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Track Results</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Watch live results and get notified when voting closes. Earn participation badges!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Proposal Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🏷️ Proposal Categories & Rules
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 font-medium text-gray-900 dark:text-white">Type</th>
                      <th className="text-center py-2 font-medium text-gray-900 dark:text-white">Approval</th>
                      <th className="text-center py-2 font-medium text-gray-900 dark:text-white">Discussion</th>
                      <th className="text-center py-2 font-medium text-gray-900 dark:text-white">Voting</th>
                      <th className="text-center py-2 font-medium text-gray-900 dark:text-white">Quorum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="py-3 text-gray-900 dark:text-white">🛠️ Technical</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">75%</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">14 days</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">7 days</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">25%</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-900 dark:text-white">🎯 Strategic</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">60%</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">21 days</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">14 days</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">25%</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-900 dark:text-white">⚙️ Operational</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">50% + 1</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">7 days</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">3 days</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">15%</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-900 dark:text-white">🚨 Emergency</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">60%</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">1 day</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">12 hours</td>
                      <td className="text-center py-3 text-gray-600 dark:text-gray-400">10%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-r from-neuro-primary to-neuro-secondary rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">💡 Pro Tips for Successful Voting</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎯</span>
                    <span className="text-sm">Vote early to help reach quorum faster</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📝</span>
                    <span className="text-sm">Provide feedback during discussion periods</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🌟</span>
                    <span className="text-sm">Stay active to increase your badge tier</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">📊</span>
                    <span className="text-sm">Track how your votes shape NeuroSwarm's future</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Need more detailed information?
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="/docs/governance/voting.md"
                  className="inline-flex items-center px-4 py-2 bg-neuro-primary text-white rounded-lg hover:bg-neuro-primary/90 transition-colors"
                >
                  📖 Complete Voting Guide
                </a>
                <a
                  href="/docs/governance/governance-charter.md"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  🏛️ Governance Charter
                </a>
                <a
                  href="/docs/contributor-recognition.md"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  🏆 Earn Badges
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transparency' && (
          <TransparencyDashboard showDetailed={true} />
        )}

        {/* Governance Stats Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <Vote className="h-8 w-8 text-neuro-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">47</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Proposals</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <FileText className="h-8 w-8 text-neuro-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Proposals</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <BarChart3 className="h-8 w-8 text-neuro-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">1,247</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Votes</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <Plus className="h-8 w-8 text-neuro-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">68.5%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Participation Rate</div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default GovernancePage;