import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { email } = body;

        console.log(`[Debug Reset] Attempting reset for: ${email}`);

        const tenantId = "b2727666-7230-4689-b58b-ceab8c2898d5";
        const backendUrl = "https://laventecareauthsystems.onrender.com/api/v1/auth/password/forgot";

        console.log(`[Debug Reset] Sending to: ${backendUrl}`);

        const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Tenant-ID": tenantId
            },
            body: JSON.stringify({ email })
        });

        const responseText = await response.text();
        console.log(`[Debug Reset] Backend Response ${response.status}: ${responseText}`);

        if (!response.ok) {
            return new Response(responseText, { status: response.status });
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        console.error("[Debug Reset] Error:", e);
        return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
    }
};
