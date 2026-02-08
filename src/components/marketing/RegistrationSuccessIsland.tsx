import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function RegistrationSuccessIsland() {
    useEffect(() => {
        // Trigger confetti on mount
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#FF9328', '#ffffff', '#3b82f6']
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#FF9328', '#ffffff', '#3b82f6']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };

        frame();

        // Big burst at start
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF9328', '#ffffff', '#3b82f6']
        });
    }, []);

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 10,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh] px-4">
            <motion.div
                className="relative w-full max-w-lg overflow-hidden glass-card"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-brand-orange to-red-500" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative p-8 md:p-10 text-center space-y-8">
                    {/* Icon */}
                    <div className="flex justify-center">
                        <motion.div
                            className="w-24 h-24 rounded-full bg-linear-to-br from-brand-orange to-red-500 flex items-center justify-center shadow-lg shadow-brand-orange/30"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        >
                            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <motion.path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                />
                            </svg>
                        </motion.div>
                    </div>

                    {/* Text */}
                    <div className="space-y-3">
                        <motion.h1
                            className="text-3xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-linear-to-r from-brand-orange to-red-500"
                            variants={itemVariants}
                        >
                            Registratie Gelukt!
                        </motion.h1>
                        <motion.p
                            className="text-text-muted text-lg leading-relaxed"
                            variants={itemVariants}
                        >
                            Bedankt voor je inschrijving. Je staat in de startblokken!
                        </motion.p>
                    </div>

                    {/* Next Steps */}
                    <motion.div
                        className="bg-accent-primary/30 rounded-xl p-6 text-left space-y-4 border border-glass-border"
                        variants={itemVariants}
                    >
                        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Volgende Stappen</h3>
                        <ul className="space-y-3">
                            {[
                                "Bevestigingsmail checken",
                                "Datum in agenda zetten",
                                "Trainen voor de loop!"
                            ].map((item, index) => (
                                <motion.li
                                    key={index}
                                    className="flex items-center gap-3 text-text-secondary"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.8 + (index * 0.1) }}
                                >
                                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 text-green-500">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span>{item}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        variants={itemVariants}
                        className="pt-4"
                    >
                        <a
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-linear-to-r from-brand-orange to-red-500 text-white font-semibold shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Terug naar Home
                        </a>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
