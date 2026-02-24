import { atom } from 'nanostores';

export type User = {
    id: string;
    email: string;
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
    $accessToken.set(null);
    $user.set(null);
    // Redirect to professional logout transition page
    // The /logout page calls /api/auth/logout to clear the HttpOnly cookie
    window.location.href = "/logout";
}
