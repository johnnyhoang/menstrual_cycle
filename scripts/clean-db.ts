import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong môi trường.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDatabase() {
  console.log('🧹 Đang làm sạch dữ liệu trong Database Supabase...');

  const { error: logsErr } = await supabase
    .from('mh_daily_logs')
    .delete()
    .neq('date', 'non_existent_key');

  if (logsErr) console.error('❌ Lỗi dọn mh_daily_logs:', logsErr.message);

  const { error: cyclesErr } = await supabase
    .from('mh_menstrual_cycles')
    .delete()
    .neq('id', 'non_existent_key');

  if (cyclesErr) console.error('❌ Lỗi dọn mh_menstrual_cycles:', cyclesErr.message);

  console.log('✨ Đã hoàn tất xóa dữ liệu tạm khỏi Database!');
}

cleanDatabase().catch(console.error);
