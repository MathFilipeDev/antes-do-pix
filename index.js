import page from "./page.js";

const encode = new TextEncoder();
const base64url = (bytes) =>
  btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
const encodeJson = (value) => base64url(encode.encode(JSON.stringify(value)));

async function issueToken(request, privateKey) {
  const cookieName = "__Host-pix-demo";
  const cookie = request.headers.get("Cookie") ?? "";
  const existing = cookie.match(/(?:^|;\s*)__Host-pix-demo=([a-f0-9-]{36})(?:;|$)/)?.[1];
  const visitor = existing ?? crypto.randomUUID();
  const pkcs8 = Uint8Array.from(atob(privateKey), (character) => character.charCodeAt(0));
  const algorithm = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
  const key = await crypto.subtle.importKey("pkcs8", pkcs8, algorithm, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const claims = encodeJson({ sub: "pix-demo-" + visitor, iat: now, exp: now + 1800 });
  const body = encodeJson({ alg: "RS256", typ: "JWT" }) + "." + claims;
  const signature = await crypto.subtle.sign(algorithm.name, key, encode.encode(body));
  const headers = new Headers({ "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" });
  if (!existing) headers.set("Set-Cookie", cookieName + "=" + visitor + "; Path=/; Secure; HttpOnly; SameSite=Strict");
  return new Response(body + "." + base64url(new Uint8Array(signature)), { headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(page, { headers: { "Content-Type": "text/html; charset=utf-8" } });
    }
    if (url.pathname !== "/chat-token") return new Response("Página indisponível.", { status: 404 });
    if (request.method !== "POST" || request.headers.get("Origin") !== url.origin) {
      return new Response("Origem ou método inválido.", { status: 403 });
    }
    if (!env.PIX_CHAT_SIGNING_KEY) return new Response("Chat em configuração.", { status: 503 });
    try {
      return await issueToken(request, env.PIX_CHAT_SIGNING_KEY);
    } catch {
      return new Response("Chat indisponível.", { status: 503 });
    }
  },
};
