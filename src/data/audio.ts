export type AudioTrack = {
    title: string;
    url: string; // Cloudinary URL or Public ID
    duration: string;
    date: string;
    description?: string;
};

export const audioTracks: AudioTrack[] = [
    {
        title: "Sfeerimpressie & Interviews 2025",
        url: "https://res.cloudinary.com/dgfuv7wif/video/upload/v1747733438/DKLRTV2025_dpdydc.wav", // Placeholder
        duration: "14:53",
        date: "17 Mei 2025",
        description: "Een terugblik op de finish met deelnemers en vrijwilligers."
    },
    {
        title: "De Start van de Koninklijke Loop",
        url: "https://res.cloudinary.com/dgfuv7wif/video/upload/v1744140908/matinee_1_nbm0ph.wav", // Placeholder
        duration: "16:41",
        date: "17 Mei 2025",
        description: "Het startschot, de muziek en de eerste kilometers."
    }
];
