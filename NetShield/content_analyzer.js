// Copyright (c) 2025 Mathias Andersen - All Rights Reserved
// NetShield - Under MIT License
// Filnavn: content_analyzer.js
// Version 3.6

// Fjerner Google AI-svar
function cleanGoogleAI() {
    if (!location.hostname.includes("google.")) return;

    function scanAndHide() {
        let found = false;
        
        // Find AI tekst containere
        let elements = document.querySelectorAll('div, span, h1');
        for (let el of elements) {
            if (el.textContent && el.textContent.includes('AI-oversigt')) {
                let container = el.closest('div[jscontroller]');
                if (container && container.style.display !== 'none') {
                    console.log("Google AI element skjult.");
                    container.style.display = 'none';
                    found = true;
                }
            }
        }

        // Find "AI-tilstand" knappen
        let spans = document.querySelectorAll('span');
        for (let span of spans) {
            if (span.textContent === 'AI-tilstand') {
                let btn = span.closest('div[role="listitem"]');
                if (btn && btn.style.display !== 'none') {
                    btn.style.display = 'none';
                    found = true;
                }
            }
        }
        return found;
    }

    scanAndHide();
    
    // Hold øje med ændringer i DOM
    const observer = new MutationObserver((mutations) => {
        if (mutations.length > 0) scanAndHide();
    });
    
    observer.observe(document.documentElement, { childList: true, subtree: true });
}

function triggerBlock(reason, score) {
    console.log(`NetShield: ${reason} (Score: ${score}). Blokerer.`);
    try {
        chrome.runtime.sendMessage({ action: "proxyDetected" });
    } catch (e) {
        console.error("Kunne ikke sende blokering: ", e);
    }
}

function detectCloudBrowser() {
    let score = 0;
    const title = (document.title || "").toLowerCase();
    const body = (document.body.innerText || "").toLowerCase();
    
    const words = ['virtual browser', 'browser session', 'cloud browser', 'isolated environment'];
    words.forEach(w => {
        if (title.includes(w) || body.includes(w)) score += 4;
    });

    const meta = document.querySelector('meta[name="keywords"]');
    if (meta && meta.content) {
        const metaText = meta.content.toLowerCase();
        if (['unblock', 'bypass', 'vnc'].some(k => metaText.includes(k))) score += 5;
    }

    if (score >= 5) triggerBlock("Cloud Browser fundet", score);
}

function detectGoogleSitesAbuse() {
    if (location.hostname !== 'sites.google.com') return;
    
    let score = 0;
    if (document.querySelectorAll('iframe').length > 5) score += 5;
    
    const badLinks = ['gmes', 'g𝙖mes', 'unblocked', 'unblσcked', 'prσxy', 'prοxy'];
    const links = document.querySelectorAll('a');
    
    for (let link of links) {
        let txt = (link.textContent || "").toLowerCase().trim();
        if (badLinks.some(k => txt.includes(k))) score += 4;
    }

    if (document.title.toLowerCase().includes('games')) score += 3;

    if (score >= 5) triggerBlock("Google Sites misbrug", score);
}

function detectGameContent() {
    let score = 0;
    const title = (document.title || "").toLowerCase();
    const url = location.href.toLowerCase();
    const desc = document.querySelector('meta[name="description"]')?.content.toLowerCase() || "";
    const keywords = document.querySelector('meta[name="keywords"]')?.content.toLowerCase() || "";

    // Tjek 1: Generelle keywords i URL/Titel
    const urlWords = ['unblocked games', 'games 66', 'games 77', 'io game'];
    if (urlWords.some(w => url.includes(w) || title.includes(w))) score += 3;
    if (title.includes('slope')) score += 2;

    // Tjek 2: Tekniske elementer (Canvas/Unity/Ruffle)
    if (document.querySelector('canvas')) score += 3;
    if (window.unityInstance || document.getElementById('unity-canvas')) score += 6;
    if (window.RufflePlayer) score += 6;

    // Tjek 3: SEO Keywords (MetaData analyse)
    const seoWords = [
        "friv", "unblocked games", "free online games", "play now for free", 
        "addicting games", "io games", "best free games", "jogos", 
        "y9 games", "y8 games", "spil gratis onlinespil"
    ];

    for (let word of seoWords) {
        if (title.includes(word) || desc.includes(word) || keywords.includes(word)) {
            score += 10; // Sikkert match
            break;
        }
    }

    // Tjek 4: Skjulte spil-keywords
    if (keywords.includes("game") && keywords.includes("play") && keywords.includes("online")) {
        score += 5;
    }

    if (score >= 5) triggerBlock("Spil indhold fundet", score);
}

function detectProxy() {
    if (location.hostname.includes("google.")) return;
    
    let score = 0;
    const body = (document.body.innerText || "").toLowerCase();
    const title = (document.title || "").toLowerCase();

    // Input felter der ligner URL bars
    const inputs = document.querySelectorAll('input');
    for (let input of inputs) {
        let ph = (input.placeholder || "").toLowerCase();
        if (ph.includes('enter website') || ph.includes('enter url')) score += 3;
    }

    // Tekst analyse
    const proxyWords = ['web proxy', 'anonymous browsing', 'unblock websites', 'browse freely'];
    if (proxyWords.some(w => body.includes(w))) score += 2;
    if (title.includes('proxy') || title.includes('unblock')) score += 4;
    if (title.includes('anuraos')) score += 4;

    // Script analyse (UV / Bare / Libv86)
    const scripts = document.querySelectorAll('script');
    for (let s of scripts) {
        if (s.src && (s.src.includes('/uv/uv.bundle.js') || s.src.includes('/search/bundle.js'))) score += 5;
        if (s.src && s.src.includes('libv86.js')) score += 6;
        if (s.src && (s.src.includes('bare.cjs') || s.src.includes('bare-mux'))) score += 6;
    }

    if (window.__uv$config) score += 5;
    if (document.getElementById('uv-form')) score += 3;
    
    try {
        if (localStorage.getItem('bare-mux-path')) score += 6;
    } catch(e) {}

    if (score >= 4) triggerBlock("Proxy indhold fundet", score);
}

// Kørsel
cleanGoogleAI();

window.addEventListener('load', function() {
    const safeSites = [
        'aula.dk', 'lectio.dk', 'drive.google.com', 'docs.google.com', 
        'slides.google.com', 'classroom.google.com', 'matematikfessor.dk', 
        'nota.dk', 'grammatip.com', 'ordbogen.com', 'skoletube.dk', 
        'gyldendal-uddannelse.dk', 'clio.me', 'systime.dk', 
        'accounts.google.com', 'testogprøver.dk'
    ];

    let isSafe = false;
    
    // Er vi på en sikker side?
    for (let site of safeSites) {
        if (location.hostname.includes(site)) {
            isSafe = true;
            break;
        }
    }

    // Kommer vi fra en sikker side? (Referrer check)
    if (!isSafe && document.referrer) {
        try {
            const refHost = new URL(document.referrer).hostname;
            for (let site of safeSites) {
                if (refHost.includes(site)) {
                    isSafe = true;
                    break;
                }
            }
        } catch(e) {}
    }

    // Hvis ikke sikker, kør scanning
    if (!isSafe) {
        setTimeout(function() {
            detectProxy();
            detectGameContent();
            detectGoogleSitesAbuse();
            detectCloudBrowser();
        }, 500);
    }
});
