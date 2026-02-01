import { v2 } from 'cloudinary';
export { renderers } from '../../renderers.mjs';

const POST = async ({ request, locals }) => {
  const { user } = locals;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const body = await request.json();
  const { paramsToSign } = body;
  try {
    v2.config({
      cloud_name: "dgfuv7wif",
      api_key: "284312759568494",
      api_secret: "F3oqzCUibbxtLulrpwT5HyiQrDk"
    });
    const signature = v2.utils.api_sign_request(
      paramsToSign,
      "F3oqzCUibbxtLulrpwT5HyiQrDk"
    );
    return new Response(JSON.stringify({ signature }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Cloudinary Signing Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
