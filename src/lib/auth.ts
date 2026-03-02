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
    // Use a hidden anchor with data-astro-reload to force a FULL page load.
    // window.location.replace() calls history.replaceState() internally, which
    // Astro's ClientRouter patches — causing the View Transition to fire and
    // morphing the admin sidebar into the logout page (the flash).
    // data-astro-reload is Astro's official opt-out from ClientRouter interception.
    const a = document.createElement("a");
    a.href = "/logout";
    a.setAttribute("data-astro-reload", "");
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    // State cleared after navigation is initiated (prevents React island re-render)
    $accessToken.set(null);
    $user.set(null);
}

