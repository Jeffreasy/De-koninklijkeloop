import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import type { FAQCategory } from "../../data/faqData";

interface FAQAccordionProps {
    items: FAQCategory[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
    const [openId, setOpenId] = useState<string | null>(null);

    const toggleItem = (questionId: number) => {
        const id = `${activeCategoryIndex}-${questionId}`;
        setOpenId(openId === id ? null : id);
    };

    const activeCategory = items[activeCategoryIndex];

    return (
        <div className="flex flex-col md:grid md:grid-cols-12 gap-8">

            {/* Navigation (Mobile: Horizontal Scroll, Desktop: Vertical Sidebar) */}
            <div className="md:col-span-4">
                {/* Mobile Label */}
                <div className="md:hidden mb-4 text-xs font-bold text-muted uppercase tracking-widest pl-1" id="faq-cat-label">
                    Kies een onderwerp
                </div>

                <div
                    className="flex md:flex-col gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide snap-x px-1"
                    role="tablist"
                    aria-label="FAQ Categorieën"
                    aria-labelledby="faq-cat-label"
                >
                    {items.map((category, index) => {
                        const isActive = activeCategoryIndex === index;
                        return (
                            <button
                                key={index}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`faq-panel-${index}`}
                                id={`faq-tab-${index}`}
                                onClick={() => {
                                    setActiveCategoryIndex(index);
                                    setOpenId(null); // Reset open question when switching
                                }}
                                className={cn(
                                    "relative flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-500 min-w-[85%] md:min-w-0 snap-center text-left group border focus:outline-none focus:ring-2 focus:ring-brand-orange/50",
                                    isActive
                                        ? "bg-[linear-gradient(135deg,var(--color-brand-orange)_0%,#fbbf24_100%)] text-white border-brand-orange shadow-lg shadow-brand-orange/20 scale-[1.02]"
                                        : "bg-surface/40 md:bg-transparent border-white/5 hover:bg-surface/50 hover:border-white/10 text-secondary hover:text-primary"
                                )}
                            >
                                <span className={cn(
                                    "text-2xl shrink-0 transition-transform duration-500",
                                    isActive ? "scale-110 drop-shadow-md" : "group-hover:scale-110 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
                                )}>{category.icon}</span>

                                <span className={cn(
                                    "font-display font-medium tracking-wide truncate",
                                    isActive ? "text-white" : "text-secondary group-hover:text-primary"
                                )}>
                                    {category.title}
                                </span>

                                {isActive && (
                                    <div className="hidden md:block absolute right-4 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="md:col-span-8 min-h-[500px]">
                <div
                    key={activeCategoryIndex}
                    role="tabpanel"
                    id={`faq-panel-${activeCategoryIndex}`}
                    aria-labelledby={`faq-tab-${activeCategoryIndex}`}
                    className="premium-glass rounded-3xl p-6 md:p-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
                >

                    {/* Active Category Title (Mobile Only context) */}
                    <div className="mb-8 md:hidden flex items-center gap-3 border-b border-white/5 pb-4">
                        <span className="text-3xl filter drop-shadow-lg">{activeCategory.icon}</span>
                        <h3 className="text-2xl font-display font-bold text-primary tracking-tight">{activeCategory.title}</h3>
                    </div>

                    <div className="space-y-4">
                        {activeCategory.questions.map((item, qIndex) => {
                            const isOpen = openId === `${activeCategoryIndex}-${qIndex}`;

                            return (
                                <div
                                    key={qIndex}
                                    className={cn(
                                        "rounded-2xl border transition-all duration-500 overflow-hidden group/item",
                                        isOpen
                                            ? "bg-brand-blue-light/10 border-brand-orange/40 shadow-lg shadow-brand-orange/5"
                                            : "bg-white/2 border-white/5 hover:border-white/10 hover:bg-white/5"
                                    )}
                                >
                                    <h3>
                                        <button
                                            aria-expanded={isOpen}
                                            aria-controls={`faq-answer-${qIndex}`}
                                            id={`faq-trigger-${qIndex}`}
                                            onClick={() => toggleItem(qIndex)}
                                            className="w-full px-5 py-5 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-brand-orange/50 rounded-2xl"
                                        >
                                            <div className="flex items-center gap-4 pr-4">
                                                <span className={cn(
                                                    "text-xl transition-all duration-500",
                                                    isOpen ? "opacity-100 scale-110" : "opacity-50 grayscale group-hover/item:opacity-100 group-hover/item:grayscale-0"
                                                )}>
                                                    {item.icon}
                                                </span>
                                                <span className={cn(
                                                    "text-lg font-medium transition-colors duration-300",
                                                    isOpen ? "text-brand-orange drop-shadow-sm" : "text-primary group-hover/item:text-white"
                                                )}>
                                                    {item.question}
                                                </span>
                                            </div>
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shrink-0",
                                                isOpen ? "bg-brand-orange/20 text-brand-orange rotate-180" : "bg-white/5 text-secondary group-hover/item:bg-white/10"
                                            )}>
                                                <ChevronDown className="w-5 h-5" />
                                            </div>
                                        </button>
                                    </h3>

                                    <div
                                        id={`faq-answer-${qIndex}`}
                                        role="region"
                                        aria-labelledby={`faq-trigger-${qIndex}`}
                                        className={cn(
                                            "transition-all duration-500 ease-in-out overflow-hidden",
                                            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                        )}
                                    >
                                        <div className="px-5 pb-8 pt-0 pl-16 md:pl-18">
                                            <p className="text-secondary text-base leading-relaxed max-w-2xl">
                                                {item.answer}
                                            </p>

                                            {item.action && (() => {
                                                const text = item.actionText?.toLowerCase() ?? "";
                                                const href = text.includes("doneer")
                                                    ? "https://gofund.me/e7950f1c7"
                                                    : text.includes("voorwaarden")
                                                        ? "/voorwaarden"
                                                        : text.includes("inschrijven")
                                                            ? "/register"
                                                            : "/contact";
                                                const isExternal = href.startsWith("http");
                                                return (
                                                    <a
                                                        href={href}
                                                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                                        onClick={() => {
                                                            if (text.includes("doneer")) {
                                                                import("../../lib/analytics").then(({ trackDonationIntent }) => {
                                                                    trackDonationIntent("faq-action");
                                                                });
                                                            }
                                                        }}
                                                        className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-white bg-brand-orange hover:bg-orange-400 px-5 py-2.5 rounded-lg shadow-lg shadow-brand-orange/20 transition-all hover:scale-105 active:scale-95 focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange"
                                                    >
                                                        {item.actionText}
                                                        <ArrowRight className="w-4 h-4" />
                                                    </a>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

        </div>
    );
}
