import React from 'react';
import { Clock, MapPin, Tv } from 'lucide-react';

interface Team {
    name: string;
    abbr: string;
    score: string;
    logo?: string;
}

interface GameData {
    gameId: string;
    home: string;
    homeAbbr: string;
    homeScore: string;
    away: string;
    awayAbbr: string;
    awayScore: string;
    status: string;
    state: string; // 'pre', 'in', 'post'
    clock: string;
    period: number;
    venue?: string;
    broadcast?: string;
}

interface ScoreCardProps {
    data: {
        games?: GameData[];
        gameId?: string;
        [key: string]: any;
    };
}

const GameItem: React.FC<{ game: GameData }> = ({ game }) => {
    const isLive = game.state === 'in';
    const isFinal = game.state === 'post';

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm mb-2 w-full max-w-xs">
            {/* Header */}
            <div className="flex justify-between items-center mb-3 text-xs">
                <div className="flex items-center gap-1">
                    {isLive && (
                        <span className="flex h-2 w-2 relative mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                    )}
                    <span className={`font-medium ${isLive ? 'text-red-600' : 'text-gray-500'}`}>
                        {game.status}
                    </span>
                    {isLive && <span className="text-gray-400">• {game.clock}</span>}
                </div>
                {game.broadcast && (
                    <div className="flex items-center gap-1 text-gray-400">
                        <Tv size={10} />
                        <span>{game.broadcast}</span>
                    </div>
                )}
            </div>

            {/* Teams & Scores */}
            <div className="flex flex-col gap-2">
                {/* Away Team */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 text-lg w-8">{game.awayAbbr}</span>
                        <span className="text-sm text-gray-600 truncate max-w-[100px]">{game.away}</span>
                    </div>
                    <span className={`text-xl font-mono ${parseInt(game.awayScore) > parseInt(game.homeScore) ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                        {game.awayScore}
                    </span>
                </div>

                {/* Home Team */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 text-lg w-8">{game.homeAbbr}</span>
                        <span className="text-sm text-gray-600 truncate max-w-[100px]">{game.home}</span>
                    </div>
                    <span className={`text-xl font-mono ${parseInt(game.homeScore) > parseInt(game.awayScore) ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                        {game.homeScore}
                    </span>
                </div>
            </div>

            {/* Footer */}
            {game.venue && (
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1 text-[10px] text-gray-400">
                    <MapPin size={10} />
                    <span>{game.venue}</span>
                </div>
            )}
        </div>
    );
};

export const ScoreCard: React.FC<ScoreCardProps> = ({ data }) => {
    // Handle list of games
    if (data.games && Array.isArray(data.games)) {
        return (
            <div className="flex flex-col gap-2 w-full">
                <div className="text-xs text-gray-500 mb-1 font-medium">
                    {data.games.length} Games {data.date === 'today' ? 'Today' : `on ${data.date}`}
                </div>
                <div className="grid grid-cols-1 gap-2">
                    {data.games.map((game) => (
                        <GameItem key={game.gameId} game={game} />
                    ))}
                </div>
            </div>
        );
    }

    // Handle single game
    if (data.gameId || data.home) {
        // If data is the game object itself (merged properties)
        const game = data as unknown as GameData;
        return <GameItem game={game} />;
    }

    return null;
};
