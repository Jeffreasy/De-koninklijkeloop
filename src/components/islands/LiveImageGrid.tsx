// src/components/islands/LiveImageGrid.tsx
import React, { useState, useEffect } from "react";

interface Image {
    src: string;
    alt: string;
    class?: string;
}

interface Props {
    images: readonly Image[] | Image[];
}

export default function LiveImageGrid({ images }: Props) {
    // We receive a pre-shuffled, expanded array from Astro (Server Side).
    // DIRECTLY slicing it ensures the hydration matches the server HTML exactly.

    const slotSize = Math.floor(images.length / 4);
    const gridSlots: Image[][] = [
        images.slice(0, slotSize),                  // Slot 0
        images.slice(slotSize, slotSize * 2),       // Slot 1
        images.slice(slotSize * 2, slotSize * 3),   // Slot 2
        images.slice(slotSize * 3),                 // Slot 3
    ];

    return (
        <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full min-h-[400px]">
            {gridSlots.map((stack, slotIndex) => (
                <FadingCell key={slotIndex} images={stack} offset={slotIndex * 2000} />
            ))}
        </div>
    );
}

// Sub-component voor één cel die animeert
function FadingCell({ images, offset }: { images: Image[]; offset: number }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Start de timer met een vertraging (offset) zodat niet alles tegelijk switcht
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, 6000); // Elke 6 seconden wisselen

            return () => clearInterval(interval);
        }, offset);

        return () => clearTimeout(timeout);
    }, [images.length, offset]);

    return (
        <div className="relative rounded-2xl overflow-hidden group border border-white/10 shadow-md bg-surface w-full h-full">
            {images.map((img, index) => (
                <div
                    key={img.src + index}
                    className={`absolute inset-0 transition-all duration-2000 ease-in-out ${index === currentIndex ? "opacity-100 scale-110" : "opacity-0 scale-100"
                        }`}
                    style={{
                        // Ken Burns effect: de actieve foto zoomt heel langzaam nog iets verder in
                        transitionProperty: "opacity, transform"
                    }}
                >
                    {/* We gebruiken hier de image direct. Zorg dat de src een volledige URL is */}
                    <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />

                    {/* Overlay Gradient (altijd zichtbaar voor leesbaarheid tekst) */}
                    <div className="absolute inset-0 bg-brand-blue/20 mix-blend-multiply" />

                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-brand-blue/90 via-brand-blue/40 to-transparent flex items-end">
                        <p className="text-white font-medium text-sm font-display tracking-wide drop-shadow-md translate-y-2 opacity-0 transition-all duration-500 delay-300"
                            style={{
                                opacity: index === currentIndex ? 1 : 0,
                                transform: index === currentIndex ? 'translateY(0)' : 'translateY(10px)'
                            }}
                        >
                            {img.alt}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}