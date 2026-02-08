import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ConvexClientProvider } from "../islands/ConvexClientProvider";
import { Heart, Calendar, ArrowDown, ExternalLink } from "lucide-react";

function DonationWidgetContent() {
    const activeCampaign = useQuery(api.donations.getActiveCampaign);

    if (activeCampaign === undefined) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-brand-orange/20 border-t-brand-orange animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                        <Heart className="w-6 h-6 text-brand-orange" />
                    </div>
                </div>
            </div>
        );
    }

    if (activeCampaign === null) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] text-center p-8 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl border border-dashed border-white/10 group-hover:border-white/20 transition-colors"></div>

                <div className="relative z-10">
                    <div className="w-20 h-20 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-black/50">
                        <Heart className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 font-display tracking-wide">Geen Actieve Campagne</h3>
                    <p className="text-gray-400 max-w-sm mx-auto mb-8 leading-relaxed">
                        Er is momenteel geen inzamelingsactie actief.
                        <br />Selecteer of maak een nieuwe campagne in het beheerpaneel.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-brand-orange text-sm font-bold uppercase tracking-wider animate-bounce">
                        <ArrowDown className="w-4 h-4" />
                        <span>Kijk hiernaast</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white font-display tracking-tight text-shadow-sm">
                            {activeCampaign.title}
                        </h2>
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold border border-brand-orange/20 shadow-[0_0_15px_rgba(255,147,40,0.15)] backdrop-blur-md">
                            <Calendar className="w-3.5 h-3.5" />
                            {activeCampaign.year}
                        </span>
                    </div>

                    {activeCampaign.description && (
                        <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
                            {activeCampaign.description}
                        </p>
                    )}
                </div>

                <a
                    href={activeCampaign.gofundme_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 group"
                >
                    <span>Bekijk op GoFundMe</span>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
            </div>

            <div className="flex-1 relative group">
                {/* Glassmorphic Container */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"></div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none opacity-50 group-hover:opacity-75 transition-opacity duration-700"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none opacity-30"></div>

                <div className="relative h-full min-h-[550px] p-4 md:p-8 flex justify-center items-start overflow-hidden rounded-3xl">
                    {/* The Widget Wrapper */}
                    <div className="w-full max-w-[500px] bg-white rounded-2xl shadow-2xl shadow-black/80 overflow-hidden transform transition-transform duration-500 hover:scale-[1.005]">
                        {/* Header Bar simulation for authenticity */}
                        <div className="h-2 w-full bg-gradient-to-r from-[#00b964] via-[#00b964] to-[#00a055]"></div>

                        <iframe
                            src={activeCampaign.gofundme_url.replace('/widget/large', '/widget/medium')}
                            width="100%"
                            height="550px"
                            frameBorder="0"
                            title="GoFundMe Donatie Widget"
                            className="w-full bg-white"
                            scrolling="no"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DonationWidgetIsland() {
    return (
        <ConvexClientProvider>
            <DonationWidgetContent />
        </ConvexClientProvider>
    );
}
