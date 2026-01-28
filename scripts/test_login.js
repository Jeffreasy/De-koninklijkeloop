import dotenv from 'dotenv';
dotenv.config();

// Use the explicit UUID we found
const API_URL = "https://laventecareauthsystems.onrender.com/api/v1";
const TENANT_ID = "c3888c7e-44cf-4827-9a7d-adaae2a1a095";

async function testLogin() {
    console.log(`Testing login on ${API_URL} for tenant ${TENANT_ID}...`);

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Tenant-ID': TENANT_ID
            },
            body: JSON.stringify({
                email: "webmaster@dekoninklijkeloop.nl",
                password: "Dkl2026!Webmaster"
            })
        });

        console.log(`Response Status: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log("Raw Response:", text);

        if (res.ok) {
            console.log("✅ Login Successful!");
            const data = JSON.parse(text);
            console.log("Token received:", data.access_token ? "Yes" : "No");
        } else {
            console.error("❌ Login Failed");
        }
    } catch (error) {
        console.error("❌ Network error:", error);
    }
}

testLogin();
