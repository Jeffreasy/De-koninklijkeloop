import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Camera, Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { siteConfig } from "../../config/site.config";

declare global {
    interface Window {
        cloudinary: any;
    }
}

interface PhotoUploadWidgetProps {
    cloudName: string;
    apiKey: string;
    userEmail?: string;
}

export default function PhotoUploadWidget({ cloudName, apiKey, userEmail }: PhotoUploadWidgetProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
    const widgetRef = useRef<any>(null);

    useEffect(() => {
        // Dynamically load Cloudinary Widget Script if not present
        if (!window.cloudinary) {
            const script = document.createElement("script");
            script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
            script.async = true;
            script.onload = initializeWidget;
            document.body.appendChild(script);
        } else {
            initializeWidget();
        }

        function initializeWidget() {
            if (widgetRef.current) return;

            widgetRef.current = window.cloudinary.createUploadWidget(
                {
                    cloudName: cloudName,
                    apiKey: apiKey,
                    uploadSignature: generateSignature,
                    folder: "De Koninklijke Loop/Uploads", // Folder Name
                    sources: ["local", "camera", "google_drive"],
                    resourceType: "auto",
                    clientAllowedFormats: ["image", "video"],
                    maxFileSize: 104857600, // 100MB
                    multiple: true,
                    styles: {
                        palette: {
                            window: "#0F172A",
                            windowBorder: "#FF9328",
                            tabIcon: "#FF9328",
                            menuIcons: "#CBD5E1",
                            textDark: "#0F172A",
                            textLight: "#FFFFFF",
                            link: "#FF9328",
                            action: "#FF9328",
                            inactiveTabIcon: "#64748B",
                            error: "#EF4444",
                            inProgress: "#3B82F6",
                            complete: "#22C55E",
                            sourceBg: "#1E293B"
                        },
                    },
                    text: {
                        en: {
                            queue: {
                                done: "Uploaded"
                            },
                            menu: {
                                files: "My Files"
                            }
                        },
                        nl: {
                            or: "Of",
                            back: "Terug",
                            advanced: "Geavanceerd",
                            close: "Sluiten",
                            no_results: "Geen resultaten",
                            search_placeholder: "Zoeken...",
                            upload_url_placeholder: "Plak URL hier...",
                            upload_url: "URL",
                            camera: "Camera",
                            local: "Bestanden",
                            google_drive: "Google Drive",
                            upload_btn: "Uploaden",
                            drag_drop: "Sleep bestanden hierheen",
                            queue: {
                                title: "Wachtrij",
                                title_uploading_with_counter: "Uploaden {{num}} bestanden",
                                title_processing_with_counter: "Verwerken {{num}} bestanden",
                                title_uploading: "Uploaden...",
                                title_processing: "Verwerken...",
                                title_done: "Klaar",
                                done: "Geüpload",
                                mini_upload_count: "{{num}} Geüpload",
                                mini_failed: "{{num}} Mislukt",
                                statuses: {
                                    uploading: "Uploaden...",
                                    processing: "Verwerken...",
                                    timeout: "Timeout",
                                    error: "Fout",
                                    done: "Klaar",
                                    stalled: "Gestopt"
                                }
                            }
                        }
                    },
                    language: "nl",
                    tags: ["community_upload", `user_${userEmail || "guest"}`]
                },
                (error: any, result: any) => {
                    if (!error && result && result.event === "success") {
                        console.log("Done! Here is the image info: ", result.info);
                        setStatus("success");
                        // Reset success message after 5 seconds
                        setTimeout(() => setStatus("idle"), 5000);
                    }
                    if (error) {
                        console.error("Widget Error:", error);
                    }
                }
            );
        }
    }, []);

    const generateSignature = async (callback: Function, paramsToSign: object) => {
        try {
            const response = await fetch("/api/sign-cloudinary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paramsToSign }),
            });
            const data = await response.json();
            if (data.error) {
                console.error("Signing Error:", data.error);
                return callback(data.error);
            }
            callback(data.signature);
        } catch (error) {
            console.error("Signing Request Failed:", error);
            callback("Signing Failed");
        }
    };

    const openWidget = () => {
        if (widgetRef.current) {
            widgetRef.current.open();
        } else {
            console.warn("Widget not initialized yet");
        }
    };

    return (
        <div className="w-full">
            {status === "success" ? (
                <div className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Dankjewel voor je foto's!</span>
                </div>
            ) : (
                <Button
                    onClick={openWidget}
                    variant="default"
                    className="inline-flex items-center gap-2 px-8 py-6 rounded-xl bg-brand-orange text-white font-bold hover:bg-orange-600 hover:text-white transition-all duration-300 shadow-xl shadow-brand-orange/20 transform hover:-translate-y-1 group"
                >
                    <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Upload Foto's & Video's</span>
                </Button>
            )}
        </div>
    );
}
