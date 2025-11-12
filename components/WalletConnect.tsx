'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react'

export default function WalletConnect() {
  const { publicKey, connected } = useWallet()
  const [isVerifying, setIsVerifying] = useState(false)

  const handleVerification = async () => {
    if (!connected || !publicKey) return

    setIsVerifying(true)
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsVerifying(false)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-neuro-primary" />
          Wallet Connection
        </h3>
        {connected && (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4 mr-1" />
            <span className="text-sm">Connected</span>
          </div>
        )}
      </div>

      {!connected ? (
        <div className="text-center py-4">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your Solana wallet to participate in governance and access contributor features.
          </p>
          <WalletMultiButton className="!bg-neuro-primary hover:!bg-neuro-primary/90 !text-white !rounded-lg !px-6 !py-2 !font-medium" />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Wallet Address
            </label>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 font-mono text-sm">
              {publicKey?.toString()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contributor Status
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span className="text-sm">Verification Required</span>
              </div>
              <button
                onClick={handleVerification}
                disabled={isVerifying}
                className="btn-secondary text-sm px-3 py-1"
              >
                {isVerifying ? 'Verifying...' : 'Verify Identity'}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Governance Access
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                Voting Rights
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                Proposal Submission
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                Committee Access
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                Badge Claims
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}