import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.PUBLIC_API_URL || "https://laventecareauthsystems.onrender.com/api/v1";
const TENANT_ID = process.env.PUBLIC_TENANT_ID || "de-koninklijkeloop";

// Helper to get Tenant UUID
async function getTenantUUID(slug) {
    console.log(`Resolving Tenant Slug: ${slug}...`);
    const res = await fetch(`${API_URL}/tenants/${slug}`);
    if (!res.ok) {
        throw new Error(`Failed to resolve tenant: ${res.statusText}`);
    }
    const data = await res.json();
    console.log(`Resolved UUID: ${data.id}`);
    return data.id;
}

async function registerUser() {
    // 1. Resolve Tenant ID
    let tenantUUID;
    try {
        const slug = TENANT_ID; // The value in env is currently the slug "de-koninklijkeloop"
        tenantUUID = await getTenantUUID(slug);
    } catch (e) {
        console.error("❌ Could not resolve tenant:", e);
        return;
    }

    console.log(`Registering user on ${API_URL} for tenant ${tenantUUID}...`);

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': tenantUUID
            },
            body: JSON.stringify({
                email: "webmaster@dekoninklijkeloop.nl",
                password: "Dkl2026!Webmaster"
            })
        });

        console.log(`Response Status: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log("Raw Response:", text);

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            // If empty or text, handle gracefully
        }

        if (res.ok) {
            console.log("✅ User created successfully!");
            console.log("User ID:", data?.user?.id || "Unknown");
        } else {
            console.error("❌ Registration failed:", data || text);
        }
    } catch (error) {
        console.error("❌ Network error:", error);
    }
}

registerUser();
