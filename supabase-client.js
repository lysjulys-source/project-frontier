(function initializeFrontierSupabase() {
  const config = window.FRONTIER_SUPABASE_CONFIG;
  const library = window.supabase;

  if (!config?.url || !config?.publishableKey) {
    console.error("Project Frontier: Supabase configuration is missing.");
    window.frontierSupabase = null;
    return;
  }

  if (!library?.createClient) {
    console.error("Project Frontier: Supabase library failed to load.");
    window.frontierSupabase = null;
    return;
  }

  window.frontierSupabase = library.createClient(
    config.url,
    config.publishableKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  console.info("Project Frontier: Supabase client initialized.");
})();
