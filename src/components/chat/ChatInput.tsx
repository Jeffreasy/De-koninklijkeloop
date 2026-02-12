import { Send, Smile } from 'lucide-react';
import { EmojiPickerWrapper } from './EmojiPicker';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    showEmojiPicker: boolean;
    onToggleEmoji: () => void;
    onEmojiSelect: (emoji: string) => void;
}

export function ChatInput({ value, onChange, onSend, showEmojiPicker, onToggleEmoji, onEmojiSelect }: ChatInputProps) {
    return (
        <div className="p-3 border-t border-glass-border bg-surface/95 backdrop-blur-md shrink-0 relative pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {showEmojiPicker && (
                <div className="absolute bottom-full left-0 right-0 mb-2 px-2 z-20 max-h-[50vh] overflow-hidden">
                    <EmojiPickerWrapper onSelect={onEmojiSelect} onClose={onToggleEmoji} />
                </div>
            )}

            <div className="relative flex gap-2 items-end bg-glass-surface/30 p-1.5 rounded-2xl border border-glass-border focus-within:border-brand-orange/50 focus-within:ring-1 focus-within:ring-brand-orange/50 transition-all">
                <button
                    onClick={onToggleEmoji}
                    className={`p-2 rounded-xl transition-colors cursor-pointer touch-action-manipulation ${showEmojiPicker ? 'bg-brand-orange/20 text-brand-orange' : 'text-text-muted hover:text-text-primary hover:bg-glass-surface'}`}
                >
                    <Smile className="w-5 h-5" />
                </button>
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
                        }
                    }}
                    placeholder="Typ een bericht..."
                    className="flex-1 bg-transparent border-none px-2 py-2.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none resize-none max-h-24 min-h-[44px]"
                    rows={1}
                />
                <button
                    onClick={onSend}
                    disabled={!value.trim()}
                    className="p-2.5 bg-brand-orange text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 mb-0.5 mr-0.5 cursor-pointer touch-action-manipulation"
                >
                    <Send className="w-4 h-4 fill-current" />
                </button>
            </div>
        </div>
    );
}
