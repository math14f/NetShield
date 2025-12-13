// Copyright (c) 2025 Mathias Andersen - All Rights Reserved
// NetShield - Under MIT License
// Filnavn: background.js
// Version 8.2 - Med Admin Kontrol og Prioritetssystem

// Importerer de LOKALE lister
import { blockedSites as localRegexBlockedSites } from './blocked_sites.js';
import { allowedSites as localAllowedSites } from './allowed_sites.js';
import { forceBlockSites } from './force_block_sites.js';
import { blockedImageKeywords } from './blocked_images_keywords.js';

// Kører når extension installeres, opdateres, eller når IT ændrer indstillinger
chrome.runtime.onInstalled.addListener(() => {
  console.log("NetShield (v3.4) er installeret. Opbygger regler...");
  updateBlockingRules();
});

// Lytter efter ændringer fra Google Admin Console
chrome.storage.managed.onChanged.addListener(() => {
    console.log("Admin har ændret indstillingerne. Opdaterer regler...");
    updateBlockingRules();
});

// Opdaterer automatisk hver time (hvis listerne på nettet ændres)
chrome.alarms.create('update-lists-alarm', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(() => updateBlockingRules());

// Hjælpe-funktion til at hente en tekstfil fra nettet (GitHub/Drive)
async function fetchRemoteList(url) {
  if (!url || !url.startsWith('http')) { return []; }
  try {
    const response = await fetch(url);
    if (!response.ok) { return []; }
    const text = await response.text();
    // Deler ved linjeskift og fjerner tomme linjer
    if (!text.trim()) { return []; }
    return text.split('\n').map(s => s.trim()).filter(Boolean);
  } catch (error) {
    console.error(`NetShield: Kunne ikke hente liste fra ${url}:`, error);
    return [];
  }
}

// Hovedfunktionen, der bygger alle reglerne
async function updateBlockingRules() {
  console.log("Starter opdatering af regler...");

  // 1. HENT INDSTILLINGER (Fra Google Admin)
  // Vi bruger standardværdier (tomme), hvis Admin ikke har sat noget endnu
  const settings = await chrome.storage.managed.get({
    remoteBlocklistUrl: '',      // Link til tekstfil med blokeringer
    remoteAllowlistUrl: '',      // Link til tekstfil med tilladelser
    adminBlockedRegex: [],       // NY: Ord som IT vil blokere (f.eks. "y8100")
    adminSuperAllowlist: []      // NY: Sider som SKAL virke (trumfer alt)
  });
  
  // 2. HENT FJERN-LISTER (Hvis der er links)
  const [ remoteSimpleBlockedSites, remoteSimpleAllowedSites ] = await Promise.all([
    fetchRemoteList(settings.remoteBlocklistUrl),
    fetchRemoteList(settings.remoteAllowlistUrl)
  ]);
  
  // 3. RYD OP I GAMLE REGLER
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  if (oldRules.length > 0) {
    const oldRuleIds = oldRules.map(rule => rule.id);
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: oldRuleIds });
  }

  let nextId = 1;

  // ============================================================
  // BYG REGLERNE (PRIORITETSSYSTEM)
  // ============================================================

  // GRUPPE 1: Standard Blokering (Prioritet 1)
  // Dette er NetShields lokale Regex-liste og Admin's simple fjern-liste
  const rulesStandardBlock = [
      ...localRegexBlockedSites.map(site => ({
        id: nextId++, priority: 1, action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
        condition: { regexFilter: `.*${site}.*`, resourceTypes: ['main_frame'] }
      })),
      ...remoteSimpleBlockedSites.map(site => ({
        id: nextId++, priority: 1, action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
        condition: { urlFilter: `*${site}*`, resourceTypes: ['main_frame'] }
      }))
  ];

  // GRUPPE 2: Standard Hvidliste (Prioritet 2)
  // Tillader skolesider (Aula osv.), selvom de matcher en blokering i gruppe 1
  const rulesStandardAllow = [
      ...localAllowedSites.map(site => ({
        id: nextId++, priority: 2, action: { type: 'allow' },
        condition: { urlFilter: `*${site}*`, resourceTypes: ['main_frame'] }
      })),
      ...remoteSimpleAllowedSites.map(site => ({
        id: nextId++, priority: 2, action: { type: 'allow' },
        condition: { urlFilter: `*${site}*`, resourceTypes: ['main_frame'] }
      }))
  ];

  // GRUPPE 3: Force Block & Admin Regex (Prioritet 3)
  // Denne fanger Proxies og ting IT VIL have blokeret. Vinder over gruppe 2.
  const rulesForceBlock = [
      // RETTELSE: Vi bruger nu 'regexFilter' i stedet for 'urlFilter'
      // Dette gør, at NetShields mønstre som (proxy|porn) faktisk virker!
      ...forceBlockSites.map(site => ({
        id: nextId++, priority: 3, action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
        condition: { regexFilter: site, resourceTypes: ['main_frame'] } 
      })),      // HER ER DEN NYE ADMIN REGEX (som ønske af it)
      ...settings.adminBlockedRegex.map(pattern => ({
        id: nextId++, priority: 3, action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
        condition: { regexFilter: `.*${pattern}.*`, resourceTypes: ['main_frame'] }
      }))
  ];

  // GRUPPE 4: Billed-Blokering (Prioritet 1 - kører separat for billeder)
  const rulesImageBlock = blockedImageKeywords.map(keyword => ({
    id: nextId++, priority: 1, action: { type: 'block' },
    condition: { regexFilter: `.*${keyword}.*`, resourceTypes: ['image'] }
  }));

  // GRUPPE 5: ADMIN SUPER HVIDLISTE (Prioritet 4)
  // Dette løser skole' problem. Hvis IT sætter en side her, så virker den. ALTID.
  const rulesAdminSuperAllow = settings.adminSuperAllowlist.map(site => ({
    id: nextId++, priority: 4, action: { type: 'allow' },
    condition: { urlFilter: `*${site}*`, resourceTypes: ['main_frame'] }
  }));

  // ============================================================
  // UDFØR OPDATERINGEN
  // ============================================================

  const allRules = [
      ...rulesStandardBlock,
      ...rulesStandardAllow,
      ...rulesForceBlock,
      ...rulesImageBlock,
      ...rulesAdminSuperAllow
  ];

  if (allRules.length > 0) {
    try {
        await chrome.declarativeNetRequest.updateDynamicRules({ addRules: allRules });
        console.log(`SUCCESS: NetShield opdateret med ${allRules.length} regler.`);
        console.log(`- Admin Super Allow (P4): ${rulesAdminSuperAllow.length}`);
        console.log(`- Force/Admin Block (P3): ${rulesForceBlock.length}`);
        console.log(`- Standard Allow (P2): ${rulesStandardAllow.length}`);
    } catch (e) {
        console.error("NetShield Fejl: Kunne ikke opdatere regler.", e);
    }
  } else {
      console.log("NetShield: Ingen regler at opdatere (listerne var tomme).");
  }
}
// ============================================================
// LYTTER EFTER "proxy spil og meget mere" (Content Script)
// ============================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // Hvis den siger "proxyDetected"
  if (message.action === "proxyDetected") {
    
    // Tjek at beskeden kommer fra en fane
    if (sender.tab && sender.tab.id) {
      console.log(` NetShield Agent: Aktiv blokering af ${sender.tab.url}`);
      
      // Vi bruger tabs.update til at tvinge fanen over på blocked.html med det samme
      chrome.tabs.update(sender.tab.id, { 
        url: chrome.runtime.getURL("blocked.html") 
      });
    }
  }
});
// ============================================================
// LOKAL FIL-VAGT (Virker UDEN "Allow access to file URLs")
// ============================================================
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  
  // Vi tjekker kun, hvis URL'en har ændret sig eller siden loader
  if (changeInfo.status === 'complete' || changeInfo.url) {
    const url = tab.url.toLowerCase();

    // TJEK 1: Er det en lokal fil? (file://)
    if (url.startsWith('file:')) {
      
      // Liste over ord, der ALDRIG må være i et filnavn på en skolecomputer
      const suspiciousFileNames = [
        'helios',
        'unblock',
        'proxy',
        'browser',
        'offline',
        'ultraviolet',
        'incognito'
      ];

      // Tjek om filnavnet indeholder et af de forbudte ord
      const isSuspicious = suspiciousFileNames.some(word => url.includes(word));

      if (isSuspicious) {
        console.log(`NetShield: Blokerede lokal fil baseret på navnet: ${url}`);
        
        // Luk fanen med det samme (eller send til blocked.html)
        chrome.tabs.update(tabId, { 
          url: chrome.runtime.getURL("blocked.html") 
        });
      }
    }
  }
});
