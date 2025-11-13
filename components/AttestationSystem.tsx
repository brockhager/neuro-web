import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface AttestationData {
  confidence: number;
  totalAttestations: number;
  recentAttestations: number;
  lastAttestation: string;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
}

interface AttestationSystemProps {
  userAddress?: string;
  onAttestationUpdate?: (data: AttestationData) => void;
}

const AttestationSystem: React.FC<AttestationSystemProps> = ({
  userAddress,
  onAttestationUpdate
}) => {
  const { publicKey, sendTransaction } = useWallet();
  const [attestationData, setAttestationData] = useState<AttestationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAttesting, setIsAttesting] = useState(false);

  // Mock Solana connection - in production, this would connect to actual Solana network
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  const fetchAttestationData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock API call - in production, this would query Solana program accounts
      const mockData: AttestationData = {
        confidence: 87,
        totalAttestations: 23,
        recentAttestations: 5,
        lastAttestation: '2 hours ago',
        tier: 'gold'
      };

      setAttestationData(mockData);
      onAttestationUpdate?.(mockData);
    } catch (error) {
      console.error('Failed to fetch attestation data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onAttestationUpdate]);

  useEffect(() => {
    if (userAddress || publicKey) {
      fetchAttestationData();
    }
  }, [userAddress, publicKey, fetchAttestationData]);

  const submitAttestation = async (targetAddress: string, confidence: number) => {
    if (!publicKey) return;

    setIsAttesting(true);
    try {
      // Mock transaction - in production, this would create a real Solana transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(targetAddress),
          lamports: 1000, // Minimal fee for attestation
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Refresh attestation data after successful attestation
      await fetchAttestationData();

      return signature;
    } catch (error) {
      console.error('Attestation failed:', error);
      throw error;
    } finally {
      setIsAttesting(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-200';
      case 'silver': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
      case 'gold': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'diamond': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="h-6 w-6 animate-spin text-neuro-primary" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading attestation data...</span>
      </div>
    );
  }

  if (!attestationData) {
    return (
      <div className="text-center p-6">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No attestation data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-neuro-primary mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Attestation System
          </h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTierColor(attestationData.tier)}`}>
          {attestationData.tier.charAt(0).toUpperCase() + attestationData.tier.slice(1)} Tier
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className={`text-3xl font-bold mb-1 ${getConfidenceColor(attestationData.confidence)}`}>
            {attestationData.confidence}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Confidence Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {attestationData.totalAttestations}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Attestations</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {attestationData.recentAttestations}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Recent (30 days)</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Last attestation: {attestationData.lastAttestation}</span>
        <button
          onClick={fetchAttestationData}
          disabled={isLoading}
          className="text-neuro-primary hover:text-neuro-primary/80 font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Attestation Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h4>
        <div className="flex space-x-3">
          <button
            onClick={() => submitAttestation('11111111111111111111111111111112', 85)}
            disabled={isAttesting || !publicKey}
            className="flex items-center px-4 py-2 bg-neuro-primary text-white rounded-lg hover:bg-neuro-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAttesting ? (
              <Loader className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Submit Attestation
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <AlertCircle className="h-4 w-4 mr-2" />
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttestationSystem;