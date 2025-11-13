import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircle, XCircle, Minus, Vote, Users, Clock, Trophy } from 'lucide-react';
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

interface VoteOption {
  value: 'yes' | 'no' | 'abstain';
  label: string;
  icon: React.ElementType;
  color: string;
}

interface VotingInterfaceProps {
  proposal: Proposal;
  onVoteSubmitted?: (proposalId: string, vote: string, votingPower: number) => void;
  userVotingPower?: number;
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({
  proposal,
  onVoteSubmitted,
  userVotingPower = 1
}) => {
  const { publicKey, connected } = useWallet();
  const { castVote } = useGovernance();
  const [selectedVote, setSelectedVote] = useState<'yes' | 'no' | 'abstain' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const voteOptions: VoteOption[] = [
    {
      value: 'yes',
      label: 'Yes',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
    },
    {
      value: 'no',
      label: 'No',
      icon: XCircle,
      color: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
    },
    {
      value: 'abstain',
      label: 'Abstain',
      icon: Minus,
      color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200'
    }
  ];

  useEffect(() => {
    if (publicKey && proposal.voters.includes(publicKey.toString())) {
      setHasVoted(true);
    }
  }, [publicKey, proposal.voters]);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const endTime = new Date(proposal.timestamp);
      endTime.setDate(endTime.getDate() + proposal.votingPeriod);

      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [proposal.timestamp, proposal.votingPeriod]);

  const handleVote = async () => {
    if (!selectedVote || !connected || !publicKey || hasVoted) return;

    setIsVoting(true);
    try {
      // Cast vote on Solana
      const signature = await castVote(proposal.id, selectedVote, userVotingPower);

      onVoteSubmitted?.(proposal.id, selectedVote, userVotingPower);
      setHasVoted(true);
      alert(`Vote submitted successfully to Solana! Transaction: ${signature.slice(0, 8)}...`);
    } catch (error) {
      console.error('Failed to submit vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes = proposal.votes.yes + proposal.votes.no + proposal.votes.abstain;
  const quorumReached = (totalVotes / proposal.totalVotingPower) * 100 >= proposal.quorum;
  const yesPercentage = totalVotes > 0 ? (proposal.votes.yes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (proposal.votes.no / totalVotes) * 100 : 0;

  const getVoteResult = () => {
    if (proposal.status === 'passed') return { text: 'Passed', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900' };
    if (proposal.status === 'failed') return { text: 'Failed', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900' };
    if (proposal.status === 'expired') return { text: 'Expired', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700' };
    return { text: 'Active', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900' };
  };

  const result = getVoteResult();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Vote className="h-6 w-6 text-neuro-primary mr-3" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Governance Vote
          </h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${result.bg} ${result.color}`}>
          {result.text}
        </div>
      </div>

      {/* Voting Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalVotes}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Votes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {timeRemaining}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Time Remaining</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${quorumReached ? 'text-green-600' : 'text-yellow-600'}`}>
            {((totalVotes / proposal.totalVotingPower) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Quorum ({proposal.quorum}%)</div>
        </div>
      </div>

      {/* Vote Results */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Vote Results</h4>
        <div className="space-y-3">
          {/* Yes votes */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Yes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${yesPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                {yesPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* No votes */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">No</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${noPercentage}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                {noPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Abstain */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Minus className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Abstain</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalVotes > 0 ? (proposal.votes.abstain / totalVotes) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                {totalVotes > 0 ? ((proposal.votes.abstain / totalVotes) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Interface */}
      {proposal.status === 'active' && !hasVoted && connected && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Cast Your Vote
          </h4>

          {/* Voting Power Display */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 text-neuro-primary mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Voting Power
              </span>
            </div>
            <BadgeDisplay tier="silver" size="sm" showLabel={false} />
            <span className="text-lg font-bold text-neuro-primary">{userVotingPower}</span>
          </div>

          {/* Vote Options */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {voteOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedVote(option.value)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    selectedVote === option.value
                      ? 'border-neuro-primary bg-neuro-primary/5'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <Icon className={`h-8 w-8 mb-2 ${option.color.split(' ')[0]}`} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Submit Vote */}
          <button
            onClick={handleVote}
            disabled={!selectedVote || isVoting}
            className="w-full flex items-center justify-center px-6 py-3 bg-neuro-primary text-white rounded-lg hover:bg-neuro-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVoting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting Vote...
              </>
            ) : (
              <>
                <Vote className="h-5 w-5 mr-2" />
                Submit Vote
              </>
            )}
          </button>
        </div>
      )}

      {/* Already Voted */}
      {hasVoted && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              You have already voted on this proposal
            </span>
          </div>
        </div>
      )}

      {/* Voting Closed */}
      {proposal.status !== 'active' && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Voting has {proposal.status === 'expired' ? 'expired' : 'closed'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingInterface;