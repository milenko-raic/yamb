(()=>{
  const app=document.getElementById("app");
  document.addEventListener("dragstart",event=>{if(event.target?.closest?.("#app img:not([draggable='true'])"))event.preventDefault();},{capture:true});
  document.addEventListener("keydown",event=>{if(event.key!=="Escape")return;document.querySelectorAll(".modal.show").forEach(modal=>modal.querySelector(".modal-close,button")?.focus?.());});
  if(app)app.addEventListener("contextmenu",()=>{}, {passive:true});
})();
