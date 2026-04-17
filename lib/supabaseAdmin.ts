import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ⚠️ IMPORTANT : ce client NE DOIT JAMAIS être importé côté client.
// Il donne accès complet à la base (insert, update, delete sans RLS).
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
