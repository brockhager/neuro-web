import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowRight, Brain, Users, Shield, Zap } from 'lucide-react'

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neuro-primary/5 to-neuro-secondary/5">
      <Head>
        <title>NeuroSwarm - Decentralized AI Platform</title>
        <meta name="description" content="A decentralized network for verifiable AI model provenance and collaboration" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Brain className="h-16 w-16 text-neuro-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-neuro-primary to-neuro-secondary">NeuroSwarm</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            A decentralized network where personal AI agents learn locally and contribute to a collective Global Brain.
            Every AI interaction is verifiable, transparent, and cryptographically attested on Solana.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/portal" className="btn-primary flex items-center justify-center px-8 py-3 text-lg">
              Enter Portal
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/docs/overview.md" className="btn-secondary flex items-center justify-center px-8 py-3 text-lg">
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-neuro-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-neuro-primary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Verifiable Trust
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Every AI model and decision is cryptographically attested and auditable.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-neuro-secondary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-neuro-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Community Driven
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Democratic governance and fair incentives for all contributors.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-neuro-accent/10 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-neuro-accent" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Personal AI
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Own your AI assistant that learns from your interactions and preferences.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Decentralized
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              No central authority controls the AI ecosystem - it's owned by the community.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Join the Swarm?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start your journey in the NeuroSwarm ecosystem. Learn, contribute, and help shape the future of decentralized AI.
            </p>
            <Link href="/portal" className="btn-primary inline-flex items-center">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home