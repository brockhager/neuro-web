import React, { useState } from 'react';
import PortalLayout from '../../components/PortalLayout';
import ProposalSubmission from '../../components/ProposalSubmission';
import VotingInterface from '../../components/VotingInterface';
import GovernanceFeed from '../../components/GovernanceFeed';
import TransparencyDashboard from '../../components/TransparencyDashboard';
import { FileText, Vote, BarChart3, Plus } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'feed' | 'submit' | 'transparency'>('feed');
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