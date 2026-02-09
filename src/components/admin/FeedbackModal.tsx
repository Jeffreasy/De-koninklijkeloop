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
                            <div className="relative p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                                <div className="absolute inset-0 bg-linear-to-r from-brand-orange/5 to-transparent pointer-events-none" />
                                <div className="relative">
                                    <h3 className="font-bold font-display text-xl text-white tracking-tight">Feedback & Ideeën</h3>
                                    <p className="text-xs text-text-muted mt-0.5 font-medium">Help ons het platform te verbeteren 🚀</p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="relative p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition-all duration-300 group"
                                >
                                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Type Selection */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Type Melding</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'bug', label: 'Bug Melden', icon: Bug, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
                                            { id: 'feature', label: 'Nieuw Idee', icon: Lightbulb, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
                                            { id: 'praise', label: 'Compliment', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setType(t.id)}
                                                className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 overflow-hidden group ${type === t.id
                                                        ? `${t.bg} ${t.border} shadow-lg ring-1 ring-inset ring-white/10`
                                                        : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10 hover:border-white/10'
                                                    }`}
                                            >
                                                {type === t.id && (
                                                    <motion.div
                                                        layoutId="activeType"
                                                        className={`absolute inset-0 ${t.bg} opacity-20`}
                                                    />
                                                )}
                                                <div className={`p-2 rounded-xl bg-black/20 backdrop-blur-sm ${type === t.id ? t.color : 'text-text-muted group-hover:text-text-body'} transition-colors`}>
                                                    <t.icon className="w-5 h-5" />
                                                </div>
                                                <span className={`text-xs font-bold ${type === t.id ? 'text-white' : 'text-text-muted group-hover:text-text-body'} transition-colors`}>
                                                    {t.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider ml-1">Jouw Bericht</label>
                                    <div className="relative group">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Beschrijf duidelijk wat je bent tegengekomen of wat je graag zou willen zien..."
                                            className="w-full h-32 px-4 py-3 rounded-2xl bg-black/20 border border-white/10 text-text-body placeholder:text-text-muted/40 focus:outline-none focus:border-brand-orange/50 focus:ring-1 focus:ring-brand-orange/50 resize-none transition-all text-sm leading-relaxed"
                                            required
                                            autoFocus
                                        />
                                        <div className="absolute inset-0 rounded-2xl bg-brand-orange/5 opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500" />
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-[10px] text-text-muted/60">
                                        Wordt verstuurd als <span className="text-text-muted font-medium">{navigator.platform}</span> gebruiker
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="px-4 py-2.5 text-sm font-medium text-text-muted hover:text-white transition-colors"
                                        >
                                            Annuleren
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !message.trim()}
                                            className="relative px-6 py-2.5 rounded-xl bg-brand-orange text-white text-sm font-bold shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40 hover:-translate-y-0.5 hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center gap-2 overflow-hidden group"
                                        >
                                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                                            <span className="relative flex items-center gap-2">
                                                {isSubmitting ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Verwerken...</>
                                                ) : (
                                                    <><MessageSquarePlus className="w-4 h-4" /> Versturen</>
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
