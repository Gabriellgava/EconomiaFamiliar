const SUPABASE_CONFIG = {
  url: 'https://sllbbnoyymvvvcwavzqe.supabase.co',
  anonKey: 'sb_publishable_9CeD5dEctHwzKgfKoEB5zA_iycwikba',
  familiaSlug: 'familia-financas-default',
  familiaNome: 'Nossa família',
};

const sb = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.sb = sb;
