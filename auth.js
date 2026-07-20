(function initializeFrontierAuth() {
  const supabase = window.frontierSupabase;

  if (!supabase) {
    console.error("Project Frontier: Auth could not start because Supabase is unavailable.");
    return;
  }

  const authState = {
    user: null,
    session: null,
    profile: null,
    ready: false
  };

  function emit(event = "STATE_CHANGED") {
    window.dispatchEvent(new CustomEvent("frontier-auth-changed", {
      detail: { event, ...authState }
    }));
  }

  function profileName(user) {
    return user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Captain";
  }

  async function loadProfile(user) {
    if (!user) {
      authState.profile = null;
      return null;
    }

    const { data, error } = await supabase
      .from("frontier_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    authState.profile = data;
    return data;
  }

  async function createProfile(user, displayName) {
    const profile = {
      user_id: user.id,
      display_name: displayName || profileName(user),
      xp: {
        engineering: 0,
        science: 0,
        exploration: 0,
        community: 0,
        creativity: 0,
        vitality: 0
      },
      streak: 0
    };

    const { data, error } = await supabase
      .from("frontier_profiles")
      .upsert(profile, { onConflict: "user_id" })
      .select()
      .single();

    if (error) throw error;
    authState.profile = data;
    return data;
  }

  async function ensureProfile(user, displayName) {
    const existing = await loadProfile(user);
    return existing || createProfile(user, displayName);
  }

  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${location.origin}/#/threshold`
      }
    });

    if (error) throw error;

    if (data.user && data.session) {
      authState.user = data.user;
      authState.session = data.session;
      await ensureProfile(data.user, displayName);
      emit("SIGNED_UP");
    }

    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    authState.user = data.user;
    authState.session = data.session;
    await ensureProfile(data.user);
    emit("SIGNED_IN");
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    authState.user = null;
    authState.session = null;
    authState.profile = null;
    emit("SIGNED_OUT");
  }

  async function initializeSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      authState.session = session;
      authState.user = session?.user || null;
      if (authState.user) await ensureProfile(authState.user);
    } catch (error) {
      console.error("Project Frontier: Could not restore session.", error);
    } finally {
      authState.ready = true;
      emit("INITIALIZED");
    }
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    authState.session = session;
    authState.user = session?.user || null;

    try {
      if (authState.user) await ensureProfile(authState.user);
      else authState.profile = null;
    } catch (error) {
      console.error("Project Frontier: Could not synchronize profile.", error);
    }

    if (!authState.ready) authState.ready = true;
    emit(event);
  });

  window.frontierAuth = {
    state: authState,
    signUp,
    signIn,
    signOut,
    loadProfile,
    createProfile,
    ensureProfile,
    initializeSession
  };

  initializeSession();
  console.info("Project Frontier: Auth system initialized.");
})();

