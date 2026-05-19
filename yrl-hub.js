/* ============================================================
   Your Realty Link — Agent Hub
   yrl-hub.js  |  Supabase content storage + PIN auth
   ============================================================ */

/* ---- Supabase connection (shared with Tides project) ---- */
const _HUB_SB_URL = 'https://khhfkxfxefjgunhrihyx.supabase.co';
const _HUB_SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoaGZreGZ4ZWZqZ3VuaHJpaHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NzYwMjcsImV4cCI6MjA5MTM1MjAyN30.bYW68xMDUEXBRC1bxOLdj77xCcjXb3wIuHbPAPFdSGo';

async function loadHubContent(key) {
  try {
    const res = await fetch(
      `${_HUB_SB_URL}/rest/v1/hub_content?content_key=eq.${encodeURIComponent(key)}&select=content_value`,
      { headers: { 'apikey': _HUB_SB_KEY, 'Authorization': `Bearer ${_HUB_SB_KEY}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows.length ? rows[0].content_value : null;
  } catch { return null; }
}

async function uploadHubFile(file, folder = 'guides') {
  const safeName   = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueName = `${Date.now()}_${safeName}`;
  const path       = `${folder}/${uniqueName}`;
  const res = await fetch(`${_HUB_SB_URL}/storage/v1/object/hub-files/${path}`, {
    method: 'POST',
    headers: {
      'apikey':        _HUB_SB_KEY,
      'Authorization': `Bearer ${_HUB_SB_KEY}`,
      'Content-Type':  file.type || 'application/octet-stream',
      'x-upsert':      'false'
    },
    body: file
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Upload failed: HTTP ${res.status}`);
  }
  return `${_HUB_SB_URL}/storage/v1/object/public/hub-files/${path}`;
}

async function saveHubContent(key, value) {
  try {
    const check = await fetch(
      `${_HUB_SB_URL}/rest/v1/hub_content?content_key=eq.${encodeURIComponent(key)}&select=id`,
      { headers: { 'apikey': _HUB_SB_KEY, 'Authorization': `Bearer ${_HUB_SB_KEY}` } }
    );
    if (!check.ok) return false;
    const rows = await check.json();
    const method = rows.length ? 'PATCH' : 'POST';
    const url = rows.length
      ? `${_HUB_SB_URL}/rest/v1/hub_content?content_key=eq.${encodeURIComponent(key)}`
      : `${_HUB_SB_URL}/rest/v1/hub_content`;
    const res = await fetch(url, {
      method,
      headers: {
        'apikey': _HUB_SB_KEY,
        'Authorization': `Bearer ${_HUB_SB_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ content_key: key, content_value: value })
    });
    return res.ok;
  } catch { return false; }
}

