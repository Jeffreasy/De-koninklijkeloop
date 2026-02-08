import { useStore } from '@nanostores/react';
import { $toasts, dismissToast } from '../../lib/toast';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ToastContainer() {
    const toasts = useStore($toasts);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className={`
                            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md min-w-[300px] max-w-sm
                            ${toast.type === 'success' ? 'bg-success/10 border-success/20 text-success' : ''}
                            ${toast.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' : ''}
                            ${toast.type === 'warning' ? 'bg-warning/10 border-warning/20 text-warning' : ''}
                            ${toast.type === 'info' ? 'bg-glass-bg/80 border-glass-border text-text-primary' : ''}
                        `}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
                        {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}

                        <p className="text-sm font-medium flex-1">{toast.message}</p>

                        <button
                            onClick={() => dismissToast(toast.id)}
                            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 opacity-70" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
