import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { cn } from '../../lib/utils';

type VideoItem = {
    shortcode: string;
    title: string;
    year: string;
    featured?: boolean;
};

type VideoShowcaseProps = {
    videos: VideoItem[];
};

export default function VideoShowcase({ videos }: VideoShowcaseProps) {
    // Sort videos by year descending to ensure 2025 is first
    const sortedVideos = [...videos].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    // Filter to only get unique years (one video per year)
    const uniqueVideos = sortedVideos.reduce((acc, current) => {
        const x = acc.find(item => item.year === current.year);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, [] as VideoItem[]);

    const [activeVideo, setActiveVideo] = useState<VideoItem>(uniqueVideos[0] || videos[0]);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleVideoChange = (video: VideoItem) => {
        setActiveVideo(video);
        setIsPlaying(false); // Reset to facade when switching
    };

    return (
        <div className="group relative rounded-3xl p-2 bg-surface border border-border hover:border-brand-blue-light/30 transition-colors duration-500 shadow-xl h-full flex flex-col">
            <div className="absolute inset-0 bg-brand-blue/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-4 h-full">
                {/* Video Player / Facade */}
                <div className="rounded-2xl overflow-hidden w-full shadow-inner bg-black aspect-video relative">
                    {isPlaying ? (
                        <iframe
                            src={`https://streamable.com/e/${activeVideo.shortcode}?autoplay=1`}
                            className="absolute inset-0 w-full h-full"
                            frameBorder="0"
                            width="100%"
                            height="100%"
                            allowFullScreen
                            style={{ width: "100%", height: "100%", position: "absolute", left: 0, top: 0, overflow: "hidden" }}
                            allow="autoplay;"
                        ></iframe>
                    ) : (
                        <div
                            className="streamable-facade relative w-full h-full cursor-pointer bg-black/10 group/facade"
                            onClick={() => setIsPlaying(true)}
                        >
                            <img
                                src={`https://thumbs-east.streamable.com/image/${activeVideo.shortcode}.jpg`}
                                onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/1920x1080/000000/FFF?text=Video+Laden';
                                    e.currentTarget.onerror = null;
                                }}
                                alt={activeVideo.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/facade:scale-105"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover/facade:bg-black/10 transition-colors"></div>

                            {/* Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-transform duration-300 group-hover/facade:scale-110 shadow-xl">
                                    <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls & Metadata */}
                <div className="px-4 pb-2 flex justify-between items-center mt-auto">
                    <div>
                        <h3 className="text-xl font-display font-bold text-primary group-hover:text-brand-sky transition-colors">
                            {activeVideo.title}
                        </h3>
                        <p className="text-muted text-sm flex items-center gap-2 mt-1">
                            <Play className="w-3 h-3 text-brand-orange" />
                            Officiële Aftermovie {activeVideo.year}
                        </p>
                    </div>

                    {/* Year Selector Tabs */}
                    <div className="flex gap-2">
                        {uniqueVideos.map((video) => (
                            <button
                                key={video.year}
                                onClick={() => handleVideoChange(video)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border",
                                    activeVideo.year === video.year
                                        ? "bg-brand-orange text-white border-brand-orange shadow-md"
                                        : "bg-surface text-muted border-border hover:border-brand-orange/50 hover:text-primary"
                                )}
                            >
                                {video.year}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
