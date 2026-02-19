import { Flag, Play, Bus, MapPin, Coffee, Trophy, PartyPopper, Circle } from 'lucide-react';

/**
 * Shared icon resolver for schedule items.
 * Used by both ProgrammaSchedule (public) and EventSchedule (admin).
 */
export const getScheduleIcon = (iconName: string, className: string = "w-5 h-5") => {
    switch (iconName) {
        case 'aanvang': return <Flag className={className} />;
        case 'start': return <Play className={className} />;
        case 'vertrek': return <Bus className={className} />;
        case 'aanwezig': return <MapPin className={className} />;
        case 'rustpunt': return <Coffee className={className} />;
        case 'aankomst': return <Flag className={className} />;
        case 'finish': return <Trophy className={className} />;
        case 'feest': return <PartyPopper className={className} />;
        default: return <Circle className={className} />;
    }
};
