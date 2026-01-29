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
            // API returns PascalCase (Go structs), Frontend expects normalized keys
            // Cookie-based Auth: Token is in HttpOnly cookie, not in body.
            const rawUser = data.User || data.user;

            if (!rawUser) {
                throw new Error("Ongeldige server reactie (Geen user data)");
            }

            // Normalize User object (API likely returns PascalCase fields)
            const user = {
                id: rawUser.ID || rawUser.id,
                email: rawUser.Email || rawUser.email,
                role: (rawUser.Role || rawUser.role || "viewer").toLowerCase()
            };

            // 2. Store user state (Token is in Cookie)
            setAuth(null, user);

            // 3. Redirect based on Role
            if (user.role === "admin") {
                window.location.href = "/admin/dashboard";
            } else {
                window.location.href = "/dashboard";
            }

        } catch (err: any) {
            console.error(err);
            setError("Ongeldige inloggegevens. Probeer het opnieuw.");
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
