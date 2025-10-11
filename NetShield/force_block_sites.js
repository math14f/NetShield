// Filnavn: force_block_sites.js
// Dette er FORCE-BLOCK listen.
// Sider på denne liste vil ALTID blive blokeret, selvom
// en del af deres domæne (f.eks. "google.com") er på hvidlisten.

export const forceBlockSites = [
  // AI-værktøjer fra Google
  "gemini.google.com",
  "aistudio.google.com",

  // Andre eksempler (hvis man f.eks. vil tillade YouTube, men ikke YouTube Music)
  // "music.youtube.com"
];