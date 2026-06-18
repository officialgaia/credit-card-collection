import { createClient } from '@supabase/supabase-js';

// サービスロール権限の Supabase クライアント（RLSをバイパス）。
// Webhook など、ユーザーセッションが無いサーバー処理でのみ使用すること。
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase のサービスロール設定がありません');
  return createClient(url, key, { auth: { persistSession: false } });
}
