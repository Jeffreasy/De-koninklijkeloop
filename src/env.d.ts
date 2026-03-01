/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface User {
    id: string;
    email: string;
    name?: string;
    full_name?: string;
    role: 'admin' | 'editor' | 'viewer' | 'deelnemer' | 'begeleider' | 'vrijwilliger';
}

declare namespace App {
    interface Locals {
        user: User | null;
        token: string | null;
    }
}

interface Window {
    DKL_INITIAL_USER: User | null;
}

