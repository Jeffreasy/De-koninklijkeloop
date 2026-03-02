import { atom } from 'nanostores';

export type User = {
    id: string;
    email: string;
    name?: string;
    full_name?: string;
    role: 'admin' | 'editor' | 'viewer' | 'deelnemer' | 'begeleider' | 'vrijwilliger';
};

// State is purely in-memory (hydrated from Server via Layout)
export const $accessToken = atom<string | null>(null);
export const $user = atom<User | null>(null);

export function setAuth(token: string | null, user: User | null) {
    // Cookie-based auth: Token is null in client, but User state is valid
    $accessToken.set(token);
    $user.set(user);
}

export function logout() {
    // CRITICAL: Navigate FIRST, then clear state.
    // If we clear state first ($user.set(null)), React islands that guard
    // on user state immediately re-render their "Toegang Beveiligd" screen
    // BEFORE window.location.replace fires — causing the flash.
    // By navigating first, the page unloads before any re-render happens.
    window.location.replace("/logout");
    $accessToken.set(null);
    $user.set(null);
}

