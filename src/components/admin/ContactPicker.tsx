import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { X, Search, Users, Building2, ChevronDown } from 'lucide-react';
import { SECTORS, REGIOS } from "../../lib/prConstants";

/** A selected recipient – either from Convex DB or typed manually */
export interface Recipient {
    email: string;
    naam?: string | null;
    organizationNaam?: string | null;
    organizationSector?: string | null;
    isManual?: boolean;
}

interface ContactPickerProps {
    recipients: Recipient[];
    onChange: (recipients: Recipient[]) => void;
    disabled?: boolean;
    id?: string;
}

export default function ContactPicker({ recipients, onChange, disabled, id }: ContactPickerProps) {
    const [search, setSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showGroupSelector, setShowGroupSelector] = useState(false);
    const [selectedSector, setSelectedSector] = useState<string | undefined>();
    const [selectedRegio, setSelectedRegio] = useState<string | undefined>();
    const inputRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Debounced search for Convex query
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 250);
        return () => clearTimeout(timer);
    }, [search]);

    // Query contacts from Convex (only when dropdown is open and there's a search)
    const contacts = useQuery(
        api.prCommunicatie.listContacts,
        showDropdown && debouncedSearch.length >= 2
            ? { search: debouncedSearch, activeOnly: true }
            : "skip"
    );

    // Query contacts for group selector
    const groupContacts = useQuery(
        api.prCommunicatie.listContacts,
        showGroupSelector && (selectedSector || selectedRegio)
            ? {
                sector: selectedSector as any,
                regio: selectedRegio as any,
                activeOnly: true,
            }
            : "skip"
    );

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Already-selected emails set (memoized to prevent useCallback invalidation)
    const selectedEmails = useMemo(
        () => new Set(recipients.map(r => r.email.toLowerCase())),
        [recipients]
    );

    // Filter out already-selected contacts
    const availableContacts = (contacts ?? []).filter(
        c => !selectedEmails.has(c.email.toLowerCase())
    );

    // Active index for keyboard navigation
    const [activeIndex, setActiveIndex] = useState(-1);

    // Reset active index when dropdown contacts change
    useEffect(() => { setActiveIndex(-1); }, [availableContacts.length]);

    const addRecipient = useCallback((r: Recipient) => {
        if (!selectedEmails.has(r.email.toLowerCase())) {
            onChange([...recipients, r]);
        }
        setSearch('');
        setShowDropdown(false);
        setActiveIndex(-1);
        inputRef.current?.focus();
    }, [recipients, onChange, selectedEmails]);

    const removeRecipient = useCallback((email: string) => {
        onChange(recipients.filter(r => r.email.toLowerCase() !== email.toLowerCase()));
    }, [recipients, onChange]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < availableContacts.length) {
                const c = availableContacts[activeIndex];
                addRecipient({ email: c.email, naam: c.naam, organizationNaam: c.organizationNaam, organizationSector: c.organizationSector });
            } else if (search.includes('@') && search.includes('.')) {
                addRecipient({ email: search.trim(), isManual: true });
            }
        }
        if (e.key === 'Backspace' && search === '' && recipients.length > 0) {
            removeRecipient(recipients[recipients.length - 1].email);
        }
        if (e.key === 'ArrowDown' && showDropdown && availableContacts.length > 0) {
            e.preventDefault();
            setActiveIndex(prev => Math.min(prev + 1, availableContacts.length - 1));
        }
        if (e.key === 'ArrowUp' && showDropdown) {
            e.preventDefault();
            setActiveIndex(prev => Math.max(prev - 1, 0));
        }
        if (e.key === 'Escape') {
            setShowDropdown(false);
            setShowGroupSelector(false);
            setActiveIndex(-1);
        }
    };

    // Add entire group
    const handleAddGroup = () => {
        if (!groupContacts?.length) return;
        const newRecipients = groupContacts
            .filter(c => !selectedEmails.has(c.email.toLowerCase()))
            .map(c => ({
                email: c.email,
                naam: c.naam,
                organizationNaam: c.organizationNaam,
                organizationSector: c.organizationSector,
            }));
        onChange([...recipients, ...newRecipients]);
        setShowGroupSelector(false);
        setSelectedSector(undefined);
        setSelectedRegio(undefined);
    };

    // Sector badge color
    const sectorColor = (sector?: string | null) => {
        switch (sector) {
            case 'academisch_ziekenhuis': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'algemeen_ziekenhuis': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
            case 'ggz': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'gehandicaptenzorg': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
            case 'verpleging_verzorging': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
            case 'revalidatie': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
            default: return 'bg-glass-border/50 text-text-muted border-glass-border';
        }
    };

    return (
        <div ref={wrapperRef} className="relative flex-1">
            {/* Chip container + input */}
            <div
                className="flex flex-wrap items-center gap-1.5 min-h-[36px] cursor-text"
                onClick={() => inputRef.current?.focus()}
            >
                {/* Recipient chips */}
                {recipients.map(r => (
                    <span
                        key={r.email}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${sectorColor(r.organizationSector)}`}
                        title={r.organizationNaam ? `${r.naam || r.email} — ${r.organizationNaam}` : r.email}
                    >
                        <span className="max-w-[160px] truncate">
                            {r.naam || r.email}
                        </span>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeRecipient(r.email); }}
                                className="p-0.5 hover:bg-white/10 rounded transition-colors cursor-pointer"
                                aria-label={`${r.naam || r.email} verwijderen`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </span>
                ))}

                {/* Search input */}
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
                    onFocus={() => { if (search.length >= 2) setShowDropdown(true); }}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none py-1"
                    placeholder={recipients.length === 0 ? 'Zoek contact of typ email...' : 'Voeg toe...'}
                    disabled={disabled}
                    autoComplete="off"
                    aria-label="Zoek contacten of typ emailadres"
                    role="combobox"
                    aria-expanded={showDropdown && debouncedSearch.length >= 2}
                    aria-controls="contact-picker-listbox"
                    aria-activedescendant={activeIndex >= 0 ? `contact-option-${activeIndex}` : undefined}
                />

                {/* Group selector toggle */}
                <button
                    type="button"
                    onClick={() => { setShowGroupSelector(!showGroupSelector); setShowDropdown(false); }}
                    disabled={disabled}
                    className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer ${showGroupSelector
                        ? 'bg-brand-orange/15 text-brand-orange'
                        : 'text-text-muted hover:text-brand-orange hover:bg-brand-orange/10'
                        }`}
                    title="Selecteer groep"
                    aria-label="Selecteer contactgroep"
                    aria-expanded={showGroupSelector}
                >
                    <Users className="w-4 h-4" />
                </button>
            </div>

            {/* Search results dropdown */}
            {showDropdown && debouncedSearch.length >= 2 && (
                <div id="contact-picker-listbox" role="listbox" className="absolute top-full left-0 right-0 z-50 mt-1 max-h-[240px] overflow-y-auto bg-glass-bg/95 backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl">
                    {contacts === undefined && (
                        <div className="px-4 py-3 text-xs text-text-muted">Zoeken...</div>
                    )}
                    {contacts !== undefined && availableContacts.length === 0 && (
                        <div className="px-4 py-3 text-xs text-text-muted">
                            Geen contacten gevonden. Druk Enter om "{search}" handmatig toe te voegen.
                        </div>
                    )}
                    {availableContacts.map((c, idx) => (
                        <button
                            key={c._id}
                            id={`contact-option-${idx}`}
                            type="button"
                            role="option"
                            aria-selected={idx === activeIndex}
                            onClick={() => addRecipient({
                                email: c.email,
                                naam: c.naam,
                                organizationNaam: c.organizationNaam,
                                organizationSector: c.organizationSector,
                            })}
                            className={`w-full text-left px-4 py-2.5 transition-colors flex items-center gap-3 cursor-pointer ${idx === activeIndex ? 'bg-brand-orange/15' : 'hover:bg-brand-orange/10'
                                }`}
                        >
                            <div className="w-8 h-8 rounded-full bg-brand-orange/15 flex items-center justify-center text-brand-orange text-xs font-bold shrink-0">
                                {(c.naam || c.email)[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-text-primary truncate">
                                    {c.naam || c.email}
                                </div>
                                <div className="text-xs text-text-muted truncate flex items-center gap-1.5">
                                    <span>{c.email}</span>
                                    {c.organizationNaam && (
                                        <>
                                            <span className="text-glass-border">·</span>
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-3 h-3" />
                                                {c.organizationNaam}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {c.organizationSector && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${sectorColor(c.organizationSector)}`}>
                                    {SECTORS.find(s => s.value === c.organizationSector)?.label || c.organizationSector}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Group selector panel */}
            {showGroupSelector && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 p-4 bg-glass-bg/95 backdrop-blur-xl border border-glass-border rounded-xl shadow-2xl space-y-3">
                    <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                        <Users className="w-4 h-4 text-brand-orange" />
                        Selecteer Groep
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Sector dropdown */}
                        <div className="relative">
                            <label className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1 block">Sector</label>
                            <select
                                value={selectedSector || ''}
                                onChange={e => setSelectedSector(e.target.value || undefined)}
                                className="w-full appearance-none bg-glass-bg/50 border border-glass-border rounded-lg px-3 py-2 pr-8 text-sm text-text-primary cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50"
                            >
                                <option value="">Alle sectoren</option>
                                {SECTORS.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 bottom-2.5 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>

                        {/* Regio dropdown */}
                        <div className="relative">
                            <label className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1 block">Regio</label>
                            <select
                                value={selectedRegio || ''}
                                onChange={e => setSelectedRegio(e.target.value || undefined)}
                                className="w-full appearance-none bg-glass-bg/50 border border-glass-border rounded-lg px-3 py-2 pr-8 text-sm text-text-primary cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50"
                            >
                                <option value="">Alle regio's</option>
                                {REGIOS.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 bottom-2.5 w-4 h-4 text-text-muted pointer-events-none" />
                        </div>
                    </div>

                    {/* Count + add group button */}
                    <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-text-muted">
                            {groupContacts === undefined
                                ? 'Selecteer een filter...'
                                : `${groupContacts.length} contacten gevonden`}
                        </span>
                        <button
                            type="button"
                            onClick={handleAddGroup}
                            disabled={!groupContacts?.length}
                            className="px-4 py-2 text-xs font-semibold text-white bg-brand-orange hover:bg-orange-400 disabled:bg-glass-border disabled:text-text-muted rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed min-h-[36px]"
                        >
                            Groep toevoegen ({groupContacts?.length ?? 0})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
