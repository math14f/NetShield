// Copyright (c) 2025 Mathias Andersen - All Rights Reserved
// NetShield - Under MIT License
// Filnavn: content_analyzer.js
// Version 3.6
// NS-CANARY-ID: 7b8f-9a2c-7r5e-bf63-8201-THISTED-SHIELD
const blockConfig = {
    btns: ['AI-tilstand', 'AI Mode', 'AI-Modus', 'KI-Modus', 'Chat'],
    overskrift: ['AI-oversigt', 'AI Overview', 'AI-Übersicht', 'KI-Übersicht'],
    urls: ['cpltsrchif=1', '/copilotsearch', 'FORM=DEEPSH', '/ai-search', '/chat'] 
};

// --- Netværk intercepts ---
const oldFetch = window.fetch;
window.fetch = async function(res, conf) {
    const url = (typeof res === 'string') ? res : (res?.url || '');
    if (blockConfig.urls.some(p => url.includes(p))) {
        return Promise.reject("LetSpær blokeret");
    }
    return oldFetch.apply(this, arguments);
};

const oldOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    if (typeof url === 'string' && blockConfig.urls.some(p => url.includes(p))) {
        return oldOpen.apply(this, [method, "about:blank"]); 
    }
    return oldOpen.apply(this, arguments);
};

// --- Skjul AI elementer på søgemaskiner ---
function fjernAiTing() {
    const host = window.location.hostname;
    const path = window.location.pathname;
    const erBilledeSøgning = window.location.search.includes("tbm=isch");

    if (host.includes("google.") && !erBilledeSøgning) {
        const skjulGoogle = () => {
            document.querySelectorAll('span').forEach(s => {
                if (blockConfig.btns.includes(s.textContent.trim())) {
                    const b = s.closest('button, a, div[role="button"], div[role="listitem"]');
                    if (b) b.style.display = 'none';
                }
            });
            if (path.includes('/search')) {
                document.querySelectorAll('div[jscontroller]').forEach(boks => {
                    if (blockConfig.overskrift.some(txt => boks.textContent.includes(txt))) {
                        boks.style.display = 'none';
                    }
                });
            }
            // fjerner det lille AI ikon
            document.querySelectorAll('svg path').forEach(p => {
                const d = p.getAttribute('d') || "";
                if (d.startsWith('M17.5 12c0-3.04')) {
                    const ikonDiv = p.closest('div[role="listitem"]') || p.closest('a') || p.closest('div[role="button"]') || p.closest('.gb_d') || p.closest('span') || p.closest('button');
                    if (ikonDiv && ikonDiv.style.display !== 'none') ikonDiv.style.display = 'none';
                }
            });
        };
        skjulGoogle();
        new MutationObserver(skjulGoogle).observe(document.body || document.documentElement, { childList: true, subtree: true });
    }

    if (host.includes("bing.")) {
        const skjulBing = () => {
            document.querySelectorAll('a[href*="/copilotsearch"]').forEach(link => {
                const parent = link.closest('li') || link;
                parent.style.display = 'none';
            });
            document.querySelectorAll('.gs_main').forEach(el => el.style.display = 'none');
            document.querySelectorAll('iframe').forEach(frame => {
                if (frame.src && frame.src.includes('cpltsrchif=1')) frame.remove();
            });
        };
        skjulBing();
        new MutationObserver(skjulBing).observe(document.body || document.documentElement, { childList: true, subtree: true });
    }

    if (host.includes("ecosia.")) {
        if (path.includes('/ai-search') || path.includes('/chat')) {
            // redirecter tilbage til normal søgning
            window.location.replace("https://www.ecosia.org/search?q=" + (new URLSearchParams(window.location.search).get("q") || ""));
        }
        const skjulEcosia = () => {
            document.querySelectorAll('a[href*="/ai-search"], a[href*="/chat"]').forEach(knap => {
                const parent = knap.closest('li') || knap;
                if (parent.style.display !== 'none') parent.style.display = 'none';
            });
            document.querySelectorAll('[data-test-id="tab-navigation-item"]').forEach(tab => {
                if(tab.innerText.includes("Chat") || tab.innerText.includes("AI")) tab.style.display = 'none';
            });
        };
        skjulEcosia();
        new MutationObserver(skjulEcosia).observe(document.body || document.documentElement, { childList: true, subtree: true });
    }
}
fjernAiTing(); 


// --- Scanner for spil og proxy ---
function tjekSiden() {
    if (window.harBlokeret) return; // forhindrer spam

    let cScore = 0, gScore = 0, pScore = 0, sScore = 0;
    const title = (document.title || "").toLowerCase();
    const url = window.location.href.toLowerCase();
    const txt = (document.body ? document.body.innerText.toLowerCase() : "");
    const desc = document.querySelector('meta[name="description"]')?.content.toLowerCase() || "";
    const kwrds = document.querySelector('meta[name="keywords"]')?.content.toLowerCase() || "";

    // Cloud browsers
    ['virtual browser', 'browser session', 'cloud browser', 'isolated environment'].forEach(k => { 
        if (title.includes(k) || txt.includes(k)) cScore += 4; 
    });
    ['unblock', 'bypass', 'vnc'].forEach(k => { 
        if (kwrds.includes(k)) cScore += 5; 
    });
    
    // Spil tjekker
    ['unblocked games', 'games 66', 'games 77', 'io game'].forEach(k => {
        if (url.includes(k) || title.includes(k)) gScore += 3;
    });
    if (title.includes('slope')) gScore += 2;
    if (document.querySelector('canvas')) gScore += 3;
    if (window.unityInstance || document.getElementById('unity-canvas') || window.RufflePlayer) gScore += 6;
    
    const seoWords = ["friv", "unblocked games", "free online games", "play now for free", "addicting games", "io games", "best free games", "jogos", "y9 games", "y8 games", "spil gratis onlinespil"];
    seoWords.forEach(w => { 
        if (title.includes(w) || desc.includes(w) || kwrds.includes(w)) gScore += 10; 
    });
    if (kwrds.includes("game") && kwrds.includes("play") && kwrds.includes("online")) gScore += 5;

    // Proxy
    if (!window.location.hostname.includes("google.")) {
        document.querySelectorAll('input[type="text"], input[type="url"], input:not([type])').forEach(inp => {
            const ph = (inp.placeholder || "").toLowerCase();
            if (ph.includes('enter website') || ph.includes('enter url')) pScore += 3;
        });
        ['web proxy', 'anonymous browsing', 'unblock websites', 'browse freely'].forEach(k => { 
            if (txt.includes(k)) pScore += 2; 
        });
        if (title.includes('proxy') || title.includes('unblock') || title.includes('anuraos')) pScore += 4;
        
        document.querySelectorAll('script').forEach(s => {
            if (s.src && (s.src.includes('/uv/uv.bundle.js') || s.src.includes('/search/bundle.js'))) pScore += 5;
            if (s.src && (s.src.includes('libv86.js') || s.src.includes('bare.cjs') || s.src.includes('bare-mux'))) pScore += 6;
        });
        
        if (window.__uv$config) pScore += 5;
        if (document.getElementById('uv-form')) pScore += 3;
        try { if (localStorage.getItem('bare-mux-path')) pScore += 6; } catch (e) {}
    }

    // Google Sites spam
    if (window.location.hostname === 'sites.google.com') {
        if (document.querySelectorAll('iframe').length > 5) sScore += 5;
        if (title.includes('games')) sScore += 3;
        
        const spamWords = ['gmes', 'g𝙖mes', 'unblocked', 'unblσcked', 'prσxy', 'prοxy'];
        document.querySelectorAll('a').forEach(a => {
            const t = (a.textContent || "").toLowerCase();
            spamWords.forEach(k => { if (t.includes(k)) sScore += 4; });
        });
    }

    // console.log(`Scores - C:${cScore}, G:${gScore}, P:${pScore}, S:${sScore}`);

    if (cScore >= 5 || gScore >= 5 || pScore >= 4 || sScore >= 5) {
        window.harBlokeret = true; 
        try { 
            chrome.runtime.sendMessage({ action: "proxyDetected" }); 
        } catch (e) {
            // ignore
        }
    }
}


// --- Starter det hele op ---
function erSkoleSide() {
    const tilladteSider = [
        'aula.dk', 'lectio.dk',
        'drive.google.com', 'docs.google.com', 'slides.google.com', 'classroom.google.com',
        'matematikfessor.dk', 'nota.dk', 'grammatip.com', 'ordbogen.com',
        'skoletube.dk', 'gyldendal-uddannelse.dk', 'clio.me', 'systime.dk',
        'accounts.google.com', 'testogprøver.dk' 
    ];
    
    if (tilladteSider.some(site => window.location.hostname.includes(site))) return true;
    
    // tjekker hvor vi kom fra
    if (document.referrer) {
        try {
            const ref = new URL(document.referrer).hostname;
            if (tilladteSider.some(site => ref.includes(site))) return true;
        } catch (e) {}
    }
    return false;
}

if (!erSkoleSide()) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", tjekSiden);
    } else {
        tjekSiden();
    }
    
    // kør igen når alt er loadet (fanger canvas spil der loader langsomt)
    window.addEventListener('load', tjekSiden);
}
