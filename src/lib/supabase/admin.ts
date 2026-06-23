import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com service_role — só no servidor (Server Actions / Route Handlers).
 * Nunca importe em componentes client nem exponha a chave.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getServiceRoleMissingMessage() {
  return "Configure SUPABASE_SERVICE_ROLE_KEY no .env.local (Supabase → Project Settings → API → service_role). Reinicie o servidor após salvar.";
}
