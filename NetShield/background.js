// Copyright (c) 2025 Mathias Andersen - All Rights Reserved
// NetShield - Under MIT License
// Filnavn: background.js
// Version 8.3

import { blockedSites } from './blocked_sites.js';
import { allowedSites } from './allowed_sites.js';
import { forceBlockSites } from './force_block_sites.js';
import { blockedImageKeywords } from './blocked_images_keywords.js';

// Setup listeners
chrome.runtime.onInstalled.addListener(function() {
    console.log("NetShield v8.2 installeret.");
    reloadRules();
});

chrome.storage.managed.onChanged.addListener(reloadRules);

chrome.alarms.create('check_lists', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(reloadRules);

chrome.runtime.onMessage.addListener(function(msg, sender) {
    if (msg.action === "proxyDetected" && sender.tab && sender.tab.id) {
        console.log("Proxy detect fra content script: " + sender.tab.url);
        chrome.tabs.update(sender.tab.id, { url: chrome.runtime.getURL("blocked.html") });
    }
});

// Tjekker filer
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' || changeInfo.url) {
        if (tab.url && tab.url.indexOf('file:') === 0) {
            const badWords = ['helios', 'unblock', 'proxy', 'browser', 'offline', 'ultraviolet', 'incognito'];
            const urlLower = tab.url.toLowerCase();
            
            for (let i = 0; i < badWords.length; i++) {
                if (urlLower.indexOf(badWords[i]) !== -1) {
                    console.log("Lokal fil blokeret: " + tab.url);
                    chrome.tabs.update(tabId, { url: chrome.runtime.getURL("blocked.html") });
                    break;
                }
            }
        }
    }
});

async function getUrlContent(url) {
    if (!url || url.indexOf('http') !== 0) return [];
    
    try {
        let response = await fetch(url);
        if (response.status !== 200) {
            return [];
        }
        let text = await response.text();
        if (!text) return [];
        
        // Split og rens
        let lines = text.split('\n');
        let result = [];
        for (let line of lines) {
            let s = line.trim();
            if (s.length > 0) result.push(s);
        }
        return result;

    } catch (err) {
        console.log("Kunne ikke hente liste: " + url);
        return [];
    }
}

async function reloadRules() {
    // Hent config
    let items = await chrome.storage.managed.get({
        remoteBlocklistUrl: '',
        remoteAllowlistUrl: '',
        adminBlockedRegex: [],
        adminSuperAllowlist: []
    });

    let remoteBlock = await getUrlContent(items.remoteBlocklistUrl);
    let remoteAllow = await getUrlContent(items.remoteAllowlistUrl);

    // Slet gamle
    let existing = await chrome.declarativeNetRequest.getDynamicRules();
    let oldIds = [];
    existing.forEach(r => oldIds.push(r.id));
    
    if (oldIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: oldIds });
    }

    let nextId = 1;
    let newRules = [];
    let redirectObj = { type: 'redirect', redirect: { extensionPath: '/blocked.html' } };

    // Tilføj lokale blokeringer (Priority 1)
    blockedSites.forEach(function(site) {
        newRules.push({
            id: nextId,
            priority: 1,
            action: redirectObj,
            condition: { regexFilter: ".*" + site + ".*", resourceTypes: ['main_frame'] }
        });
        nextId++;
    });

    // Tilføj remote blokeringer (Priority 1)
    remoteBlock.forEach(function(site) {
        newRules.push({
            id: nextId,
            priority: 1,
            action: redirectObj,
            condition: { urlFilter: "*" + site + "*", resourceTypes: ['main_frame'] }
        });
        nextId++;
    });

    // Tilføj tilladte sider (Priority 2)
    let allowList = allowedSites.concat(remoteAllow);
    allowList.forEach(function(site) {
        newRules.push({
            id: nextId,
            priority: 2,
            action: { type: 'allow' },
            condition: { urlFilter: "*" + site + "*", resourceTypes: ['main_frame'] }
        });
        nextId++;
    });

    // Tvungne blokeringer og Admin Regex (Priority 3)
    let forceList = forceBlockSites.concat(items.adminBlockedRegex);
    forceList.forEach(function(pattern) {
        // Tjek om det er fra admin listen for at wrap i .*
        let filter = pattern;
        if (items.adminBlockedRegex.includes(pattern)) {
            filter = ".*" + pattern + ".*";
        }
        
        newRules.push({
            id: nextId,
            priority: 3,
            action: redirectObj,
            condition: { regexFilter: filter, resourceTypes: ['main_frame'] }
        });
        nextId++;
    });

    // Billeder (Priority 1)
    blockedImageKeywords.forEach(function(kw) {
        newRules.push({
            id: nextId,
            priority: 1,
            action: { type: 'block' },
            condition: { regexFilter: ".*" + kw + ".*", resourceTypes: ['image'] }
        });
        nextId++;
    });

    // Admin Super Allow (Priority 4)
    items.adminSuperAllowlist.forEach(function(site) {
        newRules.push({
            id: nextId,
            priority: 4,
            action: { type: 'allow' },
            condition: { urlFilter: "*" + site + "*", resourceTypes: ['main_frame'] }
        });
        nextId++;
    });

    // Opdater chrome
    if (newRules.length > 0) {
        try {
            await chrome.declarativeNetRequest.updateDynamicRules({ addRules: newRules });
            console.log("Regler indlæst: " + newRules.length);
        } catch (e) {
            console.error(e);
        }
    }
}
