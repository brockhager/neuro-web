import PortalLayout from '../../components/PortalLayout'
import BadgeDisplay from '../../components/BadgeDisplay'
import { BookOpen, CheckCircle, Clock, Play, Award, ArrowRight } from 'lucide-react'

export default function LearningPage() {
  const learningModules = [
    {
      id: 1,
      title: 'Getting Started with NeuroSwarm',
      description: 'Learn the basics of the NeuroSwarm ecosystem and how decentralized AI works.',
      progress: 100,
      status: 'completed',
      duration: '30 min',
      difficulty: 'Beginner',
      badge: 'bronze' as const,
    },
    {
      id: 2,
      title: 'Understanding the Global Brain',
      description: 'Explore how individual AI agents contribute to collective intelligence.',
      progress: 75,
      status: 'in-progress',
      duration: '45 min',
      difficulty: 'Intermediate',
      badge: 'silver' as const,
    },
    {
      id: 3,
      title: 'Validator Node Setup',
      description: 'Step-by-step guide to setting up and running a validator node.',
      progress: 100,
      status: 'completed',
      duration: '60 min',
      difficulty: 'Advanced',
      badge: 'gold' as const,
    },
    {
      id: 4,
      title: 'Governance Participation',
      description: 'Learn how to participate in NeuroSwarm governance and voting.',
      progress: 30,
      status: 'in-progress',
      duration: '40 min',
      difficulty: 'Intermediate',
      badge: 'silver' as const,
    },
    {
      id: 5,
      title: 'Contributing to the Knowledge Base',
      description: 'How to contribute documentation and improve the collective knowledge.',
      progress: 0,
      status: 'locked',
      duration: '35 min',
      difficulty: 'Intermediate',
      badge: 'gold' as const,
    },
    {
      id: 6,
      title: 'Advanced Solana Integration',
      description: 'Deep dive into Solana programs and attestation mechanisms.',
      progress: 0,
      status: 'locked',
      duration: '90 min',
      difficulty: 'Advanced',
      badge: 'diamond' as const,
    },
  ]

  const recommendedNext = learningModules.find(m => m.status === 'in-progress')

  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-neuro-secondary to-neuro-accent rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Your Learning Path</h1>
              <p className="mt-2 text-neuro-light/90">
                Master NeuroSwarm concepts and earn badges as you progress
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">3/6</div>
              <div className="text-sm text-neuro-light/80">Modules Completed</div>
            </div>
          </div>
        </div>

        {/* Recommended Next */}
        {recommendedNext && (
          <div className="card border-l-4 border-neuro-primary">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-neuro-primary">Recommended Next</span>
                  <BadgeDisplay tier={recommendedNext.badge} size="sm" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {recommendedNext.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {recommendedNext.description}
                </p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {recommendedNext.duration}
                  </span>
                  <span>{recommendedNext.difficulty}</span>
                  <span className="flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    Earns {recommendedNext.badge} badge
                  </span>
                </div>
              </div>
              <button className="btn-primary flex items-center ml-6">
                <Play className="h-4 w-4 mr-2" />
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Learning Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningModules.map((module) => (
            <div
              key={module.id}
              className={`card transition-all duration-200 ${
                module.status === 'locked'
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:shadow-lg cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    module.status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900'
                      : module.status === 'in-progress'
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {module.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : module.status === 'in-progress' ? (
                      <Play className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {module.title}
                    </h3>
                    <BadgeDisplay tier={module.badge} size="sm" showLabel={false} />
                  </div>
                </div>
                {module.status !== 'locked' && (
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {module.description}
              </p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {module.duration}
                  </span>
                  <span>{module.difficulty}</span>
                </div>
                {module.status === 'in-progress' && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {module.progress}% complete
                    </div>
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className="bg-neuro-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${module.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {module.status === 'locked' && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete previous modules to unlock this content
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Summary */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neuro-primary mb-2">50%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall Completion</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                <div className="bg-neuro-primary h-2 rounded-full w-1/2"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">3</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Modules Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">2</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}