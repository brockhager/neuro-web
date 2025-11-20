import React from 'react';
import { Globe, Clock, ExternalLink } from 'lucide-react';

interface Source {
    name: string;
    url: string;
}

interface Story {
    title: string;
    summary: string;
    time: string;
    sources: Source[];
}

interface NewsAggregatorCardProps {
    data: Story[];
}

const formatTime = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // minutes

        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    } catch (e) {
        return 'Recent';
    }
};

export const NewsAggregatorCard: React.FC<NewsAggregatorCardProps> = ({ data }) => {
    if (!data || !Array.isArray(data)) return null;

    return (
        <div className="w-full max-w-md flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                <Globe size={12} />
                <span>Global Headlines</span>
            </div>

            {data.map((story, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight">
                        {story.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {story.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mr-2">
                            <Clock size={10} />
                            <span>{formatTime(story.time)}</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                            {story.sources.slice(0, 4).map((source, sIdx) => (
                                <a
                                    key={sIdx}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full hover:bg-neuro-primary hover:text-white transition-colors flex items-center gap-1"
                                >
                                    {source.name}
                                    <ExternalLink size={8} />
                                </a>
                            ))}
                            {story.sources.length > 4 && (
                                <span className="text-[10px] text-gray-400 px-1">
                                    +{story.sources.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
