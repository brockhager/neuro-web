'use client'

import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'

// Governance Program ID (placeholder - would be deployed program)
const GOVERNANCE_PROGRAM_ID = new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw')

export interface Proposal {
  id: string
  title: string
  description: string
  category: string
  author: PublicKey
  createdAt: Date
  votingEndsAt: Date
  status: 'active' | 'passed' | 'failed' | 'cancelled'
  votes: {
    yes: number
    no: number
    abstain: number
  }
  documentationLinks: string[]
  tags: string[]
}

export interface Vote {
  proposalId: string
  voter: PublicKey
  choice: 'yes' | 'no' | 'abstain'
  weight: number
  timestamp: Date
}

export class GovernanceService {
  private connection: Connection

  constructor(rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed')
  }

  // Submit a new proposal to the Solana program
  async submitProposal(
    wallet: any,
    title: string,
    description: string,
    category: string,
    documentationLinks: string[] = [],
    tags: string[] = []
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    // Create proposal account
    const proposalAccount = Keypair.generate().publicKey

    // Create transaction to submit proposal
    const transaction = new Transaction().add(
      // This would be a custom instruction to the governance program
      // For now, we'll simulate with a simple transfer
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: GOVERNANCE_PROGRAM_ID,
        lamports: 1000000, // 0.001 SOL fee
      })
    )

    // Sign and send transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [wallet]
    )

    // In a real implementation, this would return the proposal ID from the program
    return signature
  }

  // Cast a vote on a proposal
  async castVote(
    wallet: any,
    proposalId: string,
    choice: 'yes' | 'no' | 'abstain',
    weight: number = 1
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected')
    }

    // Create transaction to cast vote
    const transaction = new Transaction().add(
      // Custom instruction to cast vote
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: GOVERNANCE_PROGRAM_ID,
        lamports: 10000, // Small fee for voting
      })
    )

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [wallet]
    )

    return signature
  }

  // Get proposal details
  async getProposal(proposalId: string): Promise<Proposal | null> {
    // In a real implementation, this would fetch from the Solana program
    // For now, return mock data
    return {
      id: proposalId,
      title: 'Sample Proposal',
      description: 'This is a sample governance proposal',
      category: 'Technical',
      author: new PublicKey('11111111111111111111111111111112'),
      createdAt: new Date(),
      votingEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      status: 'active',
      votes: { yes: 150, no: 45, abstain: 23 },
      documentationLinks: ['https://docs.neuroswarm.ai/proposal-1'],
      tags: ['governance', 'technical']
    }
  }

  // Get all active proposals
  async getActiveProposals(): Promise<Proposal[]> {
    // Mock data for active proposals
    return [
      {
        id: 'prop-1',
        title: 'Implement Neural Network Optimization',
        description: 'Proposal to optimize neural network performance across the swarm',
        category: 'Technical',
        author: new PublicKey('11111111111111111111111111111112'),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        votingEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        votes: { yes: 234, no: 67, abstain: 12 },
        documentationLinks: ['https://docs.neuroswarm.ai/nn-optimization'],
        tags: ['technical', 'performance', 'neural-networks']
      },
      {
        id: 'prop-2',
        title: 'Community Governance Framework',
        description: 'Establish framework for community-driven decision making',
        category: 'Governance',
        author: new PublicKey('22222222222222222222222222222222'),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        votingEndsAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        status: 'active',
        votes: { yes: 189, no: 23, abstain: 45 },
        documentationLinks: ['https://docs.neuroswarm.ai/governance-framework'],
        tags: ['governance', 'community', 'framework']
      }
    ]
  }

  // Get voting history for a user
  async getVotingHistory(publicKey: PublicKey): Promise<Vote[]> {
    // Mock voting history
    return [
      {
        proposalId: 'prop-1',
        voter: publicKey,
        choice: 'yes',
        weight: 2, // Based on badge tier
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]
  }

  // Get governance statistics
  async getGovernanceStats() {
    return {
      totalProposals: 156,
      activeProposals: 8,
      totalVotes: 12450,
      averageParticipation: 78.5,
      decisionVelocity: 4.2, // days
      satisfactionScore: 8.7
    }
  }
}

// React hook for using governance service
export function useGovernance() {
  const { wallet } = useWallet()
  const governanceService = new GovernanceService()

  return {
    submitProposal: (title: string, description: string, category: string, documentationLinks?: string[], tags?: string[]) =>
      governanceService.submitProposal(wallet, title, description, category, documentationLinks, tags),
    castVote: (proposalId: string, choice: 'yes' | 'no' | 'abstain', weight?: number) =>
      governanceService.castVote(wallet, proposalId, choice, weight),
    getProposal: (proposalId: string) => governanceService.getProposal(proposalId),
    getActiveProposals: () => governanceService.getActiveProposals(),
    getVotingHistory: (publicKey: PublicKey) => governanceService.getVotingHistory(publicKey),
    getGovernanceStats: () => governanceService.getGovernanceStats()
  }
}