const dictionaries={
  en:{menu:'MENU',game:'GAME',match:'MATCH',rules:'RULES',settings:'Settings',profiles:'Profiles',saves:'Saved games',timeline:'Timeline',leaderboards:'Leaderboards',achievements:'Achievements'},
  bs:{menu:'MENI',game:'IGRA',match:'MEČ',rules:'PRAVILA',settings:'Postavke',profiles:'Profili',saves:'Spremljene igre',timeline:'Tok igre',leaderboards:'Rang lista',achievements:'Dostignuća'},
  sv:{menu:'MENY',game:'SPEL',match:'MATCH',rules:'REGLER',settings:'Inställningar',profiles:'Profiler',saves:'Sparade spel',timeline:'Tidslinje',leaderboards:'Topplista',achievements:'Prestationer'}
};
export function createI18n(persistence){
  let language=persistence.getSync('preferences.language','en');
  if(!dictionaries[language])language='en';
  return {
    get language(){return language;},
    setLanguage(value){language=dictionaries[value]?value:'en';persistence.set('preferences.language',language);this.apply();},
    t(key){return dictionaries[language]?.[key]||dictionaries.en[key]||key;},
    apply(){
      document.documentElement.lang=language;
      const map={gameMenuBtn:'menu'};
      for(const [id,key] of Object.entries(map)){
        const node=document.getElementById(id);const span=node?.querySelector('span');if(span)span.textContent=this.t(key);
      }
      document.querySelectorAll('.tabbtn').forEach(btn=>{
        const key={activeBoard:'game',match:'match',rules:'rules'}[btn.dataset.tab];
        if(key){const span=btn.querySelector('span');if(span)span.textContent=this.t(key);}
      });
    }
  };
}
