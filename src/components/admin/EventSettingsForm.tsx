import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from 'react';
import { useStore } from "@nanostores/react";
import { $accessToken } from "../../lib/auth";

export default function EventSettingsForm() {
    const settings = useQuery(api.eventSettings.getActiveSettings);
    const updateSettings = useMutation(api.eventSettings.updateSettings);
    const accessToken = useStore($accessToken);

    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        event_date: '',
        event_date_display: '',
        registration_open: true,
        location_city: '',
        start_location: '',
        finish_location: '',
        max_participants: 500,
        hero_video_id: '',
        contact_email: '',
    });

    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Hydrate form when settings load
    useEffect(() => {
        if (settings) {
            setFormData({
                name: settings.name || '',
                tagline: settings.tagline || '',
                event_date: settings.event_date || '',
                event_date_display: settings.event_date_display || '',
                registration_open: settings.registration_open ?? true,
                location_city: settings.location_city || '',
                start_location: settings.start_location || '',
                finish_location: settings.finish_location || '',
                max_participants: settings.max_participants || 500,
                hero_video_id: settings.hero_video_id || '',
                contact_email: settings.contact_email || '',
            });
        }
    }, [settings]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setStatus(null);

        try {
            if (!accessToken) {
                throw new Error("Niet geautoriseerd");
            }

            await updateSettings({
                ...formData,
                token: accessToken
            });

            setStatus({ type: 'success', message: 'Instellingen opgeslagen!' });
        } catch (error) {
            console.error("Error saving settings:", error);
            setStatus({
                type: 'error',
                message: error instanceof Error ? error.message : 'Kon instellingen niet opslaan'
            });
        } finally {
            setSaving(false);
        }
    };

    if (!settings) {
        return (
            <div className="premium-glass rounded-3xl p-8">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
                    <span className="ml-3 text-text-secondary">Laden...</span>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Message */}
            {status && (
                <div className={`p-4 rounded-xl ${status.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {status.message}
                </div>
            )}

            {/* Evenement Info */}
            <div className="premium-glass rounded-3xl p-6">
                <h2 className="text-lg font-semibold mb-4 text-text-primary">Evenement Gegevens</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Evenement Naam
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none"
                            placeholder="De Koninklijke Loop 2026"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Tagline
                        </label>
                        <input
                            type="text"
                            value={formData.tagline}
                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none"
                            placeholder="Samen maken we het verschil"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Evenement Datum (ISO)
                        </label>
                        <input
                            type="date"
                            value={formData.event_date}
                            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Datum (Display Tekst)
                        </label>
                        <input
                            type="text"
                            value={formData.event_date_display}
                            onChange={(e) => setFormData({ ...formData, event_date_display: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none"
                            placeholder="zaterdag 16 mei 2026"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.registration_open}
                            onChange={(e) => setFormData({ ...formData, registration_open: e.target.checked })}
                            className="w-4 h-4 rounded border-glass-border bg-glass-bg/50 text-accent-primary focus:ring-2 focus:ring-accent-primary/50"
                        />
                        <span className="text-sm text-text-secondary">Registratie open</span>
                    </label>
                </div>
            </div>

            {/* Locatie */}
            <div className="premium-glass rounded-3xl p-6">
                <h2 className="text-lg font-semibold mb-4 text-text-primary">Locatie</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Stad
                        </label>
                        <input
                            type="text"
                            value={formData.location_city}
                            onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none"
                            placeholder="Apeldoorn"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Start Locatie
                        </label>
                        <input
                            type="text"
                            value={formData.start_location}
                            onChange={(e) => setFormData({ ...formData, start_location: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none"
                            placeholder="Kootwijk"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Finish Locatie
                        </label>
                        <input
                            type="text"
                            value={formData.finish_location}
                            onChange={(e) => setFormData({ ...formData, finish_location: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none"
                            placeholder="Grote Kerk, Apeldoorn"
                        />
                    </div>
                </div>
            </div>

            {/* Media & Contact */}
            <div className="premium-glass rounded-3xl p-6">
                <h2 className="text-lg font-semibold mb-4 text-text-primary">Media & Contact</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Hero Video ID (Streamable)
                        </label>
                        <input
                            type="text"
                            value={formData.hero_video_id}
                            onChange={(e) => setFormData({ ...formData, hero_video_id: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none"
                            placeholder="tt6k80"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Contact Email
                        </label>
                        <input
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none"
                            placeholder="info@dekoninklijkeloop.nl"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Max Deelnemers
                        </label>
                        <input
                            type="number"
                            value={formData.max_participants}
                            onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 bg-glass-bg/50 border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-accent-primary/50 focus:outline-none"
                            placeholder="500"
                        />
                    </div>

                    <div className="flex items-end">
                        <div className="w-full px-4 py-2 bg-glass-bg/30 border border-glass-border rounded-xl text-text-secondary">
                            Huidige deelnemers: <strong className="text-text-primary">{settings.current_participants}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving || !accessToken}
                    className="px-8 py-3 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? "Opslaan..." : "Instellingen Opslaan"}
                </button>
            </div>
        </form>
    );
}
