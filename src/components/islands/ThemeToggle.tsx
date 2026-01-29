import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("dark");

    useEffect(() => {
        // Sync with the theme set by the head script
        const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark";
        if (currentTheme) {
            setTheme(currentTheme);
        } else {
            // Fallback (should ideally not happen due to head script)
            const saved = localStorage.getItem("theme") as "light" | "dark";
            const system = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
            setTheme(saved || system);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);

        // Update DOM
        const root = document.documentElement;
        root.setAttribute("data-theme", newTheme);
        root.className = newTheme; // Update class for Tailwind dark: selector

        // Persist
        localStorage.setItem("theme", newTheme);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full text-text-body hover:bg-glass-bg/50"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
    );
}
