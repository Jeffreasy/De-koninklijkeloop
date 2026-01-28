import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { apiRequest } from "../../lib/api";
import { $user } from "../../lib/auth";
import { useStore } from "@nanostores/react";

type Status = "pending" | "success" | "error";

export default function SystemStatus() {
    const user = useStore($user);
    const [backendHealth, setBackendHealth] = useState<Status>("pending");
    const [authStatus, setAuthStatus] = useState<Status>("pending");
    const [backendLatency, setBackendLatency] = useState<number | null>(null);

    // Convex Check (Real-time)
    // We use a simple query like listRegistrations (limited) or a lightweight check if available
    // For now, we'll assume if this hook doesn't throw, we are connected.
    // Ideally create a specific `api.public.ping` query in Convex.
    // We'll use listRegistrations but handle errors graciously if not allowed.
    // We'll use the public ping query
    const convexData = useQuery(api.public.ping);
    // Actually, let's just check if we can mount.

    useEffect(() => {
        checkBackend();
        checkAuth();
    }, []);

    const checkBackend = async () => {
        const start = performance.now();
        try {
            // Unauthenticated health check
            const res = await fetch("https://laventecareauthsystems.onrender.com/health");
            if (res.ok) {
                setBackendHealth("success");
                setBackendLatency(Math.round(performance.now() - start));
            } else {
                setBackendHealth("error");
            }
        } catch (e) {
            console.error(e);
            setBackendHealth("error");
        }
    };

    const checkAuth = async () => {
        if (!user) {
            setAuthStatus("error"); // Not logged in
            return;
        }
        try {
            // Protected connectivity check
            await apiRequest("/me");
            setAuthStatus("success");
        } catch (e) {
            console.error(e);
            setAuthStatus("error");
        }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-text-body mb-6">Systeem Status</h2>

            <div className="grid gap-4">
                {/* 1. Backend Connectivity */}
                <StatusCard
                    title="Backend Services (Go)"
                    status={backendHealth}
                    detail={backendLatency ? `${backendLatency}ms` : "Checking..."}
                />

                {/* 2. Auth Session */}
                <StatusCard
                    title="Authenticatie & Tenant"
                    status={authStatus}
                    detail={user ? `Ingelogd als ${user.email}` : "Niet ingelogd"}
                />

                {/* 3. Convex */}
                <StatusCard
                    title="Convex Realtime DB"
                    status={convexData !== undefined ? "success" : "pending"}
                    detail={convexData !== undefined ? "Verbonden" : "Verbinden..."}
                />
            </div>
        </div>
    );
}

function StatusCard({ title, status, detail }: { title: string, status: Status, detail: string }) {
    const colors = {
        pending: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
        success: "bg-green-500/10 border-green-500/20 text-green-400",
        error: "bg-red-500/10 border-red-500/20 text-red-400",
    };

    const icons = {
        pending: "⏳",
        success: "✅",
        error: "❌",
    };

    return (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${colors[status]}`}>
            <div>
                <h3 className="font-medium text-text-body">{title}</h3>
                <p className="text-sm opacity-80">{detail}</p>
            </div>
            <div className="text-xl">{icons[status]}</div>
        </div>
    );
}
