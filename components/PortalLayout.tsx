import { ReactNode } from 'react'
import Link from 'next/link'
import { Brain, Users, BookOpen, Trophy, Search, Settings } from 'lucide-react'

interface PortalLayoutProps {
  children: ReactNode
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-neuro-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                NeuroSwarm Portal
              </span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/portal" className="text-gray-700 dark:text-gray-300 hover:text-neuro-primary px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/portal/learn" className="text-gray-700 dark:text-gray-300 hover:text-neuro-primary px-3 py-2 rounded-md text-sm font-medium">
                Learn
              </Link>
              <Link href="/portal/community" className="text-gray-700 dark:text-gray-300 hover:text-neuro-primary px-3 py-2 rounded-md text-sm font-medium">
                Community
              </Link>
              <Link href="/portal/search" className="text-gray-700 dark:text-gray-300 hover:text-neuro-primary px-3 py-2 rounded-md text-sm font-medium">
                Search
              </Link>
              <Link href="/portal/governance" className="text-gray-700 dark:text-gray-300 hover:text-neuro-primary px-3 py-2 rounded-md text-sm font-medium">
                Governance
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Search className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Settings className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 bg-neuro-primary rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">U</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}