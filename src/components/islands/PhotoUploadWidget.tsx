import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { UploadCloud, CheckCircle2, X, Image as ImageIcon } from "lucide-react";

interface PhotoUploadWidgetProps {
    userEmail?: string;
}

export default function PhotoUploadWidget({ userEmail }: PhotoUploadWidgetProps) {
    const [status, setStatus] = useState<"idle" | "uploading" | "success">("idle");
    const [dragActive, setDragActive] = useState(false);
    const [uploadCount, setUploadCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList) => {
        if (files.length === 0) return;

        setStatus("uploading");
        let successCount = 0;

        // Get auth params from server
        const authResponse = await fetch("/api/sign-imagekit", { method: "POST" });
        if (!authResponse.ok) {
            console.error("Failed to get auth params");
            setStatus("idle");
            return;
        }
        const authParams = await authResponse.json();

        for (const file of Array.from(files)) {
            if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) continue;
            if (file.size > 104857600) continue; // 100MB limit

            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("fileName", file.name);
                formData.append("folder", "/Uploads");
                formData.append("tags", `community_upload,user_${userEmail || "guest"}`);
                formData.append("publicKey", import.meta.env.PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
                formData.append("signature", authParams.signature);
                formData.append("expire", String(authParams.expire));
                formData.append("token", authParams.token);
                formData.append("useUniqueFileName", "true");

                const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
                    method: "POST",
                    body: formData,
                });

                if (uploadResponse.ok) {
                    successCount++;
                    if (import.meta.env.DEV) console.log(`✅ Uploaded: ${file.name}`);
                }
            } catch (error) {
                console.error("Upload failed:", file.name, error);
            }
        }

        setUploadCount(successCount);
        setStatus("success");
        setTimeout(() => {
            setStatus("idle");
            setUploadCount(0);
        }, 5000);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => setDragActive(false);

    const openFilePicker = () => fileInputRef.current?.click();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFiles(e.target.files);
    };

    return (
        <div className="w-full">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
            />

            {status === "success" ? (
                <div className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 font-bold animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                        {uploadCount > 1
                            ? `${uploadCount} bestanden geüpload!`
                            : "Dankjewel voor je foto's!"}
                    </span>
                </div>
            ) : status === "uploading" ? (
                <div className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange font-bold">
                    <div className="w-5 h-5 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
                    <span>Uploaden...</span>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative group cursor-pointer transition-all duration-300 ${dragActive
                        ? "scale-105"
                        : ""
                        }`}
                >
                    {dragActive && (
                        <div className="absolute inset-0 bg-brand-orange/10 border-2 border-dashed border-brand-orange rounded-xl z-10 flex items-center justify-center">
                            <div className="text-brand-orange font-bold flex items-center gap-2">
                                <ImageIcon className="w-6 h-6" />
                                <span>Laat los om te uploaden</span>
                            </div>
                        </div>
                    )}
                    <Button
                        onClick={openFilePicker}
                        variant="default"
                        className="inline-flex items-center gap-2 px-8 py-6 rounded-xl bg-brand-orange text-white font-bold hover:bg-orange-400 hover:text-white transition-all duration-300 shadow-xl shadow-brand-orange/20 transform hover:-translate-y-1 group cursor-pointer"
                    >
                        <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Upload Foto's & Video's</span>
                    </Button>
                </div>
            )}
        </div>
    );
}
