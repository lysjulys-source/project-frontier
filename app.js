(()=>{
  const S = FrontierState;
  const xpByGroup={arcs:120,side:60,legendary:250};
  const routeLabels={threshold:["THE THRESHOLD","ENTER THE LIVING WORLD"],"mission-control":["MISSION CONTROL","DAILY OPERATIONS"],contents:["THE CODEX","PURPOSE, QUESTS, AND KNOWLEDGE"],chapter:["THE CODEX","CURRENT CHAPTER"],quests:["THE CODEX","QUEST JOURNAL"],character:["CHARACTER","WHO THE CAPTAIN IS BECOMING"],log:["CAPTAIN'S LOG","THE PERSISTENT RECORD"],archive:["ARCHIVE","WHAT HAS ALREADY BEEN LIVED"],sanctuary:["SANCTUARY","RECOVERY AND REFLECTION"],observatory:["OBSERVATORY","PATTERNS ACROSS TIME"],atlas:["ATLAS","PEOPLE, PLACES, AND PROJECTS"],settings:["SETTINGS","SYSTEM GOVERNANCE"]};
  const navGroups={contents:["contents","chapter","quests"],character:["character"],archive:["archive"],log:["log"]};
  const yesterday=k=>{const d=new Date(k+"T12:00:00");d.setDate(d.getDate()-1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
  const toast=text=>{const node=document.getElementById("toast-template").content.firstElementChild.cloneNode(true);node.textContent=text;document.body.append(node);setTimeout(()=>node.remove(),2600)};
  const closeMenu=()=>{document.body.classList.remove("menu-open");document.getElementById("mobile-menu-button")?.setAttribute("aria-expanded","false");document.getElementById("sidebar-scrim")?.setAttribute("hidden","")};

  function authMarkup(){
    return `<section class="auth-gate"><div class="auth-panel"><aside class="auth-lore"><span class="brand-mark">PF</span><h1>Project<br>Frontier</h1><p>A living record of becoming. Sign in to continue your expedition, or establish a new Captain record.</p><small>The world does not reset. It continues.</small></aside><div class="auth-form-wrap"><div class="auth-tabs" role="tablist"><button class="auth-tab active" data-auth-tab="signin" type="button">Sign in</button><button class="auth-tab" data-auth-tab="signup" type="button">Create account</button></div><form class="auth-form" id="signin-form"><h2>Welcome back.</h2><p>Retrieve your Captain record and return to the Threshold.</p><div class="auth-field"><label for="signin-email">Email</label><input id="signin-email" name="email" type="email" autocomplete="email" required></div><div class="auth-field"><label for="signin-password">Password</label><input id="signin-password" name="password" type="password" autocomplete="current-password" required></div><button class="auth-submit" type="submit">Enter Project Frontier</button><p class="auth-message" id="signin-message" aria-live="polite"></p></form><form class="auth-form" id="signup-form" hidden><h2>Establish your record.</h2><p>Create a secure account. Your profile, quests, and logs will belong only to you.</p><div class="auth-field"><label for="signup-name">Captain name</label><input id="signup-name" name="displayName" type="text" autocomplete="nickname" maxlength="60" required></div><div class="auth-field"><label for="signup-email">Email</label><input id="signup-email" name="email" type="email" autocomplete="email" required></div><div class="auth-field"><label for="signup-password">Password</label><input id="signup-password" name="password" type="password" autocomplete="new-password" minlength="8" required></div><div class="auth-field"><label for="signup-confirm">Confirm password</label><input id="signup-confirm" name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></div><button class="auth-submit" type="submit">Create Captain Account</button><p class="auth-message" id="signup-message" aria-live="polite"></p></form></div></div></section>`;
  }

  function syncCaptainProfile(){
    const profile=window.frontierAuth?.state?.profile;
    if(!profile)return;
    S.profile.name=profile.display_name||S.profile.name;
    if(profile.xp&&typeof profile.xp==="object")S.profile.xp={...S.profile.xp,...profile.xp};
    S.profile.streak=profile.streak??S.profile.streak;
    S.profile.lastReportDate=profile.last_report_date??S.profile.lastReportDate;
    S.save();
  }

  function setAppVisible(visible){
    document.getElementById("app").classList.toggle("hidden",!visible);
    document.getElementById("sidebar-scrim").classList.toggle("hidden",!visible);
  }

  function renderAuth(){
    setAppVisible(false);
    let gate=document.getElementById("auth-root");
    if(!gate){gate=document.createElement("div");gate.id="auth-root";document.body.prepend(gate)}
    gate.innerHTML=authMarkup();
    bindAuth();
  }

  function removeAuth(){document.getElementById("auth-root")?.remove();setAppVisible(true)}

  function bindAuth(){
    document.querySelectorAll("[data-auth-tab]").forEach(button=>button.addEventListener("click",()=>{
      const mode=button.dataset.authTab;
      document.querySelectorAll("[data-auth-tab]").forEach(x=>x.classList.toggle("active",x===button));
      document.getElementById("signin-form").hidden=mode!=="signin";
      document.getElementById("signup-form").hidden=mode!=="signup";
    }));

    document.getElementById("signin-form")?.addEventListener("submit",async event=>{
      event.preventDefault();const form=event.currentTarget,button=form.querySelector("button[type=submit]"),message=document.getElementById("signin-message");
      button.disabled=true;message.className="auth-message";message.textContent="Retrieving Captain record…";
      try{const fd=new FormData(form);await frontierAuth.signIn(fd.get("email").trim(),fd.get("password"));message.className="auth-message success";message.textContent="Record retrieved."}
      catch(error){message.className="auth-message error";message.textContent=error.message||"Sign in failed."}
      finally{button.disabled=false}
    });

    document.getElementById("signup-form")?.addEventListener("submit",async event=>{
      event.preventDefault();const form=event.currentTarget,button=form.querySelector("button[type=submit]"),message=document.getElementById("signup-message"),fd=new FormData(form);
      const password=fd.get("password"),confirm=fd.get("confirmPassword");
      if(password!==confirm){message.className="auth-message error";message.textContent="The passwords do not match.";return}
      button.disabled=true;message.className="auth-message";message.textContent="Establishing Captain record…";
      try{const data=await frontierAuth.signUp(fd.get("email").trim(),password,fd.get("displayName").trim());if(data.session){message.className="auth-message success";message.textContent="Captain record established."}else{message.className="auth-message success";message.textContent="Check your email to confirm your account, then return here to sign in.";form.reset()}}
      catch(error){message.className="auth-message error";message.textContent=error.message||"Account creation failed."}
      finally{button.disabled=false}
    });
  }

  function render(){
    const auth=window.frontierAuth?.state;
    if(!auth?.ready){setAppVisible(false);return}
    if(!auth.session){renderAuth();return}
    removeAuth();syncCaptainProfile();
    const route=FrontierRouter.current();
    document.body.dataset.realm=route;
    document.getElementById("view").innerHTML=FrontierViews[route]();
    document.getElementById("captain-chip-name").textContent=S.profile.name;
    const [title,subtitle]=routeLabels[route]||routeLabels.threshold;document.getElementById("realm-title").textContent=title;document.getElementById("realm-subtitle").textContent=subtitle;
    document.querySelectorAll(".realm-nav [data-route],.mobile-nav [data-route]").forEach(b=>{const target=b.dataset.route;const active=target===route||(navGroups[target]||[]).includes(route);b.classList.toggle("active",active)});
    bind();closeMenu();document.getElementById("view").focus({preventScroll:true});
  }

  function bind(){
    document.querySelectorAll("[data-mission]").forEach(box=>box.addEventListener("change",()=>{const m=S.missions.find(x=>x.id===box.dataset.mission);m.done=box.checked;if(m.done&&!m.awarded){S.profile.xp[m.category]+=m.xp;m.awarded=true}if(!m.done&&m.awarded){S.profile.xp[m.category]=Math.max(0,S.profile.xp[m.category]-m.xp);m.awarded=false}S.save();render()}));
    document.querySelectorAll("[data-quest]").forEach(box=>box.addEventListener("change",()=>{const [group,id]=box.dataset.quest.split(":");const q=S.quests[group].find(x=>x.id===id);q.done=box.checked;if(q.done&&!q.awarded){S.profile.xp[q.cat]+=xpByGroup[group];q.awarded=true}if(!q.done&&q.awarded){S.profile.xp[q.cat]=Math.max(0,S.profile.xp[q.cat]-xpByGroup[group]);q.awarded=false}S.save();render()}));
    document.getElementById("reroll")?.addEventListener("click",()=>{S.missions=S.missions.map(m=>m.done?m:(()=>{const [text,xp]=S.pick(S.pool[m.category]);return{id:S.uid(),category:m.category,text,xp,done:false,awarded:false}})());S.save();render();toast("Unfinished objectives rerolled.")});
    document.getElementById("report-day")?.addEventListener("click",()=>{const status=document.getElementById("report-status");if(S.profile.lastReportDate===S.today){status.textContent="Today's report is already filed.";return}const done=S.missions.filter(m=>m.done).length,all=done===S.missions.length&&S.missions.length>0;S.profile.streak=all?(S.profile.lastReportDate===yesterday(S.today)?S.profile.streak+1:1):0;S.profile.lastReportDate=S.today;S.archive.push({id:S.uid(),type:"day-report",date:S.today,text:`${done} of ${S.missions.length} objectives resolved.`});S.save();status.textContent=`${done} of ${S.missions.length} objectives resolved. Record preserved.`;toast("Day report filed.")});
    document.getElementById("save-log")?.addEventListener("click",()=>{const report=document.getElementById("log-report").value.trim();if(!report){toast("Add a field report first.");return}const entry={id:S.uid(),date:new Date().toLocaleString(),location:document.getElementById("log-location").value.trim(),status:document.getElementById("log-status").value,report,victory:document.getElementById("log-victory").value.trim(),obstacle:document.getElementById("log-obstacle").value.trim(),tomorrow:document.getElementById("log-tomorrow").value.trim()};S.logs.push(entry);S.archive.push({...entry,type:"log"});S.save();render();toast("Captain's Log recorded.")});
    document.getElementById("export-data")?.addEventListener("click",()=>FrontierStorage.exportAll(S));document.getElementById("export-data-book")?.addEventListener("click",()=>FrontierStorage.exportAll(S));
  }

  FrontierRouter.init(render);
  document.getElementById("mobile-menu-button")?.addEventListener("click",()=>{const open=document.body.classList.toggle("menu-open");document.getElementById("mobile-menu-button").setAttribute("aria-expanded",String(open));document.getElementById("sidebar-scrim").toggleAttribute("hidden",!open)});
  document.getElementById("sidebar-scrim")?.addEventListener("click",closeMenu);
  document.getElementById("signout-button")?.addEventListener("click",async()=>{try{await frontierAuth.signOut();toast("Captain record secured.")}catch(error){toast(error.message||"Sign out failed.")}});
  window.addEventListener("frontier-auth-changed",render);
  if(!location.hash)location.hash="#/threshold";
  render();
  if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
})();

