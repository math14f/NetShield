// Copyright (c) 2026 Mathias Andersen - All Rights Reserved
// NetShield - Under MIT License
// Filnavn: background.js
// NS-CANARY-ID: 7b8f-9a2c-7r5e-bf63-8201-THISTED-SHIELD
// Version 3.9 - Optimeret med CSV-Sync, Forbedret DNR & about:blank Vagt

import { blockedSites as localRegexBlockedSites } from './blocked_sites.js';
import { allowedSites as localAllowedSites } from './allowed_sites.js';
import { forceBlockSites } from './force_block_sites.js';
import { blockedImageKeywords } from './blocked_images_keywords.js';

let isRelaxTimeGlobal = false;
let notifiedBreakEndMins = -1;
let cachedRemoteBlocks = [];
let cachedRemoteAllows = [];
let cachedAdminSuperAllowlist = [];
let lastFetchTime = 0;
let isUpdatingRules = false;
let pendingUpdate = false;

chrome.runtime.onInstalled.addListener(() => {
  console.log("NetShield (v3.8) er installeret. Opbygger regler...");
  updateBlockingRules();
});

chrome.runtime.onStartup.addListener(() => {
  console.log("NetShield starter op. Genopbygger regler...");
  updateBlockingRules();
});


updateBlockingRules();

chrome.storage.managed.onChanged.addListener(() => {
    console.log("Admin har ændret indstillingerne. Opdaterer regler...");
    lastFetchTime = 0;
    updateBlockingRules();
});

// Alarm hvert minut for præcis start/stop af pauser
chrome.alarms.create('update-lists-alarm', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(() => updateBlockingRules());

// =================================================
// CSV SYNC: Lynhurtig synkronisering af fjernstyrede lister
// =================================================

async function getCachedRemoteLists(blockUrl, allowUrl) {
    const now = Date.now();
    if (now - lastFetchTime > 5 * 60 * 1000) {
        // Hent begge lister parallelt for hastighed
        const [blocks, allows] = await Promise.all([
            fetchRemoteList(blockUrl),
            fetchRemoteList(allowUrl)
        ]);
        cachedRemoteBlocks = blocks;
        cachedRemoteAllows = allows;
        lastFetchTime = now;
        console.log(`NetShield CSV-Sync: Hentet ${blocks.length} blokeringer og ${allows.length} tilladelser.`);
    }
    return [cachedRemoteBlocks, cachedRemoteAllows];
}

async function fetchRemoteList(url) {
  if (!url || !url.startsWith('http')) return [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 sek timeout
    
    const response = await fetch(url, { 
        signal: controller.signal,
        cache: 'no-cache' // Undgå gammel cache
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) return [];
    const text = await response.text();
    if (!text.trim()) return [];
    
    // Understøt både CSV (komma-separeret) og newline-separeret
    return text.split(/[\n,]/)
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('#') && !s.startsWith('//')); // Spring kommentarer over
  } catch (error) {
    if (error.name !== 'AbortError') {
        console.warn("NetShield: Fejl ved hentning af fjernliste:", error.message);
    }
    return [];
  }
}


async function getNetworkTime() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch("https://www.google.com", { 
            method: 'HEAD', 
            cache: 'no-store',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        const serverDate = response.headers.get('date');
        if (serverDate) return new Date(serverDate);
    } catch (error) {
        // Stille fallback - ingen spam i konsollen
    }
    return new Date();
}



async function updateBlockingRules() {
  if (isUpdatingRules) {
      pendingUpdate = true;
      return;
  }
  isUpdatingRules = true;
  try {
      await performUpdateBlockingRules();
  } finally {
      isUpdatingRules = false;
      if (pendingUpdate) {
          pendingUpdate = false;
          setTimeout(updateBlockingRules, 50);
      }
  }
}

async function performUpdateBlockingRules() {
  let settings = {};
  try {
      settings = await chrome.storage.managed.get({
        remoteBlocklistUrl: '',
        remoteAllowlistUrl: '',
        adminBlockedRegex: [],
        adminSuperAllowlist: [],
        allowanceWindows: []
      });
  } catch(e) {
      // Managed storage ikke tilgængelig (ikke enterprise-styret)
      settings = {
          remoteBlocklistUrl: '',
          remoteAllowlistUrl: '',
          adminBlockedRegex: [],
          adminSuperAllowlist: [],
          allowanceWindows: []
      };
  }
  
  cachedAdminSuperAllowlist = settings.adminSuperAllowlist || [];
  
  const [remoteSimpleBlockedSites, remoteSimpleAllowedSites] = await getCachedRemoteLists(
      settings.remoteBlocklistUrl, 
      settings.remoteAllowlistUrl
  );

  // --- TIDSSTYRING (GOLDEN HOURS) ---
  const now = await getNetworkTime();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  let isRelaxTime = false;
  let currentBreakEndMins = -1;

  if (settings.allowanceWindows && settings.allowanceWindows.length > 0) {
      settings.allowanceWindows.forEach(win => {
          if (!win.start || !win.end) return;
          const [sH, sM] = win.start.split(':').map(Number);
          const [eH, eM] = win.end.split(':').map(Number);
          const startMins = sH * 60 + sM;
          const endMins = eH * 60 + eM;

          if (currentMinutes >= startMins && currentMinutes <= endMins) {
              isRelaxTime = true;
              currentBreakEndMins = endMins;
          }
      });
  }
  
  isRelaxTimeGlobal = isRelaxTime;

  // 5-minutters advarsel
  if (isRelaxTime) {
      const timeLeft = currentBreakEndMins - currentMinutes;
      if (timeLeft === 5 && notifiedBreakEndMins !== currentBreakEndMins) {
          chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icon128.png',
              title: 'NetShield: Pausen slutter snart!',
              message: 'Der er 5 minutter til pausen slutter. Husk at gemme dit spil og gør dig klar til undervisning.',
              priority: 2
          });
          notifiedBreakEndMins = currentBreakEndMins;
      }
  }

  // Ryd op i gamle regler
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  if (oldRules.length > 0) {
    const oldRuleIds = oldRules.map(rule => rule.id);
    await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: oldRuleIds });
  }

  let nextId = 1;

  // =============================================
  // PRIORITET 1: Standard Blokering - DEAKTIVERES I PAUSER
  // =============================================
  const rulesStandardBlock = isRelaxTime ? [] : [
      ...localRegexBlockedSites.map(site => ({
        id: nextId++, priority: 1, 
        action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
        condition: { regexFilter: `.*${site}.*`, resourceTypes: ['main_frame'] }
      })),
      ...remoteSimpleBlockedSites.map(site => ({
        id: nextId++, priority: 1, 
        action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
        condition: { urlFilter: `*${site}*`, resourceTypes: ['main_frame'] }
      }))
  ];

  // =============================================
  // PRIORITET 2: Standard Hvidliste
  // =============================================
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

  // =============================================
  // PRIORITET 3: Force Block - ALTID AKTIV (Proxies, Søgninger)
  // =============================================
  const rulesForceBlock = [
      ...forceBlockSites.map(site => ({
        id: nextId++, priority: 3, 
        action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
        condition: { regexFilter: site, resourceTypes: ['main_frame'] } 
      })),
      ...settings.adminBlockedRegex.map(pattern => ({
        id: nextId++, priority: 3, 
        action: { type: 'redirect', redirect: { extensionPath: '/blocked.html' } },
        condition: { regexFilter: `.*${pattern}.*`, resourceTypes: ['main_frame'] }
      }))
  ];

  // =============================================
  // PRIORITET 1: Billed-Blokering - DEAKTIVERES I PAUSER
  // =============================================
  const rulesImageBlock = isRelaxTime ? [] : blockedImageKeywords.map(keyword => ({
    id: nextId++, priority: 1, action: { type: 'block' },
    condition: { regexFilter: `.*${keyword}.*`, resourceTypes: ['image'] }
  }));

  // =============================================
  // PRIORITET 4: Admin Super Hvidliste (TRUMFER ALT)
  // =============================================
  const rulesAdminSuperAllow = settings.adminSuperAllowlist.map(site => ({
    id: nextId++, priority: 4, action: { type: 'allow' },
    condition: { urlFilter: `*${site}*`, resourceTypes: ['main_frame'] }
  }));

  const allRules = [
      ...rulesStandardBlock,
      ...rulesStandardAllow,
      ...rulesForceBlock,
      ...rulesImageBlock,
      ...rulesAdminSuperAllow
  ];

  // Sikkerhedscheck: Chrome har en max grænse på 5000 dynamiske regler
  if (allRules.length > 4999) {
      console.warn(`NetShield: ${allRules.length} regler overskrider grænsen! Beskærer til 4999.`);
      allRules.length = 4999;
  }

  if (allRules.length > 0) {
    try {
        await chrome.declarativeNetRequest.updateDynamicRules({ addRules: allRules });
        console.log(`NetShield: ${allRules.length} DNR-regler aktive. Pausetid: ${isRelaxTime ? 'JA' : 'NEJ'}`);
    } catch (e) {
        console.error("NetShield Fejl: Kunne ikke opdatere regler.", e);
    }
  }
}

// =================================================
// SIKKERHEDSNET (HVIDLISTE TJEK PÅ URL-NIVEAU)
// =================================================

function isSafeSchoolUrl(urlStr) {
    if (!urlStr) return false;
    const coreSchoolSites = [
        'aula.dk', 'lectio.dk',
        'drive.google.com', 'docs.google.com', 'slides.google.com', 'classroom.google.com',
        'matematikfessor.dk', 'nota.dk', 'grammatip.com', 'ordbogen.com',
        'skoletube.dk', 'gyldendal-uddannelse.dk', 'gyldendal.dk', 'clio.me', 'clioonline.dk', 'systime.dk',
        'accounts.google.com', 'testogprøver.dk', 'skoleporten.dk', 'minuddannelse.dk',
        'restudy.dk', 'sofaskolen.dk', 'emu.dk', 'skolon.com', 'alinea.dk',
        'meebook.com', 'easyiq.dk', 'unilogin.dk', 'mitid.dk',
        'forms.google.com', 'sheets.google.com', 'keep.google.com',
        'mail.google.com', 'meet.google.com', 'calendar.google.com',
        'kahoot.com', 'quizlet.com', 'geogebra.org', 'code.org',
        'wikipedia.org', 'dr.dk', 'denstoredanske.lex.dk', 'duda.dk'
    ];
    try {
        const hostname = new URL(urlStr).hostname.toLowerCase();
        
        // 1. Tjek den hårde hvidliste af skolesider
        if (coreSchoolSites.some(site => hostname.includes(site))) return true;
        
        // 2. Tjek den lokale tilladte liste (allowed_sites.js)
        if (localAllowedSites.some(site => hostname.includes(site.toLowerCase()))) return true;
        
        // 3. Tjek den fjernsynkroniserede CSV tilladte liste
        if (cachedRemoteAllows.some(site => hostname.includes(site.toLowerCase()))) return true;
        
        // 4. Tjek den Google Admin-styrede Super-hvidliste
        if (cachedAdminSuperAllowlist.some(site => hostname.includes(site.toLowerCase()))) return true;
        
        return false;
    } catch(e) {
        return false;
    }
}

// =================================================
// LYTTER: Content Script rapporterer overtrædelser
// =================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "violationDetected") {
    const tabUrl = sender.tab?.url || '';
    if (isSafeSchoolUrl(tabUrl)) {
        console.log(`🛡️ NetShield: Ignorerer overtrædelse på fredet skole-URL: ${tabUrl} (Årsag: ${message.reason})`);
        return;
    }

    if (message.reason === "game" && isRelaxTimeGlobal) {
        console.log(`🎮 NetShield: Tillader spil på ${sender.tab?.url} (Pausetid er aktiv)`);
        return;
    }

    if (sender.tab && sender.tab.id) {
      console.log(`🚨 NetShield: Blokerer ${sender.tab.url} (Årsag: ${message.reason})`);
      chrome.tabs.update(sender.tab.id, { 
        url: chrome.runtime.getURL("blocked.html") 
      });
    }
  }
});

// =================================================
// LOKAL FIL-VAGT (file:// og about:blank)
// =================================================

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    const url = (tab.url || '').toLowerCase();
    
    // Bloker mistænkelige lokale HTML-filer
    if (url.startsWith('file:')) {
      const suspiciousFileNames = [
          'helios', 'unblock', 'proxy', 'browser', 'offline', 'ultraviolet', 
          'incognito', 'interstellar', 'rammerhead', 'scramjet', 'holy',
          'nebula', 'meteor', 'gust', 'selenite', 'anura',
          'game', 'play', 'arcade', 'emulator'
      ];
      if (suspiciousFileNames.some(word => url.includes(word))) {
        chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html") });
      }
    }
    
    // Avanceret about:blank vagt - bloker tabs med about:blank der har fået indhold injiceret
    // (håndteres primært af content_analyzer.js nu, dette er en ekstra sikkerhedsnet)
    if (url === 'about:blank' && changeInfo.status === 'complete') {
        // Injicer et hurtigt tjek
        try {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    const bodyLen = (document.body?.innerHTML || '').length;
                    if (bodyLen > 500) {
                        chrome.runtime.sendMessage({ action: "violationDetected", reason: "proxy" });
                    }
                }
            }).catch(() => {}); // Ignorer fejl fra chrome:// sider osv.
        } catch(e) {}
    }
  }
});
