interface Env { DB: D1Database; }

function isEmail(s: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s) && s.length <= 254;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let email = "", website = "", source = "apex";
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const b = await request.json<{ email?: string; website?: string; source?: string }>();
      email = (b.email || "").trim(); website = (b.website || "").trim(); source = (b.source || source).trim();
    } else {
      const f = await request.formData();
      email = String(f.get("email") || "").trim();
      website = String(f.get("website") || "").trim(); // honeypot
      source = String(f.get("source") || source).trim();
    }
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field. Silently accept (200) so
  // bots get no signal, but write nothing.
  if (website) return Response.json({ ok: true });

  if (!isEmail(email)) return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });

  try {
    await env.DB.prepare("INSERT OR IGNORE INTO signups (email, ts, source) VALUES (?, ?, ?)")
      .bind(email.toLowerCase(), Date.now(), source.slice(0, 32))
      .run();
  } catch {
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
  return Response.json({ ok: true });
};
