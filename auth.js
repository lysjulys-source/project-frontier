(function initializeFrontierAuth() {
  const supabase = window.frontierSupabase;

  if (!supabase) {
    console.error("Project Frontier: Auth could not start because Supabase is unavailable.");
    return;
  }

  const authState = {
    user: null,
    session: null,
    profile: null
  };

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

    if (error) {
      console.error("Project Frontier: Could not load profile.", error);
      return null;
    }

    authState.profile = data;
    return data;
  }

  async function createProfile(user, displayName) {
    const profile = {
      user_id: user.id,
      display_name: displayName || user.email?.split("@")[0] || "Captain",
      xp: 0,
      streak: 0
    };

    const { data, error } = await supabase
      .from("frontier_profiles")
      .upsert(profile, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Project Frontier: Could not create profile.", error);
      throw error;
    }

    authState.profile = data;
    return data;
  }

  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    });

    if (error) throw error;

    if (data.user && data.session) {
      await createProfile(data.user, displayName);
    }

    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    authState.user = data.user;
    authState.session = data.session;
    await loadProfile(data.user);

    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    authState.user = null;
    authState.session = null;
    authState.profile = null;
  }

  async function initializeSession() {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Project Frontier: Could not restore session.", error);
      return;
    }

    authState.session = session;
    authState.user = session?.user || null;

    if (authState.user) {
      await loadProfile(authState.user);
    }
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    authState.session = session;
    authState.user = session?.user || null;

    if (authState.user) {
      await loadProfile(authState.user);
    } else {
      authState.profile = null;
    }

    window.dispatchEvent(
      new CustomEvent("frontier-auth-changed", {
        detail: { ...authState }
      })
    );
  });

  window.frontierAuth = {
    state: authState,
    signUp,
    signIn,
    signOut,
    loadProfile,
    createProfile,
    initializeSession
  };

  initializeSession();

  console.info("Project Frontier: Auth system initialized.");
})();
