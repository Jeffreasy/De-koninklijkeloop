export type AudioTrack = {
    title: string;
    url: string;
    duration: string;
    date: string;
    description?: string;
};

export const audioTracks: AudioTrack[] = [
    {
        title: "Sfeerimpressie & Interviews 2025",
        url: "https://ik.imagekit.io/a0oim4e3e/De%20Koninklijkeloop/webassets/DKLRTV2025_dpdydc.wav",
        duration: "14:53",
        date: "17 Mei 2025",
        description: "Een terugblik op de finish met deelnemers en vrijwilligers."
    },
    {
        title: "De Start van de Koninklijke Loop",
        url: "https://ik.imagekit.io/a0oim4e3e/De%20Koninklijkeloop/webassets/matinee_1_nbm0ph.wav",
        duration: "16:41",
        date: "17 Mei 2025",
        description: "Het startschot, de muziek en de eerste kilometers."
    }
];
