(()=>{
  const CATS = ["engineering","science","exploration","community","creativity","vitality"];
  const labels = {engineering:"Engineering",science:"Science",exploration:"Exploration",community:"Community",creativity:"Creativity",vitality:"Vitality"};
  const colors = {engineering:"var(--amber-bright)",science:"var(--teal-bright)",exploration:"var(--teal-bright)",community:"var(--amber-bright)",creativity:"var(--teal-bright)",vitality:"var(--amber-bright)"};
  const pool = {
    engineering:[["Make measurable progress on today's CAD or design task",35],["Resolve one technical uncertainty",30],["Learn one new function in a tool you use",25]],
    science:[["Read one research article or chapter",30],["Record one observation about the natural world",15],["Investigate the why behind something you noticed",20]],
    exploration:[["Take a route you have never taken",25],["Visit somewhere new for twenty minutes",30],["Photograph interesting infrastructure or nature",15]],
    community:[["Have a real conversation about someone's work",20],["Help someone with something small",20],["Reach out to someone you value",25]],
    creativity:[["Write, sketch, or build for fifteen minutes",25],["Add to a personal project",30],["Freewrite for ten minutes",20]],
    vitality:[["Get outside for fifteen minutes",15],["Cook yourself a real meal",20],["Move your body for twenty minutes",25]]
  };
  const key = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const uid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];
  const today = key(new Date());
  const baseQuests = {};
  for(const [group, items] of Object.entries(FRONTIER_CAMPAIGN.quests)){
    baseQuests[group] = items.map(([text,cat],i)=>({id:`${group}-${i}`,text,cat,done:false,awarded:false}));
  }
  const defaults = {
    profile:{name:FRONTIER_CAMPAIGN.captain,xp:Object.fromEntries(CATS.map(c=>[c,0])),streak:0,lastReportDate:null},
    quests:baseQuests,
    logs:[],
    archive:[],
    missions:CATS.map(category=>{const [text,xp]=pick(pool[category]);return{id:uid(),category,text,xp,done:false,awarded:false}})
  };
  const state = {
    profile:FrontierStorage.get("frontier:v2:profile",defaults.profile),
    quests:FrontierStorage.get("frontier:v2:quests",defaults.quests),
    logs:FrontierStorage.get("frontier:v2:logs",defaults.logs),
    archive:FrontierStorage.get("frontier:v2:archive",defaults.archive),
    missions:FrontierStorage.get(`frontier:v2:missions:${today}`,defaults.missions),
    today, cats:CATS, labels, colors, pool, uid, pick
  };
  CATS.forEach(c => state.profile.xp[c] ??= 0);
  state.save = ()=>{
    FrontierStorage.set("frontier:v2:profile",state.profile);
    FrontierStorage.set("frontier:v2:quests",state.quests);
    FrontierStorage.set("frontier:v2:logs",state.logs);
    FrontierStorage.set("frontier:v2:archive",state.archive);
    FrontierStorage.set(`frontier:v2:missions:${today}`,state.missions);
  };
  window.FrontierState = state;
})();
