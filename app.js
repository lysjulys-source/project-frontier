(()=>{
  const S = FrontierState;
  const xpByGroup={arcs:120,side:60,legendary:250};
  const routeLabels={threshold:["THE THRESHOLD","ENTER THE LIVING WORLD"],"mission-control":["MISSION CONTROL","DAILY OPERATIONS"],contents:["THE CODEX","PURPOSE, QUESTS, AND KNOWLEDGE"],chapter:["THE CODEX","CURRENT CHAPTER"],quests:["THE CODEX","QUEST JOURNAL"],character:["CHARACTER","WHO THE CAPTAIN IS BECOMING"],log:["CAPTAIN'S LOG","THE PERSISTENT RECORD"],archive:["ARCHIVE","WHAT HAS ALREADY BEEN LIVED"],sanctuary:["SANCTUARY","RECOVERY AND REFLECTION"],observatory:["OBSERVATORY","PATTERNS ACROSS TIME"],atlas:["ATLAS","PEOPLE, PLACES, AND PROJECTS"],settings:["SETTINGS","SYSTEM GOVERNANCE"]};
  const navGroups={contents:["contents","chapter","quests"],character:["character"],archive:["archive"],log:["log"]};
  const yesterday=k=>{const d=new Date(k+"T12:00:00");d.setDate(d.getDate()-1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
  const toast=text=>{const node=document.getElementById("toast-template").content.firstElementChild.cloneNode(true);node.textContent=text;document.body.append(node);setTimeout(()=>node.remove(),2600)};
  const closeMenu=()=>{document.body.classList.remove("menu-open");document.getElementById("mobile-menu-button")?.setAttribute("aria-expanded","false");document.getElementById("sidebar-scrim")?.setAttribute("hidden","")};
  function render(){
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
  if(!location.hash)location.hash="#/threshold";else render();
  if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
