import { useState, useEffect } from 'react';
import { useMutation, ConvexProvider, ConvexReactClient } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
    MessageSquarePlus,
    X,
    Loader2,
    CheckCircle2,
    Bug,
    Lightbulb,
    Heart,
    HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
    convexUrl?: string; // Optional to prevent crash if missing, but should be required logic-wise
}

export default function FeedbackModal({ convexUrl }: Props) {
    const [convexClient, setConvexClient] = useState<ConvexReactClient | null>(null);

    useEffect(() => {
        if (convexUrl) {
            setConvexClient(new ConvexReactClient(convexUrl));
        }
    }, [convexUrl]);

    if (!convexClient) return null;

    return (
        <ConvexProvider client={convexClient}>
            <FeedbackModalContent />
        </ConvexProvider>
    );
}

function FeedbackModalContent() {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState('bug');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const submitFeedback = useMutation(api.feedback.submit);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);

        try {
            await submitFeedback({
                type,
                message,
                metadata: {
                    url: window.location.pathname,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }
            });

            // Optimistic UI: Show success immediately
            setShowSuccess(true);
            setMessage('');

            // Auto close after 2 seconds
            setTimeout(() => {
                setShowSuccess(false);
                setIsOpen(false);
            }, 2000);

        } catch (error) {
            console.error("Feedback submission failed:", error);
            // Ideally show error toast here
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeIcon = (t: string) => {
        switch (t) {
            case 'bug': return <Bug className="w-4 h-4" />;
            case 'feature': return <Lightbulb className="w-4 h-4" />;
            case 'praise': return <Heart className="w-4 h-4" />;
            default: return <HelpCircle className="w-4 h-4" />;
        }
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-brand-orange text-white shadow-lg shadow-brand-orange/30 hover:shadow-brand-orange/50 hover:scale-105 transition-all duration-300 group"
                whileHover={{ rotate: 15 }}
                whileTap={{ scale: 0.9 }}
            >
                <MessageSquarePlus className="w-6 h-6" />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-surface/90 backdrop-blur-md text-text-body text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border pointer-events-none">
                    Feedback & Bugs
                </span>
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ y: 100, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-md bg-surface/95 backdrop-blur-xl border border-glass-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Success State Overlay */}
                            <AnimatePresence>
                                {showSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-surface/95 backdrop-blur-xl"
                                    >
                                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 text-green-500">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold text-text-body">Bedankt!</h3>
                                        <p className="text-text-muted">Je feedback is ontvangen.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Header */}
                            <div className="p-5 border-b border-border flex items-center justify-between bg-surface/50">
                                <div>
                                    <h3 className="font-bold text-lg text-text-body">Feedback Sturen</h3>
                                    <p className="text-xs text-text-muted">Help ons het platform te verbeteren.</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg hover:bg-black/5 text-text-muted hover:text-text-body transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                {/* Type Selection */}
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'bug', label: 'Bug', icon: Bug },
                                        { id: 'feature', label: 'Idee', icon: Lightbulb },
                                        { id: 'praise', label: 'Top!', icon: Heart }
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setType(t.id)}
                                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${type === t.id
                                                ? 'bg-brand-orange/10 border-brand-orange text-brand-orange'
                                                : 'bg-surface border-border text-text-muted hover:border-brand-orange/50 hover:bg-surface/80'
                                                }`}
                                        >
                                            <t.icon className="w-5 h-5" />
                                            <span className="text-xs font-medium">{t.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Message */}
                                <div className="space-y-2">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Beschrijf je feedback, bug of idee..."
                                        className="w-full h-32 px-4 py-3 rounded-xl bg-surface/50 border border-border focus:border-brand-orange focus:ring-1 focus:ring-brand-orange/50 placeholder:text-text-muted/50 resize-none transition-all text-sm"
                                        required
                                        autoFocus
                                    />
                                </div>

                                {/* Footer Actions */}
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-body transition-colors"
                                    >
                                        Annuleren
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !message.trim()}
                                        className="px-6 py-2 rounded-xl bg-brand-orange text-white text-sm font-medium shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Verwerken...
                                            </>
                                        ) : (
                                            'Versturen'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
