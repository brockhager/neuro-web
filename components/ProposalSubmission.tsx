import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Plus, FileText, Link, Tag, Users, Calendar, AlertCircle } from 'lucide-react';
import { useGovernance } from '../lib/governance';

interface ProposalFormData {
  title: string;
  description: string;
  category: string;
  documentationLinks: string[];
  tags: string[];
  votingPeriod: number; // in days
  quorum: number; // percentage
}

interface ProposalSubmissionProps {
  onProposalSubmitted?: (proposal: any) => void;
}

const ProposalSubmission: React.FC<ProposalSubmissionProps> = ({ onProposalSubmitted }) => {
  const { publicKey, connected } = useWallet();
  const { submitProposal } = useGovernance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProposalFormData>({
    title: '',
    description: '',
    category: '',
    documentationLinks: [],
    tags: [],
    votingPeriod: 7,
    quorum: 50
  });
  const [currentLink, setCurrentLink] = useState('');
  const [currentTag, setCurrentTag] = useState('');

  const categories = [
    'Technical',
    'Economic',
    'Governance',
    'Community',
    'Security',
    'Infrastructure',
    'Education'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !publicKey) {
      alert('Please connect your wallet to submit a proposal');
      return;
    }

    setIsSubmitting(true);
    try {
      // Submit proposal to Solana
      const proposalId = await submitProposal(
        formData.title,
        formData.description,
        formData.category,
        formData.documentationLinks,
        formData.tags
      );

      const proposal = {
        id: proposalId,
        ...formData,
        proposer: publicKey.toString(),
        timestamp: new Date().toISOString(),
        status: 'active',
        votes: { yes: 0, no: 0, abstain: 0 },
        voters: []
      };

      onProposalSubmitted?.(proposal);
      alert('Proposal submitted successfully to Solana!');

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        documentationLinks: [],
        tags: [],
        votingPeriod: 7,
        quorum: 50
      });
    } catch (error) {
      console.error('Failed to submit proposal:', error);
      alert('Failed to submit proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addDocumentationLink = () => {
    if (currentLink.trim() && !formData.documentationLinks.includes(currentLink.trim())) {
      setFormData(prev => ({
        ...prev,
        documentationLinks: [...prev.documentationLinks, currentLink.trim()]
      }));
      setCurrentLink('');
    }
  };

  const removeDocumentationLink = (link: string) => {
    setFormData(prev => ({
      ...prev,
      documentationLinks: prev.documentationLinks.filter(l => l !== link)
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  if (!connected) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Wallet Connection Required
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Please connect your wallet to submit governance proposals.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center mb-6">
        <Plus className="h-6 w-6 text-neuro-primary mr-3" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Submit Governance Proposal
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Proposal Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-neuro-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter a clear, descriptive title for your proposal"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-neuro-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Provide detailed explanation of your proposal, including rationale, expected impact, and implementation details"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-neuro-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Documentation Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Documentation Links
          </label>
          <div className="flex space-x-2 mb-3">
            <input
              type="url"
              value={currentLink}
              onChange={(e) => setCurrentLink(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-neuro-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://example.com/documentation"
            />
            <button
              type="button"
              onClick={addDocumentationLink}
              className="px-4 py-2 bg-neuro-primary text-white rounded-md hover:bg-neuro-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
          {formData.documentationLinks.length > 0 && (
            <div className="space-y-2">
              {formData.documentationLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-md p-2">
                  <div className="flex items-center">
                    <Link className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{link}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocumentationLink(link)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-neuro-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Add relevant tags"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-neuro-primary text-white rounded-md hover:bg-neuro-primary/90 transition-colors"
            >
              Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-neuro-primary/10 text-neuro-primary"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-neuro-primary hover:text-neuro-primary/80"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Voting Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voting Period (days)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.votingPeriod}
              onChange={(e) => setFormData(prev => ({ ...prev, votingPeriod: parseInt(e.target.value) || 7 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-neuro-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quorum (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.quorum}
              onChange={(e) => setFormData(prev => ({ ...prev, quorum: parseInt(e.target.value) || 50 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-neuro-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-3 bg-neuro-primary text-white rounded-lg hover:bg-neuro-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5 mr-2" />
                Submit Proposal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProposalSubmission;