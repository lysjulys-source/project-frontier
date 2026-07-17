window.FrontierRouter = {
  routes: new Set(["cover","contents","chapter","quests","character","mission-control","log","archive"]),
  current() {
    const route = location.hash.replace(/^#\/?/, "") || "cover";
    return this.routes.has(route) ? route : "cover";
  },
  go(route) {
    location.hash = `#/${route}`;
  },
  init(render) {
    window.addEventListener("hashchange", render);
    document.addEventListener("click", e=>{
      const trigger = e.target.closest("[data-route]");
      if(trigger) this.go(trigger.dataset.route);
    });
  }
};
