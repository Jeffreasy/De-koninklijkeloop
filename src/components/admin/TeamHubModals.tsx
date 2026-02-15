import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { AdminModal, AdminModalFooterButtons } from './AdminModal';
import { routes } from '../../lib/routeData';
import { addToast } from '../../lib/toast';
import { Flag, Play, Bus, MapPin, Coffee, Trophy, PartyPopper, Circle, HelpCircle } from 'lucide-react';
import type { Id } from '../../../convex/_generated/dataModel';

// --- Types ---

interface MinuteModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any; // strict typing would be better but keeping it flexible for now
}

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any;
}

// --- Icons Helper ---
const ICON_OPTIONS = [
    { value: 'aanvang', label: 'Aanvang', icon: Flag },
    { value: 'start', label: 'Start', icon: Play },
    { value: 'vertrek', label: 'Vertrek', icon: Bus },
    { value: 'aanwezig', label: 'Aanwezig', icon: MapPin },
    { value: 'rustpunt', label: 'Rustpunt', icon: Coffee },
    { value: 'aankomst', label: 'Aankomst', icon: Flag },
    { value: 'finish', label: 'Finish', icon: Trophy },
    { value: 'feest', label: 'Feest', icon: PartyPopper },
    { value: 'default', label: 'Overig', icon: Circle },
];

// --- MINUTE MODAL ---

export const MinuteModal = ({ isOpen, onClose, initialData }: MinuteModalProps) => {
    const createMinute = useMutation(api.team.createMinute);
    const updateMinute = useMutation(api.team.updateMinute);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<'meeting' | 'agenda' | 'other'>('meeting');
    const [status, setStatus] = useState<'concept' | 'final'>('concept');
    const [tags, setTags] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setDate(initialData.date);
                setType(initialData.type);
                setStatus(initialData.status);
                setTags(initialData.tags?.join(', ') || '');
                setContent(initialData.content);
            } else {
                // Reset for new item
                setTitle('');
                setDate(new Date().toISOString().split('T')[0]);
                setType('meeting');
                setStatus('concept');
                setTags('');
                setContent('');
            }
        }
    }, [isOpen, initialData]);

    const handleSave = async () => {
        if (!title || !content) return; // Basic validation
        setIsLoading(true);
        try {
            const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);

            if (initialData) {
                await updateMinute({
                    id: initialData._id,
                    title,
                    date,
                    type,
                    status,
                    tags: tagArray,
                    content
                });
            } else {
                await createMinute({
                    title,
                    date,
                    type,
                    status,
                    tags: tagArray,
                    content
                });
            }
            onClose();
        } catch (error) {
            if (import.meta.env.DEV) console.error("Failed to save minute:", error);
            addToast("Er is een fout opgetreden bij het opslaan.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Notule Bewerken" : "Nieuwe Notule"}
            size="2xl"
            footer={
                <AdminModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSave}
                    confirmText={initialData ? "Wijzigen" : "Aanmaken"}
                    isLoading={isLoading}
                    confirmDisabled={!title || !content}
                />
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Titel</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none"
                            placeholder="Bijv. Vergadering Bestuur"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Datum</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none"
                        >
                            <option value="meeting">Vergadering</option>
                            <option value="agenda">Agenda Punt</option>
                            <option value="other">Overig</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as any)}
                            className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none"
                        >
                            <option value="concept">Concept</option>
                            <option value="final">Definitief</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Labels (komma gescheiden)</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none"
                        placeholder="bijv. bestuur, financieel, 2026"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Inhoud (Markdown)</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none font-mono text-sm md:min-h-[300px]"
                        placeholder="# Agenda Puten\n\n1. Opening\n2. Mededelingen..."
                    />
                </div>
            </div>
        </AdminModal>
    );
};

// --- SCHEDULE MODAL ---

export const ScheduleModal = ({ isOpen, onClose, initialData }: ScheduleModalProps) => {
    const upsertScheduleItem = useMutation(api.team.upsertScheduleItem);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [time, setTime] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'logistics' | 'event' | 'break'>('event');
    const [icon, setIcon] = useState('default');
    const [routeId, setRouteId] = useState('');
    const [order, setOrder] = useState(0);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTime(initialData.time);
                setTitle(initialData.title);
                setDescription(initialData.description);
                setType(initialData.type);
                setIcon(initialData.icon);
                setRouteId(initialData.routeId || '');
                setOrder(initialData.order);
            } else {
                setTime('');
                setTitle('');
                setDescription('');
                setType('event');
                setIcon('default');
                setRouteId('');
                setOrder(0);
            }
        }
    }, [isOpen, initialData]);

    const handleSave = async () => {
        if (!time || !title) return;
        setIsLoading(true);
        try {
            await upsertScheduleItem({
                id: initialData?._id as Id<"event_schedule"> | undefined,
                time,
                title,
                description,
                type,
                icon,
                routeId: routeId || undefined,
                order: Number(order)
            });
            onClose();
        } catch (error) {
            if (import.meta.env.DEV) console.error("Failed to save schedule item:", error);
            addToast("Er is een fout opgetreden.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Item Bewerken" : "Nieuw Programma Item"}
            size="xl"
            footer={
                <AdminModalFooterButtons
                    onCancel={onClose}
                    onConfirm={handleSave}
                    confirmText={initialData ? "Wijzigen" : "Toevoegen"}
                    isLoading={isLoading}
                    confirmDisabled={!time || !title}
                />
            }
        >
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Tijd</label>
                        <input
                            type="text"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none"
                            placeholder="10:00"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-muted mb-1">Titel</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none"
                            placeholder="Start 15km"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Omschrijving</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none"
                        placeholder="Korte toelichting..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none"
                        >
                            <option value="event">Evenement</option>
                            <option value="logistics">Logistiek</option>
                            <option value="break">Pauze</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Route Koppeling (Optioneel)</label>
                        <select
                            value={routeId}
                            onChange={(e) => setRouteId(e.target.value)}
                            className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none"
                        >
                            <option value="">Geen route</option>
                            {routes.map(r => (
                                <option key={r.id} value={r.id}>{r.name} ({r.distance})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Icoon</label>
                    <div className="grid grid-cols-4 sm:grid-cols-9 gap-2">
                        {ICON_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setIcon(opt.value)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${icon === opt.value
                                    ? 'bg-brand-orange/20 border-brand-orange text-brand-orange'
                                    : 'bg-glass-bg border-glass-border text-text-muted hover:bg-glass-surface hover:text-text-primary'
                                    }`}
                                title={opt.label}
                            >
                                <opt.icon className="w-5 h-5 mb-1" />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Volgorde (Nummer)</label>
                    <input
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                        className="w-full px-4 py-2 bg-glass-bg border border-glass-border rounded-xl text-text-primary focus:ring-2 focus:ring-brand-orange/50 outline-none"
                    />
                </div>
            </div>
        </AdminModal>
    );
};
