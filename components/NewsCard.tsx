import React from 'react';
import { ExternalLink, Clock, MessageSquare } from 'lucide-react';

interface NewsStory {
    id: number;
    title: string;
    url: string;
    score: number;
    by: string;
    time: number;
}

interface NewsData {
    topic: string;
    stories: NewsStory[];
}

interface NewsCardProps {
    data: NewsData;
}

const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutes

    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
};

export const NewsCard: React.FC<NewsCardProps> = ({ data }) => {
    if (!data || !data.stories) return null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm w-full max-w-sm">
            <div className="bg-orange-50 px-4 py-2 border-b border-orange-100 flex justify-between items-center">
                <span className="text-xs font-bold text-orange-700 uppercase tracking-wider">Hacker News Top 5</span>
                <span className="text-[10px] text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Live</span>
            </div>

            <div className="divide-y divide-gray-100">
                {data.stories.map((story) => (
                    <a
                        key={story.id}
                        href={story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 hover:bg-gray-50 transition-colors group"
                    >
                        <h3 className="text-sm font-medium text-gray-800 group-hover:text-neuro-primary mb-1 line-clamp-2">
                            {story.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {formatTime(story.time)}
                            </span>
                            <span>by {story.by}</span>
                            <span className="flex items-center gap-1 text-orange-500">
                                <MessageSquare size={10} />
                                {story.score} pts
                            </span>
                        </div>
                    </a>
                ))}
            </div>

            <div className="bg-gray-50 px-3 py-2 text-center border-t border-gray-100">
                <a
                    href="https://news.ycombinator.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1"
                >
                    Read more on Hacker News <ExternalLink size={10} />
                </a>
            </div>
        </div>
    );
};
