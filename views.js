(()=>{
  const S = ()=>FrontierState;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const book = (left,right)=>`<section class="codex-stage"><div class="book"><div class="book-spread">
    <article class="book-page left">${left}<span class="page-number">•</span></article>
    <article class="book-page right">${right}<span class="page-number">•</span></article>
  </div></div></section>`;
  const renderCover = ()=>book(
    `<div class="cover-page" style="min-height:570px"><div><div class="cover-emblem"></div><p class="book-kicker">A living record of becoming</p><h1 class="cover-title">Project<br>Frontier</h1><p class="cover-subtitle">${esc(FRONTIER_CAMPAIGN.book)}</p><div class="book-actions"><button class="book-button primary" data-route="contents">Open the Codex</button><button class="book-button" data-route="mission-control">Enter Mission Control</button></div></div></div>`,
    `<p class="book-kicker">Property of</p><h2>${esc(S().profile.name)}</h2><p class="dropcap">This book is not a record of a finished life. It is a field guide written while crossing the frontier itself: one project, one city, one difficult decision, and one act of curiosity at a time.</p><div class="chapter-card"><h3>Current Volume</h3><p>${esc(FRONTIER_CAMPAIGN.book)}</p></div><div class="chapter-card"><h3>Current Chapter</h3><p>${esc(FRONTIER_CAMPAIGN.chapter.number)} — ${esc(FRONTIER_CAMPAIGN.chapter.title)}</p></div>`
  );
  const renderContents = ()=>book(
    `<p class="book-kicker">Contents</p><h1>The Frontier Codex</h1><p>Choose a page. Each section reflects a different part of the same expedition.</p><ul class="toc">
      <li><button data-route="chapter"><strong>Current Chapter</strong><span>01</span></button></li>
      <li><button data-route="quests"><strong>Quest Journal</strong><span>02</span></button></li>
      <li><button data-route="character"><strong>Character Sheet</strong><span>03</span></button></li>
      <li><button data-route="archive"><strong>Expedition Archive</strong><span>04</span></button></li>
    </ul>`,
    `<p class="book-kicker">Systems</p><h2>Beyond the Book</h2><p>The Codex tells the story. Mission Control manages the day-to-day operation.</p><ul class="toc">
      <li><button data-route="mission-control"><strong>Mission Control</strong><span>MC</span></button></li>
      <li><button data-route="log"><strong>Julie's Log</strong><span>JL</span></button></li>
    </ul><div class="chapter-card"><h3>Main Quest</h3><p>${esc(FRONTIER_CAMPAIGN.mainQuest.text)}</p></div>`
  );
  const renderChapter = ()=>book(
    `<p class="book-kicker">${esc(FRONTIER_CAMPAIGN.chapter.number)}</p><h1>${esc(FRONTIER_CAMPAIGN.chapter.title)}</h1><p class="dropcap">${esc(FRONTIER_CAMPAIGN.chapter.summary)}</p><div class="chapter-card"><h3>Central Objective</h3><p>${esc(FRONTIER_CAMPAIGN.chapter.objective)}</p></div>`,
    `<p class="book-kicker">Conditions for advancement</p><h2>What This Chapter Asks</h2>${FRONTIER_CAMPAIGN.chapter.conditions.map((x,i)=>`<div class="quest-paper"><small>Milestone ${i+1}</small><p>${esc(x)}</p></div>`).join("")}<div class="book-actions"><button class="book-button" data-route="quests">Open Quest Journal</button></div>`
  );
  const questGroup = (title,key,xp)=>`<h3>${title}</h3>${S().quests[key].map(q=>`<div class="quest-paper ${q.done?"done":""}"><label><input type="checkbox" data-quest="${key}:${q.id}" ${q.done?"checked":""}><span><small>${esc(S().labels[q.cat])} · ${xp} XP</small>${esc(q.text)}</span></label></div>`).join("")}`;
  const renderQuests = ()=>book(
    `<p class="book-kicker">Quest Journal</p><h1>The Work Ahead</h1><div class="chapter-card"><h3>Main Quest</h3><p>${esc(FRONTIER_CAMPAIGN.mainQuest.text)}</p></div>${questGroup("Story Arcs","arcs",120)}`,
    `${questGroup("Side Quests","side",60)}${questGroup("Legendary Quests","legendary",250)}`
  );
  const renderCharacter = ()=>{
    const rows=S().cats.map(c=>{const xp=S().profile.xp[c],pct=xp%100;return `<tr><td><strong>${esc(S().labels[c])}</strong><div class="skill-meter"><span style="width:${pct}%"></span></div></td><td>Lv. ${Math.floor(xp/100)+1}</td><td>${xp} XP</td></tr>`}).join("");
    return book(`<p class="book-kicker">Character Sheet</p><h1>${esc(S().profile.name)}</h1><p>A multidisciplinary explorer developing practical competence, intellectual range, creative courage, and the stamina to continue.</p><div class="chapter-card"><h3>Current Title</h3><p>Engineer at the Threshold</p></div>`,`<h2>Disciplines</h2><table class="skill-table">${rows}</table>`);
  };
  const rings = ()=>S().cats.map(c=>{const xp=S().profile.xp[c];return `<div class="ring-row"><div class="ring" style="--pct:${xp%100};--ring-color:${S().colors[c]}"><span>${Math.floor(xp/100)+1}</span></div><div class="ring-info"><strong>${S().labels[c]}</strong><small>${xp} XP · ${100-(xp%100)} TO NEXT LEVEL</small></div></div>`}).join("");
  const missions = ()=>S().missions.map(m=>`<label class="mission-card"><input type="checkbox" data-mission="${m.id}" ${m.done?"checked":""}><span><span class="mission-meta">${esc(S().labels[m.category])}</span><span class="mission-label ${m.done?"done":""}">${esc(m.text)}</span></span><span class="mission-xp">+${m.xp}</span></label>`).join("");
  const renderControl = ()=>`<section class="control-stage"><div class="control-grid"><aside>
    <section class="control-panel pad"><h2 class="panel-title">Discipline Status</h2><div class="ring-list">${rings()}</div></section>
    <section class="control-panel pad"><h2 class="panel-title">Campaign Status</h2><div class="metric-grid"><div class="metric"><strong>${S().profile.streak}</strong><small>Day streak</small></div><div class="metric"><strong>${S().missions.filter(m=>m.done).length}/${S().missions.length}</strong><small>Orders</small></div><div class="metric"><strong>${S().logs.length}</strong><small>Logs</small></div></div></section>
  </aside><div>
    <section class="control-panel system-hero"><span class="eyebrow">Mission Control · ${esc(S().today)}</span><h1>Good day, ${esc(S().profile.name)}.</h1><p>Your current expedition is not about doing everything. It is about protecting the foundation while continuing to move toward a larger life.</p><div class="status-row"><span class="status-pill">SYSTEM: OPERATIONAL</span><span class="status-pill">CHAPTER: I</span><span class="status-pill">SYNC: LOCAL</span></div></section>
    <section class="control-panel pad"><h2 class="panel-title">Today's Orders</h2><div id="mission-list">${missions()}</div><div class="action-row"><button class="ui-button" id="reroll">Reroll Unfinished</button><button class="ui-button primary" id="report-day">End Day & Report</button></div><p id="report-status" class="muted"></p></section>
    <section class="control-panel pad"><h2 class="panel-title">AI Briefing</h2><div class="briefing"><h3>Hold the center.</h3><p>Complete one meaningful professional action, one act of personal maintenance, and one small action that keeps the wider expedition alive. AI-generated briefings will replace this placeholder after Supabase and the Frontier AI function are connected.</p></div></section>
  </div></div></section>`;
  const renderLog = ()=>`<section class="control-stage"><div class="view-wrap" style="padding-top:0"><section class="log-console"><div class="console-head"><span>JULIE'S LOG</span><span>STARDATE ${new Date().getFullYear()}.${String(Math.ceil((new Date()-new Date(new Date().getFullYear(),0,0))/86400000)).padStart(3,"0")}</span></div>
    <div class="field-grid">
      <div class="console-field"><label for="log-location">Location</label><input id="log-location" maxlength="100" placeholder="Philadelphia"></div>
      <div class="console-field"><label for="log-status">Current state</label><select id="log-status"><option>Operational</option><option>Focused</option><option>Tired</option><option>Overwhelmed</option><option>Hopeful</option><option>Resting</option></select></div>
      <div class="console-field full"><label for="log-report">Field report</label><textarea id="log-report" maxlength="5000" placeholder="What happened today? What mattered?"></textarea></div>
      <div class="console-field"><label for="log-victory">Victory</label><input id="log-victory" maxlength="220" placeholder="One thing that went right"></div>
      <div class="console-field"><label for="log-obstacle">Obstacle</label><input id="log-obstacle" maxlength="220" placeholder="One difficulty or unresolved thread"></div>
      <div class="console-field full"><label for="log-tomorrow">Tomorrow's intention</label><input id="log-tomorrow" maxlength="220" placeholder="The next useful action"></div>
    </div><div class="action-row"><button class="ui-button solid" id="save-log">Record Entry</button><button class="ui-button" id="export-data">Export Data</button></div>
  </section><section class="control-panel pad" style="margin-top:18px"><h2 class="panel-title">Recent Logs</h2>${S().logs.slice().reverse().slice(0,5).map(x=>`<article class="archive-entry"><time>${esc(x.date)} · ${esc(x.location||"Location unrecorded")} · ${esc(x.status)}</time><p>${esc(x.report)}</p></article>`).join("")||'<p class="empty-state">No log entries yet.</p>'}</section></div></section>`;
  const renderArchive = ()=>book(
    `<p class="book-kicker">Expedition Archive</p><h1>What Has Been Lived</h1><p>The archive gathers completed quests, day reports, and Julie's Log entries. Supabase will later make this searchable across devices.</p><div class="book-actions"><button class="book-button" id="export-data-book">Export Archive</button></div>`,
    `<h2>Recent Entries</h2>${S().logs.slice().reverse().slice(0,8).map(x=>`<div class="quest-paper"><small>${esc(x.date)} · ${esc(x.location||"Unrecorded location")}</small><p>${esc(x.report)}</p></div>`).join("")||'<p>No entries have been bound into the archive yet.</p>'}`
  );
  window.FrontierViews={cover:renderCover,contents:renderContents,chapter:renderChapter,quests:renderQuests,character:renderCharacter,"mission-control":renderControl,log:renderLog,archive:renderArchive};
})();
