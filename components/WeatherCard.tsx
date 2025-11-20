import React from 'react';
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, MapPin } from 'lucide-react';

interface WeatherData {
    location: string;
    current: {
        temp: number;
        feelsLike: number;
        humidity: number;
        windSpeed: number;
        conditionCode: number;
        isDay: number;
    };
    daily: {
        max: number;
        min: number;
        conditionCode: number;
    };
    units: {
        temperature_2m: string;
        wind_speed_10m: string;
    };
}

interface WeatherCardProps {
    data: WeatherData;
}

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
const getWeatherIcon = (code: number, isDay: number) => {
    if (code === 0) return <Sun className={isDay ? "text-yellow-500" : "text-blue-300"} size={48} />;
    if (code >= 1 && code <= 3) return <Cloud className="text-gray-400" size={48} />;
    if (code >= 45 && code <= 48) return <Cloud className="text-gray-500" size={48} />;
    if (code >= 51 && code <= 67) return <CloudRain className="text-blue-400" size={48} />;
    if (code >= 71 && code <= 77) return <CloudSnow className="text-blue-200" size={48} />;
    if (code >= 80 && code <= 82) return <CloudRain className="text-blue-500" size={48} />;
    if (code >= 85 && code <= 86) return <CloudSnow className="text-blue-300" size={48} />;
    if (code >= 95) return <CloudLightning className="text-purple-500" size={48} />;
    return <Sun className="text-yellow-500" size={48} />;
};

const getWeatherDescription = (code: number) => {
    const codes: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
        45: 'Fog', 48: 'Depositing rime fog',
        51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
        61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
        71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
        95: 'Thunderstorm'
    };
    return codes[code] || 'Unknown';
};

export const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
    if (!data || !data.current) return null;

    return (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg w-full max-w-xs">
            {/* Header */}
            <div className="flex items-center gap-1 text-blue-100 text-sm mb-4">
                <MapPin size={14} />
                <span className="font-medium truncate">{data.location}</span>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="text-5xl font-bold tracking-tighter">
                        {Math.round(data.current.temp)}°
                    </div>
                    <div className="text-blue-100 font-medium mt-1">
                        {getWeatherDescription(data.current.conditionCode)}
                    </div>
                </div>
                <div className="animate-pulse-slow">
                    {getWeatherIcon(data.current.conditionCode, data.current.isDay)}
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Wind size={16} className="text-blue-200" />
                    <div>
                        <div className="text-[10px] text-blue-200 uppercase">Wind</div>
                        <div className="text-sm font-semibold">{data.current.windSpeed} {data.units.wind_speed_10m}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-blue-200" />
                    <div>
                        <div className="text-[10px] text-blue-200 uppercase">Humidity</div>
                        <div className="text-sm font-semibold">{data.current.humidity}%</div>
                    </div>
                </div>
            </div>

            {/* Forecast Mini */}
            <div className="mt-3 flex justify-between text-xs text-blue-100 px-1">
                <span>H: {Math.round(data.daily.max)}°</span>
                <span>L: {Math.round(data.daily.min)}°</span>
            </div>
        </div>
    );
};
