window.FrontierRouter = {
  routes: new Set(["threshold","cover","contents","chapter","quests","character","mission-control","log","archive","sanctuary","observatory","atlas","settings"]),
  current() {
    const raw = location.hash.replace(/^#\/?/, "") || "threshold";
    const route = raw === "cover" ? "threshold" : raw;
    return this.routes.has(route) ? route : "threshold";
  },
  go(route) { location.hash = `#/${route === "cover" ? "threshold" : route}`; },
  init(render) {
    window.addEventListener("hashchange", render);
    document.addEventListener("click", e=>{
      const trigger = e.target.closest("[data-route]");
      if(trigger) this.go(trigger.dataset.route);
    });
  }
};
