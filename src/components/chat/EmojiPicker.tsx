import { useState, useEffect } from 'react';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    onClose: () => void;
}

export function EmojiPickerWrapper({ onSelect, onClose }: EmojiPickerProps) {
    const [Picker, setPicker] = useState<React.ComponentType<any> | null>(null);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        Promise.all([
            import('@emoji-mart/react'),
            import('@emoji-mart/data')
        ]).then(([pickerModule, dataModule]) => {
            setPicker(() => pickerModule.default);
            setData(dataModule.default);
        });
    }, []);

    if (!Picker || !data) {
        return (
            <div className="bg-surface/95 backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-2xl flex items-center justify-center h-[350px]">
                <div className="flex flex-col items-center gap-2 text-text-muted">
                    <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Emoji's laden...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-glass-border">
            <Picker
                data={data}
                onEmojiSelect={(emoji: any) => onSelect(emoji.native)}
                theme="auto"
                locale="nl"
                previewPosition="none"
                skinTonePosition="search"
                maxFrequentRows={2}
                perLine={8}
                set="native"
                categories={['frequent', 'people', 'nature', 'foods', 'activity', 'places', 'objects', 'symbols', 'flags']}
                searchPosition="sticky"
            />
        </div>
    );
}

export { Smile as SmileIcon };
