import React, { useState, useEffect } from 'react';
import { FileText, Vote, CheckCircle, XCircle, Clock, Filter, Search, TrendingUp } from 'lucide-react';
import BadgeDisplay from './BadgeDisplay';
import { useGovernance } from '../lib/governance';

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

interface GovernanceFeedProps {
  proposals?: Proposal[];
  onProposalClick?: (proposal: Proposal) => void;
}

const GovernanceFeed: React.FC<GovernanceFeedProps> = ({
  proposals: initialProposals,
  onProposalClick
}) => {
  const { getActiveProposals } = useGovernance();
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals || []);
  const [filteredProposals, setFilteredProposals] = useState<Proposal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch active proposals
  useEffect(() => {
    if (!initialProposals) {
      const fetchProposals = async () => {
        try {
          const activeProposals = await getActiveProposals();
          // Convert governance service format to component format
          const formattedProposals: Proposal[] = activeProposals.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            category: p.category,
            proposer: p.author.toString(),
            timestamp: typeof p.createdAt === 'string' ? p.createdAt : p.createdAt.toISOString(),
            status: p.status === 'cancelled' ? 'expired' : p.status,
            votes: p.votes,
            voters: [], // Would need to be fetched separately
            votingPeriod: Math.ceil(((typeof p.votingEndsAt === 'string' ? new Date(p.votingEndsAt) : p.votingEndsAt).getTime() - (typeof p.createdAt === 'string' ? new Date(p.createdAt) : p.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
            quorum: 50, // Default quorum
            totalVotingPower: 100 // Would need to be calculated
          }));
          setProposals(formattedProposals);
        } catch (error) {
          console.error('Failed to fetch proposals:', error);
          // Fallback to mock data if fetch fails
          const mockProposals: Proposal[] = [
            {
              id: '1',
              title: 'Increase Validator Rewards by 15%',
              description: 'Proposal to increase validator rewards to improve network security and participation.',
              category: 'Economic',
              proposer: 'ValidatorMaster',
              timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active',
              votes: { yes: 45, no: 12, abstain: 8 },
              voters: ['user1', 'user2'],
              votingPeriod: 7,
              quorum: 50,
              totalVotingPower: 100
            }
          ];
          setProposals(mockProposals);
        }
      };
      fetchProposals();
    }
  }, [initialProposals, getActiveProposals]);

  useEffect(() => {
    let filtered = proposals;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(proposal =>
        proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(proposal => proposal.category === categoryFilter);
    }

    setFilteredProposals(filtered);
  }, [proposals, searchQuery, statusFilter, categoryFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Vote className="h-4 w-4 text-blue-500" />;
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'passed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'expired': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'Economic': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'Governance': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200';
      case 'Community': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      case 'Security': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const categories = ['all', ...Array.from(new Set(proposals.map(p => p.category)))];
  const statuses = ['all', 'active', 'passed', 'failed', 'expired'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-neuro-primary mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Governance Feed
          </h2>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredProposals.length} proposal{filteredProposals.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-neuro-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-neuro-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none px-4 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-neuro-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal) => (
          <div
            key={proposal.id}
            onClick={() => onProposalClick?.(proposal)}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mr-3">
                    {proposal.title}
                  </h3>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                    {getStatusIcon(proposal.status)}
                    <span>{proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {proposal.description}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>By {proposal.proposer}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(proposal.category)}`}>
                    {proposal.category}
                  </span>
                  <span>•</span>
                  <span>{formatTimeAgo(proposal.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Vote Summary */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {proposal.votes.yes}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Yes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {proposal.votes.no}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">No</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {proposal.votes.yes + proposal.votes.no + proposal.votes.abstain}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Votes</span>
                </div>
              </div>

              {proposal.status === 'active' && (
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Voting ends in {proposal.votingPeriod} days
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredProposals.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No proposals found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'No governance proposals available at this time'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernanceFeed;