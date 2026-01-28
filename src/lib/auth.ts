import { atom } from 'nanostores';

export type User = {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer' | 'deelnemer' | 'begeleider' | 'vrijwilliger';
};

// Initialize from LocalStorage if available (Client-side)
let initialToken = typeof window !== 'undefined' ? localStorage.getItem('dkl_access_token') : null;
if (initialToken === "undefined") {
    initialToken = null;
    if (typeof window !== 'undefined') localStorage.removeItem('dkl_access_token');
}

const initialUserStr = typeof window !== 'undefined' ? localStorage.getItem('dkl_user') : null;

let initialUser = null;
try {
    if (initialUserStr && initialUserStr !== "undefined") {
        initialUser = JSON.parse(initialUserStr);
    }
} catch (e) {
    console.error("Failed to parse user from local storage", e);
    if (typeof window !== 'undefined') {
        localStorage.removeItem('dkl_user');
    }
}

export const $accessToken = atom<string | null>(initialToken);
export const $user = atom<User | null>(initialUser);

export function setAuth(token: string, user: User) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('dkl_access_token', token);
        localStorage.setItem('dkl_user', JSON.stringify(user));
    }
    $accessToken.set(token);
    $user.set(user);
}

export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('dkl_access_token');
        localStorage.removeItem('dkl_user');
    }
    $accessToken.set(null);
    $user.set(null);
    window.location.href = "/login";
}
