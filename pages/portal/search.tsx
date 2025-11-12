import React, { useState, useEffect } from 'react';
import PortalLayout from '../../components/PortalLayout';
import { Brain, Search, FileText, Users, BookOpen, Filter, ExternalLink } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  type: 'document' | 'forum' | 'user' | 'learning';
  category: string;
  excerpt: string;
  author?: string;
  lastUpdated: string;
  relevance: number;
}

const SearchDiscovery: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Mock search data - in a real implementation, this would come from an API
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Validator Node Architecture',
      type: 'document',
      category: 'Technical',
      excerpt: 'Comprehensive guide to setting up and maintaining validator nodes in the NeuroSwarm network...',
      author: 'TechDocs Team',
      lastUpdated: '2 days ago',
      relevance: 0.95,
    },
    {
      id: '2',
      title: 'Governance Proposal: Reward Distribution',
      type: 'forum',
      category: 'Governance',
      excerpt: 'Discussion on optimizing reward distribution mechanisms for better network participation...',
      author: 'GovExpert',
      lastUpdated: '5 hours ago',
      relevance: 0.89,
    },
    {
      id: '3',
      title: 'Smart Contract Development Course',
      type: 'learning',
      category: 'Education',
      excerpt: 'Learn to build secure smart contracts for the NeuroSwarm ecosystem...',
      author: 'DevAcademy',
      lastUpdated: '1 week ago',
      relevance: 0.87,
    },
    {
      id: '4',
      title: 'Tokenomics Whitepaper',
      type: 'document',
      category: 'Economics',
      excerpt: 'Detailed analysis of NeuroSwarm token economics and long-term sustainability...',
      author: 'Economics Team',
      lastUpdated: '3 days ago',
      relevance: 0.92,
    },
    {
      id: '5',
      title: 'Community Contributor: NodeMaster',
      type: 'user',
      category: 'Community',
      excerpt: 'Experienced validator operator with 2+ years in blockchain infrastructure...',
      author: 'NodeMaster',
      lastUpdated: 'Active now',
      relevance: 0.78,
    },
  ];

  useEffect(() => {
    if (query.length > 2) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const filtered = mockResults.filter(result =>
          result.title.toLowerCase().includes(query.toLowerCase()) ||
          result.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          result.category.toLowerCase().includes(query.toLowerCase())
        ).sort((a, b) => b.relevance - a.relevance);
        setResults(filtered);
        setIsLoading(false);
      }, 500);
    } else {
      setResults([]);
    }
  }, [query]);

  const filteredResults = activeFilter === 'all'
    ? results
    : results.filter(result => result.type === activeFilter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5" />;
      case 'forum': return <Users className="h-5 w-5" />;
      case 'learning': return <BookOpen className="h-5 w-5" />;
      case 'user': return <Users className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'forum': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'learning': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-200';
      case 'user': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <PortalLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Brain className="h-8 w-8 text-neuro-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Search & Discovery
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Find documentation, discussions, learning resources, and community members
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search NeuroSwarm ecosystem..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-neuro-primary focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        {query.length > 2 && (
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-4">Filter by:</span>
              {['all', 'document', 'forum', 'learning', 'user'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-neuro-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query.length > 2 && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neuro-primary mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Searching...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 dark:text-gray-400">
                    Found {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} for "{query}"
                  </p>
                </div>
                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <div
                      key={result.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(result.type)}`}>
                              {getTypeIcon(result.type)}
                              <span>{result.type.charAt(0).toUpperCase() + result.type.slice(1)}</span>
                            </div>
                            <span className="mx-3 text-gray-400">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{result.category}</span>
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {result.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {result.excerpt}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            {result.author && (
                              <>
                                <span>By {result.author}</span>
                                <span className="mx-2">•</span>
                              </>
                            )}
                            <span>Updated {result.lastUpdated}</span>
                            <span className="mx-2">•</span>
                            <span className="text-neuro-primary font-medium">
                              {Math.round(result.relevance * 100)}% relevant
                            </span>
                          </div>
                        </div>
                        <button className="ml-4 p-2 text-gray-400 hover:text-neuro-primary transition-colors">
                          <ExternalLink className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : query.length > 2 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or browse our documentation
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Popular Searches */}
        {query.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Popular Searches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'Validator Setup',
                'Governance Proposals',
                'Smart Contracts',
                'Tokenomics',
                'Node Operations',
                'Community Guidelines'
              ].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-neuro-primary hover:bg-neuro-primary/5 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{term}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Popular search</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <FileText className="h-8 w-8 text-neuro-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">247</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <Users className="h-8 w-8 text-neuro-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">1,247</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Community Members</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <BookOpen className="h-8 w-8 text-neuro-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">89</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Learning Resources</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
            <Brain className="h-8 w-8 text-neuro-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Discussions</div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};

export default SearchDiscovery;