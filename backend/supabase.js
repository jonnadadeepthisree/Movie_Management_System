const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key || url.includes("YOUR-PROJECT-ID") || key.startsWith("replace_with_")) {
  console.warn("Supabase credentials are missing or still placeholders. Configure backend/.env.");
}

const supabase = url && key
  ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

module.exports = supabase;
