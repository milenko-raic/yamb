export const pwa={
  installPrompt:null,
  installed:matchMedia('(display-mode: standalone)').matches,
  async register(){
    if('serviceWorker' in navigator){
      try{await navigator.serviceWorker.register('./sw.js',{scope:'./'});}catch(error){console.warn('Service worker registration failed',error);}
    }
    addEventListener('beforeinstallprompt',event=>{event.preventDefault();this.installPrompt=event;dispatchEvent(new CustomEvent('yamb:installable'));});
    addEventListener('appinstalled',()=>{this.installed=true;this.installPrompt=null;dispatchEvent(new CustomEvent('yamb:installed'));});
  },
  async install(){
    if(!this.installPrompt)return false;
    const event=this.installPrompt;this.installPrompt=null;await event.prompt();const choice=await event.userChoice;return choice?.outcome==='accepted';
  }
};
