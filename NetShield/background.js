// Filnavn: background.js
// Version 8.1 - Total Separation (Den Endelige Arkitektur)

// Importerer de LOKALE, lister
import { blockedSites as localRegexBlockedSites } from './blocked_sites.js';
import { allowedSites as localAllowedSites } from './allowed_sites.js';
import { forceBlockSites } from './force_block_sites.js';
import { blockedImageKeywords } from './blocked_images_keywords.js';

// Kører når extension installeres, opdateres, eller når noge på google admin ændrer indstillinger
chrome.runtime.onInstalled.addListener(() => {
  console.log("NetShield (v8.1 - nu bedre) er installeret.");
  updateBlockingRules();
});
chrome.storage.managed.onChanged.addListener(() => {
    console.log("Admin har ændret indstillingerne. Opdaterer regler...");
    updateBlockingRules();
});
chrome.alarms.create('update-lists-alarm', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(() => updateBlockingRules());

// Funktion til at hente en simpel liste. Returnerer altid en liste (array).
async function fetchRemoteList(url) {
  if (!url || !url.startsWith('http')) { return []; }
  try {
    const response = await fetch(url);
    if (!response.ok) { return []; }
    const text = await response.text();
    if (!text.trim()) { return []; }
    return text.split('\n').map(s => s.trim()).filter(Boolean);
  } catch (error) {
    console.error(`Netværksfejl ved hentning af ${url}:`, error);
    return [];
  }
}

// Hovedfunktionen, der bygger og anvender alle regler
async function updateBlockingRules() {
  console.log("Opdaterer alle regelsæt med Total Separation Arkitekt...");

  // HENT DE ADMIN-DEFINEREDE URL'er FRA storage.managed
  const settings = await chrome.storage.managed.get({
    remoteBlocklistUrl: '',
    remoteAllowlistUrl: ''
  });
  
  // Hent Claus' lister fra de URL'er, han har indtastet
  const [ remoteSimpleBlockedSites, remoteSimpleAllowedSites ] = await Promise.all([
    fetchRemoteList(settings.remoteBlocklistUrl),
    fetchRemoteList(settings.remoteAllowlistUrl)
  ]);
  
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  if (oldRules.length > 0) {
    const oldRuleIds = oldRules.map(rule => rule.id);
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: oldRuleIds });
  }

  let nextId = 1;

  // Regel-sæt #1: DIN LOKALE BLOKERING (Bruger kraftfuld Regex)
  const newRegexBlockingRules = localRegexBlockedSites.map(site => ({
    id: nextId++, priority: 1, action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
    condition: { regexFilter: `.*${site}.*`, resourceTypes: ['main_frame'] }
  }));
  
  // Regel-sæt #2: CLAUS' FJERNSTYREDE BLOKERING (Bruger simpel, sikker urlFilter)
  const newSimpleBlockingRules = remoteSimpleBlockedSites.map(site => ({
    id: nextId++, priority: 1, action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
    condition: { urlFilter: `*${site}*`, resourceTypes: ['main_frame'] }
  }));

  // Regel-sæt #3: DIN LOKALE HVIDLISTE (Bruger sikker urlFilter)
  const newLocalAllowRules = localAllowedSites.map(site => ({
    id: nextId++, priority: 2, action: { type: 'allow' },
    condition: { urlFilter: `*${site}*`, resourceTypes: ['main_frame'] }
  }));
  
  // Regel-sæt #4: CLAUS' FJERNSTYREDE HVIDLISTE (Bruger sikker urlFilter)
  const newRemoteAllowRules = remoteSimpleAllowedSites.map(site => ({
    id: nextId++, priority: 2, action: { type: 'allow' },
    condition: { urlFilter: `*${site}*`, resourceTypes: ['main_frame'] }
  }));

  // Regel-sæt #5 & #6: De 100% lokale special-lister (uændret)
  const newForceBlockingRules = forceBlockSites.map(site => ({
    id: nextId++, priority: 3, action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
    condition: { urlFilter: `*${site}*`, resourceTypes: ['main_frame'] }
  }));

  const newImageBlockingRules = blockedImageKeywords.map(keyword => ({
    id: nextId++, priority: 1, action: { type: 'block' },
    condition: { regexFilter: `.*${keyword}.*`, resourceTypes: ['image'] }
  }));

  // Saml ALLE de separate regelsæt
  const allRules = [
      ...newRegexBlockingRules, ...newSimpleBlockingRules,
      ...newLocalAllowRules, ...newRemoteAllowRules,
      ...newForceBlockingRules, ...newImageBlockingRules
  ];

  if (allRules.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({ addRules: allRules });
    console.log("SUCCESS: Alle separate regelsæt er blevet opdateret!");
    console.log(`Lokale Regex Blokeringer: ${newRegexBlockingRules.length}, Admin's Simple Blokeringer: ${remoteSimpleBlockedSites.length}`);
    console.log(`Lokale Hvidlister: ${newLocalAllowRules.length}, Admin's Simple Hvidlister: ${remoteSimpleAllowedSites.length}`);
  }
}