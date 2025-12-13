// Filnavn: force_block_sites.js
// Mønstre på denne liste vinder ALTID (Prioritet 3) over Hvidlisten (Prioritet 2).

export const forceBlockSites = [
  // ============================================
  // RETTELSE HER: 
  // Er ændret fra 'google\\.com' til 'google\\..*' 
  // Nu fanger den google.dk, google.se, google.com - ALT.
  // ============================================
  
  // Bloker søgeord i URL'en på ALLE Google-domæner
  ".*google\\..*\\/search\\?.*(proxy|porn|xxx|unblock|vpn|bypass).*",

  // Vi kan lige så godt tage Bing og Yahoo med, når vi er i gang
  ".*bing\\..*\\/search\\?.*(proxy|porn|xxx|unblock).*",
  ".*yahoo\\..*\\/search\\?.*(proxy|porn|xxx|unblock).*",

  // Bloker specifikke Google-tjenester (AI)
  "gemini\\.google\\.com",
  "aistudio\\.google\\.com",
  "bard\\.google\\.com",
  
  // Sikring mod oversættelses-proxies (Google Translate som proxy)
  "translate\\.google\\..*\\?.*u=.*"
];
