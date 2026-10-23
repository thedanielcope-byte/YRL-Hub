/* ============================================================
   hub-data.js — tenant-aware content layer for the portal-hosted hub
   Drop-in replacement for yrl-hub.js. Same function names
   (loadHubContent / saveHubContent / uploadHubFile) so the hub page
   works unchanged — but every read/write is scoped to the signed-in
   member's client_id, and uploaded files live under that client's folder.

   Depends on portal-auth.js having run first:
     - window.yrlClient  → authenticated supabase-js client
     - window.yrlMember  → { role, client_id, email }
   ============================================================ */

/* Resolve the current tenant. Returns the client_id or null.
   Nomad admins can preview any brokerage's hub via ?as=<client_id>; we stash it
   in sessionStorage so it persists as they click through to sub-pages (whose
   links don't carry the query string). */
function _hubClientId() {
  const m = window.yrlMember;
  if (!m) return null;
  if (m.role === 'nomad_admin') {
    try {
      const as = new URLSearchParams(location.search).get('as');
      if (as) { sessionStorage.setItem('hubPreviewCid', as); return as; }
      const stored = sessionStorage.getItem('hubPreviewCid');
      if (stored) return stored;
    } catch {}
  }
  return m.client_id || null;
}

/* Block until portal-auth.js has populated window.yrlMember. */
function _hubReady() {
  if (window.yrlMember) return Promise.resolve();
  return new Promise((resolve) => {
    document.addEventListener('yrl-auth-ready', () => resolve(), { once: true });
  });
}

async function loadHubContent(key) {
  try {
    await _hubReady();
    const cid = _hubClientId();
    if (!cid) return null;
    const { data, error } = await window.yrlClient
      .from('hub_content')
      .select('content_value')
      .eq('content_key', key)
      .eq('client_id', cid)
      .maybeSingle();
    if (error) return null;
    return data ? data.content_value : null;
  } catch { return null; }
}

async function saveHubContent(key, value) {
  try {
    await _hubReady();
    const cid = _hubClientId();
    if (!cid) return false;
    /* Upsert scoped to (content_key, client_id). Manual check-then-write so
       this works whether or not a (client_id, content_key) unique exists. */
    const { data: existing } = await window.yrlClient
      .from('hub_content')
      .select('id')
      .eq('content_key', key)
      .eq('client_id', cid)
      .maybeSingle();
    if (existing) {
      const { error } = await window.yrlClient
        .from('hub_content')
        .update({ content_value: value })
        .eq('id', existing.id);
      return !error;
    }
    const { error } = await window.yrlClient
      .from('hub_content')
      .insert({ content_key: key, content_value: value, client_id: cid });
    return !error;
  } catch { return false; }
}

async function uploadHubFile(file, folder = 'guides') {
  await _hubReady();
  const cid = _hubClientId();
  if (!cid) throw new Error('No tenant context for upload.');
  const safeName   = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${Date.now()}_${safeName}`;
  /* Files namespaced by client so brokerages never share a folder. */
  const path = `${cid}/${folder}/${uniqueName}`;
  const { error } = await window.yrlClient
    .storage.from('hub-files')
    .upload(path, file, { upsert: false, contentType: file.type || 'application/octet-stream' });
  if (error) throw new Error(error.message || 'Upload failed');
  const { data } = window.yrlClient.storage.from('hub-files').getPublicUrl(path);
  return data.publicUrl;
}
