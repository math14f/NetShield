// Filnavn: force_block_sites.js
// Mønstre på denne liste vinder ALTID, selv over hvidlisten.

export const forceBlockSites = [
  // Bloker Google-søgninger, der indeholder vores mest aggressive nøgleord af hvad jeg må finde
  "google\\.com/search\\?.*(proxy|porn|xxx|unblock)",

  // Bloker specifikke Google-tjenester, vi ikke vil have som ai
  "gemini\\.google\\.com",
  "aistudio\\.google\\.com",
  
  // i kan spøger om hvad der skal tilføje som flere ultra-vigtige blokerings-mønstre her
];
