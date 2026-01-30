import { useState } from "react";
import { apiRequest } from "../../lib/api";
import { setAuth } from "../../lib/auth";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // 1. Authenticate with LaventeCare
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });



            // API returns PascalCase (Go structs), Frontend expects normalized keys
            // Cookie-based Auth: Token is in HttpOnly cookie, not in body.
            const rawUser = data.User || data.user;

            if (!rawUser) {
                console.error("[LoginForm] 'User' or 'user' key missing in data:", Object.keys(data));
                throw new Error("Ongeldige server reactie (Geen user data)");
            }

            // Normalize User object
            const user = {
                id: rawUser.ID || rawUser.id,
                email: rawUser.Email || rawUser.email,
                role: (rawUser.Role || rawUser.role || "").toLowerCase()
            };

            // 2. If Role is missing (Backend issue), fetch profile
            // This implicitly tests if the HttpOnly cookie was set correctly
            if (!user.role) {
                try {

                    const meData = await apiRequest("/auth/me");
                    if (meData.user && meData.user.role) {
                        user.role = meData.user.role.toLowerCase();

                    }
                } catch (e) {
                    console.error("[LoginForm] Could not fetch profile (Cookie missing?):", e);
                }
            }

            // Fallback
            if (!user.role) user.role = "viewer";

            // 3. Store user state (Token is in Cookie)
            setAuth(null, user);

            // 4. Redirect based on Role
            if (user.role === "admin") {
                window.location.href = "/admin/dashboard";
            } else {
                window.location.href = "/dashboard";
            }

        } catch (err: any) {
            console.error("[LoginForm] Error:", err);
            // Show real error for debugging if possible, else generic
            setError(err.message || "Ongeldige inloggegevens. Probeer het opnieuw.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@dekoninklijkeloop.nl"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />
            </div>

            <Button
                type="submit"
                variant="default"
                className="w-full shadow-lg shadow-brand-primary/20"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Inloggen..." : "Inloggen"}
            </Button>
        </form>
    );
}
