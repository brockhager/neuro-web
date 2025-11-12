import { Trophy, Award, Star, Crown } from 'lucide-react'

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond'

interface BadgeDisplayProps {
  tier: BadgeTier
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const badgeConfig = {
  bronze: {
    icon: Trophy,
    label: 'Bronze',
    className: 'badge-bronze',
    votes: 1,
  },
  silver: {
    icon: Award,
    label: 'Silver',
    className: 'badge-silver',
    votes: 3,
  },
  gold: {
    icon: Star,
    label: 'Gold',
    className: 'badge-gold',
    votes: 5,
  },
  diamond: {
    icon: Crown,
    label: 'Diamond',
    className: 'badge-diamond',
    votes: 10,
  },
}

export default function BadgeDisplay({ tier, size = 'md', showLabel = true }: BadgeDisplayProps) {
  const config = badgeConfig[tier]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`${config.className} flex items-center space-x-1`}>
        <Icon className={sizeClasses[size]} />
        {showLabel && <span>{config.label}</span>}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {config.votes} vote{config.votes !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

export function ContributorCard({ name, tier, contributions, joinedDate }: {
  name: string
  tier: BadgeTier
  contributions: number
  joinedDate: string
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-neuro-primary rounded-full flex items-center justify-center">
            <span className="text-white font-medium">{name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Joined {joinedDate}</p>
          </div>
        </div>
        <BadgeDisplay tier={tier} size="sm" />
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Contributions</span>
          <span className="font-medium text-gray-900 dark:text-white">{contributions}</span>
        </div>
      </div>
    </div>
  )
}