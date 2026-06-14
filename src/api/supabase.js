// ─────────────────────────────────────────
//  SUPABASE CLIENT
//  Single instance used across the app
// ─────────────────────────────────────────

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/constants.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export default supabase;
