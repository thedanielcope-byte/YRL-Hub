// Face ID / Touch ID sign-in for the agent hub (WebAuthn passkeys) — the alternative to email + 4-digit PIN.
// Passkeys sync through iCloud Keychain, so one set up on an agent's iPhone also works in their home-screen app.
// POST { action, ... }
//   register-options / register-verify  signed in (agent's JWT): add a passkey for this login
//   login-options / login-verify        anyone: prove a passkey → a one-time code the page turns into a normal session
//   list / remove                       signed in: this login's passkeys
// Same gate as verify-pin: the email must be an ACTIVE row in hub_authorized_agents, checked on every sign-in,
// so revoking an agent also stops their Face ID. Tables are hub-only (hub_webauthn_*), separate from Nomad OS.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse,
} from "npm:@simplewebauthn/server@14.0.2";
import { isoBase64URL } from "npm:@simplewebauthn/server@14.0.2/helpers";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const enc = new TextEncoder();

// hub sign-in pages allowed to use passkeys, and the domain each one's passkeys belong to
const CUSTOM: Record<string, string> = { "yrlagent.com": "yrlagent.com", "www.yrlagent.com": "yrlagent.com", "portal.yrlagent.com": "yrlagent.com" };
function rpFor(origin: string): string | null {
  let h: string; try { const u = new URL(origin); if (u.protocol !== "https:") return null; h = u.hostname.toLowerCase(); } catch { return null; }
  if (CUSTOM[h]) return CUSTOM[h];
  const m = h.match(/^([a-z0-9-]+)\.nomadsystems\.co$/);
  if (m && !["portal", "www", "app", "staging", "demo", "hub", "nomados"].includes(m[1])) return "nomadsystems.co";
  return null;
}

async function activeAgent(email: string): Promise<boolean> {
  const { data } = await sb.from("hub_authorized_agents").select("id").eq("email", email.toLowerCase()).eq("status", "active").limit(1);
  return !!(data && data.length);
}

async function whoIs(req: Request): Promise<{ userId: string; email: string } | null> {
  const tk = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!tk) return null;
  try { const { data } = await sb.auth.getUser(tk); if (data?.user?.id && data.user.email) return { userId: data.user.id, email: data.user.email.toLowerCase() }; } catch {}
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  let b: any = {}; try { b = await req.json(); } catch {}
  const origin = req.headers.get("Origin") || "";
  const rpID = rpFor(origin);
  if (!rpID) return json({ ok: false, error: "Face ID sign-in isn't available on this site." }, 400);
  await sb.from("hub_webauthn_challenges").delete().lt("expires_at", new Date().toISOString());

  if (b.action === "login-options") {
    const options = await generateAuthenticationOptions({ rpID, userVerification: "required", allowCredentials: [] });
    await sb.from("hub_webauthn_challenges").insert({ challenge: options.challenge, purpose: "login", rp_id: rpID });
    return json({ ok: true, options });
  }

  if (b.action === "login-verify") {
    const r = b.response || {};
    const { data: ch } = await sb.from("hub_webauthn_challenges").delete().eq("challenge", String(b.challenge || "")).eq("purpose", "login").eq("rp_id", rpID).select().maybeSingle();
    if (!ch) return json({ ok: false, error: "That sign-in took too long — try again." }, 400);
    const { data: cred } = await sb.from("hub_webauthn_credentials").select("*").eq("credential_id", String(r.id || "")).eq("rp_id", rpID).maybeSingle();
    if (!cred) return json({ ok: false, error: "Face ID isn't set up for the hub on this login. Sign in with your PIN, then turn Face ID on." }, 401);
    let v;
    try {
      v = await verifyAuthenticationResponse({
        response: r, expectedChallenge: ch.challenge, expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: true,
        credential: { id: cred.credential_id, publicKey: isoBase64URL.toBuffer(cred.public_key), counter: Number(cred.counter), transports: cred.transports },
      });
    } catch (e) { return json({ ok: false, error: "Face ID check failed: " + (e as Error).message }, 401); }
    if (!v.verified) return json({ ok: false, error: "Face ID check failed." }, 401);
    const { data: u } = await sb.auth.admin.getUserById(cred.user_id);
    const email = (u?.user?.email || "").toLowerCase();
    if (!email) return json({ ok: false, error: "That login no longer exists." }, 401);
    if (!(await activeAgent(email))) return json({ ok: false, error: "This account no longer has hub access. Contact your broker." }, 401);
    await sb.from("hub_webauthn_credentials").update({ counter: v.authenticationInfo.newCounter, last_used_at: new Date().toISOString() }).eq("id", cred.id);
    const { data: link, error } = await sb.auth.admin.generateLink({ type: "magiclink", email });
    const otp = link?.properties?.email_otp;
    if (error || !otp) return json({ ok: false, error: "Couldn't start your session — try again." }, 500);
    return json({ ok: true, email, otp });
  }

  const who = await whoIs(req);
  if (!who) return json({ ok: false, error: "Sign in first." }, 401);

  if (b.action === "register-options") {
    if (!(await activeAgent(who.email))) return json({ ok: false, error: "Face ID is for hub agents only." }, 403);
    const { data: existing } = await sb.from("hub_webauthn_credentials").select("credential_id,transports").eq("user_id", who.userId).eq("rp_id", rpID);
    const options = await generateRegistrationOptions({
      rpName: "Agent Hub", rpID,
      userID: enc.encode(who.userId),
      userName: who.email,
      userDisplayName: who.email,
      attestationType: "none",
      excludeCredentials: (existing || []).map((c: any) => ({ id: c.credential_id, transports: c.transports })),
      authenticatorSelection: { residentKey: "required", userVerification: "required" },
    });
    await sb.from("hub_webauthn_challenges").insert({ challenge: options.challenge, purpose: "register", user_id: who.userId, rp_id: rpID });
    return json({ ok: true, options });
  }

  if (b.action === "register-verify") {
    const { data: ch } = await sb.from("hub_webauthn_challenges").delete().eq("challenge", String(b.challenge || "")).eq("purpose", "register").eq("rp_id", rpID).eq("user_id", who.userId).select().maybeSingle();
    if (!ch) return json({ ok: false, error: "That took too long — try again." }, 400);
    let v;
    try {
      v = await verifyRegistrationResponse({ response: b.response, expectedChallenge: ch.challenge, expectedOrigin: origin, expectedRPID: rpID, requireUserVerification: true });
    } catch (e) { return json({ ok: false, error: "Couldn't save Face ID: " + (e as Error).message }, 400); }
    if (!v.verified) return json({ ok: false, error: "Couldn't save Face ID." }, 400);
    const c = v.registrationInfo.credential;
    const { error } = await sb.from("hub_webauthn_credentials").insert({
      user_id: who.userId, email: who.email, credential_id: c.id, public_key: isoBase64URL.fromBuffer(c.publicKey), counter: c.counter,
      transports: c.transports || [], rp_id: rpID, label: String(b.label || "").slice(0, 80) || null,
    });
    if (error) return json({ ok: false, error: error.message }, 400);
    return json({ ok: true });
  }

  if (b.action === "list") {
    const { data } = await sb.from("hub_webauthn_credentials").select("id,label,rp_id,created_at,last_used_at").eq("user_id", who.userId).order("created_at");
    return json({ ok: true, passkeys: data || [] });
  }
  if (b.action === "remove") {
    const { error } = await sb.from("hub_webauthn_credentials").delete().eq("id", String(b.id || "")).eq("user_id", who.userId);
    return json({ ok: !error, error: error?.message });
  }
  return json({ ok: false, error: "unknown action" }, 400);
});
