import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bceuoybfdytukdhzyqcl.supabase.co';
const supabaseAnonKey = 'sb_publishable_3rjj1E5QMwg2OvTVucMQvQ_vzoT1TJZ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
