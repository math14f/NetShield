// Copyright (c) 2026 Mathias Andersen - All Rights Reserved
// NetShield - Under MIT License
// Filnavn: content_analyzer_main.js
// NS-CANARY-ID: 7b8f-9a2c-7r5e-bf63-8201-THISTED-SHIELD
// Version 3.8
function reportViolation(reason) {
    try {
        document.dispatchEvent(new CustomEvent('NetShieldViolation', { detail: { reason: reason } }));
    } catch(e) {}
}

(function() {
    if (window.location.href === 'about:blank' || window.location.protocol === 'about:') {
        const origWrite = document.write;
        const origWriteln = document.writeln;
        document.write = function() {
            reportViolation("proxy");
            return origWrite.apply(this, arguments);
        };
        document.writeln = function() {
            reportViolation("proxy");
            return origWriteln.apply(this, arguments);
        };

        const blankObserver = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.addedNodes.length > 0) {
                    const bodyText = (document.body?.innerText || '').toLowerCase();
                    const bodyHTML = (document.body?.innerHTML || '').toLowerCase();
                    if (bodyText.length > 200 || bodyHTML.includes('<iframe') || bodyHTML.includes('<canvas') || bodyHTML.includes('<embed')) {
                        reportViolation("proxy");
                        blankObserver.disconnect();
                        break;
                    }
                }
            }
        });
        if (document.documentElement) {
            blankObserver.observe(document.documentElement, { childList: true, subtree: true });
        }
    }
})();

let registeredSuspiciousSW = false;
try {
    const originalRegister = navigator.serviceWorker.register;
    navigator.serviceWorker.register = function(scriptURL, options) {
        const url = scriptURL.toString().toLowerCase();
        const suspiciousSWNames = [
            'uv.sw.js', 'uv.sw-handler.js', 'uv.worker.js',
            'dynamic.sw.js', 'dynamic.worker.js',
            'aero.sw.js', 'scramjet.sw.js', 'scramjet.worker.js',
            'womginx', 'rammerhead', 'bare-mux', 'baremux',
            'interstellar', 'meteor', 'nebula',
            'sw.js', 'worker.js', 'service-worker.js'
        ];
        if (suspiciousSWNames.some(name => url.includes(name))) {
            registeredSuspiciousSW = true;
            setTimeout(() => { if (typeof runFastScanners === 'function') runFastScanners(); }, 300);
        }
        return originalRegister.apply(this, arguments);
    };
} catch(e) {}

let suspiciousWSDetected = false;
try {
    const OriginalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
        const urlStr = (url || '').toString().toLowerCase();
        if (urlStr.includes('/bare/') || urlStr.includes('/wisp/') || urlStr.includes('bare-mux') || urlStr.includes('/epoxy/')) {
            suspiciousWSDetected = true;
            setTimeout(() => { if (typeof runFastScanners === 'function') runFastScanners(); }, 300);
        }
        return new OriginalWebSocket(url, protocols);
    };
    window.WebSocket.prototype = OriginalWebSocket.prototype;
    window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    window.WebSocket.OPEN = OriginalWebSocket.OPEN;
    window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
    window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;
} catch(e) {}

const NETSHIELD_CONFIG = {
    buttonTexts: ['AI-tilstand', 'AI Mode', 'AI-Modus', 'KI-Modus', 'Chat'],
    overviewTexts: ['AI-oversigt', 'AI Overview', 'AI-Übersicht', 'KI-Übersicht'],
    blockedUrlPatterns: ['cpltsrchif=1', '/copilotsearch', 'FORM=DEEPSH', '/ai-search', '/chat'] 
};

const originalFetch = window.fetch;
window.fetch = async function(resource, config) {
    const url = (typeof resource === 'string') ? resource : (resource?.url || '');
    if (NETSHIELD_CONFIG.blockedUrlPatterns.some(pattern => url.includes(pattern))) {
        return Promise.reject("Blocked by LetSpær");
    }
    return originalFetch.apply(this, arguments);
};

const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    if (typeof url === 'string' && NETSHIELD_CONFIG.blockedUrlPatterns.some(pattern => url.includes(pattern))) {
        return originalOpen.apply(this, [method, "about:blank"]); 
    }
    return originalOpen.apply(this, arguments);
};

function initAiCleaners() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const isGoogle = hostname.includes("google.");
    const isBing = hostname.includes("bing.");
    const isEcosia = hostname.includes("ecosia.");
    const isImageSearch = window.location.search.includes("tbm=isch");

    if (isGoogle && !isImageSearch) {
        const isOnSearchPage = pathname.includes('/search');
        const hideGoogleElements = () => {
            document.querySelectorAll('span').forEach(span => {
                if (NETSHIELD_CONFIG.buttonTexts.includes(span.textContent.trim())) {
                    const btn = span.closest('button, a, div[role="button"], div[role="listitem"]');
                    if (btn) btn.style.display = 'none';
                }
            });
            if (isOnSearchPage) {
                document.querySelectorAll('div[jscontroller]').forEach(container => {
                    if (NETSHIELD_CONFIG.overviewTexts.some(text => container.textContent.includes(text))) {
                        container.style.display = 'none';
                    }
                });
            }
            document.querySelectorAll('svg path').forEach(path => {
                const dStr = path.getAttribute('d') || "";
                if (dStr.startsWith('M17.5 12c0-3.04')) {
                    const iconContainer = path.closest('div[role="listitem"]') || path.closest('a') || path.closest('div[role="button"]') || path.closest('.gb_d') || path.closest('span') || path.closest('button');
                    if (iconContainer && iconContainer.style.display !== 'none') {
                        iconContainer.style.display = 'none';
                    }
                }
            });
        };
        hideGoogleElements();
        new MutationObserver(hideGoogleElements).observe(document.documentElement, { childList: true, subtree: true });
    }

    if (isBing) {
        const hideBingAI = () => {
            document.querySelectorAll('a[href*="/copilotsearch"]').forEach(link => {
                const container = link.closest('li') || link;
                container.style.display = 'none';
            });
            document.querySelectorAll('.gs_main').forEach(el => el.style.display = 'none');
            document.querySelectorAll('iframe').forEach(iframe => {
                if (iframe.src && iframe.src.includes('cpltsrchif=1')) iframe.remove();
            });
        };
        hideBingAI();
        new MutationObserver(hideBingAI).observe(document.documentElement, { childList: true, subtree: true });
    }

    if (isEcosia) {
        if (pathname.includes('/ai-search') || pathname.includes('/chat')) {
            window.location.replace("https://www.ecosia.org/search?q=" + (new URLSearchParams(window.location.search).get("q") || ""));
        }
        const hideEcosiaAI = () => {
            document.querySelectorAll('a[href*="/ai-search"], a[href*="/chat"]').forEach(btn => {
                const container = btn.closest('li') || btn;
                if (container.style.display !== 'none') container.style.display = 'none';
            });
            document.querySelectorAll('[data-test-id="tab-navigation-item"]').forEach(tab => {
                if(tab.innerText.includes("Chat") || tab.innerText.includes("AI")) tab.style.display = 'none';
            });
        };
        hideEcosiaAI();
        new MutationObserver(hideEcosiaAI).observe(document.documentElement, { childList: true, subtree: true });
    }
}
initAiCleaners();

function runFastScanners() {
    if (window.netshieldHasBlocked) return; 

    let cloudScore = 0, gameScore = 0, proxyScore = 0;
    const pageTitle = (document.title || "").toLowerCase();
    const pageUrl = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    const pageText = (document.body ? document.body.innerText.substring(0, 15000).toLowerCase() : "");
    const metaDesc = document.querySelector('meta[name="description"]')?.content?.toLowerCase() || "";
    const metaKeywords = document.querySelector('meta[name="keywords"]')?.content?.toLowerCase() || "";
    const allHTML = (document.documentElement?.innerHTML || "").substring(0, 30000).toLowerCase();

    const cloudKWs = ['virtual browser', 'browser session', 'cloud browser', 'isolated environment', 'remote desktop', 'browser in browser'];
    cloudKWs.forEach(kw => { if (pageTitle.includes(kw) || pageText.includes(kw)) cloudScore += 4; });
    ['unblock', 'bypass', 'vnc', 'rdp'].forEach(kw => { if (metaKeywords.includes(kw)) cloudScore += 5; });
    
    const gameUrlKWs = ['unblocked games', 'games 66', 'games 77', 'games 99', 'io game', 'unblocked spil', 'gratis spil', 'free games', 'html5 game'];
    gameUrlKWs.forEach(kw => {
        if (pageUrl.includes(kw) || pageTitle.includes(kw)) gameScore += 3;
    });

    const gameNames = ['slope', 'retro bowl', '1v1.lol', 'drift hunters', 'cookie clicker', 'subway surfers', 'flappy bird', 'tetris', 'snake game', 'crossy road', '2048', 'run 3', 'fnaf', 'geometry dash', 'moto x3m', 'happy wheels', 'basketball stars', 'shell shockers', 'krunker'];
    gameNames.forEach(name => { if (pageTitle.includes(name)) gameScore += 3; });

    const hasCanvas = document.querySelector('canvas');
    const hasEmbed = document.querySelector('embed');
    const hasObject = document.querySelector('object');
    if (hasCanvas || hasEmbed || hasObject) gameScore += 3;

    if (hasCanvas) {
        try {
            const gl = hasCanvas.getContext('webgl') || hasCanvas.getContext('webgl2') || hasCanvas.getContext('experimental-webgl');
            if (gl) gameScore += 2;
        } catch(e) {}
    }

    if (window.unityInstance || document.getElementById('unity-canvas') || window.RufflePlayer || window.pico8_buttons || window.Phaser || window.PIXI || window.createjs || window.Howl || window.PlayCanvas) gameScore += 6;
    
    const scriptSrcs = Array.from(document.querySelectorAll('script[src]')).map(s => s.src.toLowerCase());
    const gameScripts = ['ruffle.js', 'unity.loader.js', 'unityweb', 'playcanvas', 'phaser.min.js', 'phaser.js', 'pixi.min.js', 'pixi.js', 'construct', 'gdjs', 'pico-8', 'emscripten', 'gamemaker', 'babylonjs', 'three.min.js'];
    gameScripts.forEach(gs => {
        if (scriptSrcs.some(src => src.includes(gs))) gameScore += 5;
    });

    const seoWords = ["friv", "unblocked games", "free online games", "play now for free", "addicting games", "io games", "best free games", "jogos", "y9 games", "y8 games", "spil gratis onlinespil", "play game online", "play free games", "browser games", "html5 games"];
    seoWords.forEach(word => { if (pageTitle.includes(word) || metaDesc.includes(word) || metaKeywords.includes(word)) gameScore += 10; });
    
    const behaviorWords = ['controls:', 'wasd', 'arrow keys', 'press spacebar', 'play fullscreen', 'click to play', 'tap to start', 'press enter to start', 'move with', 'left click to shoot'];
    behaviorWords.forEach(bw => { if (pageText.includes(bw)) gameScore += 2; });

    if (metaKeywords.includes("game") && metaKeywords.includes("play") && metaKeywords.includes("online")) gameScore += 5;

    if (hostname.endsWith('github.io') || hostname.endsWith('netlify.app') || hostname.endsWith('vercel.app') || hostname.endsWith('pages.dev')) {
        const deployGameKWs = ['game', 'play', 'unblocked', 'retro', 'emulator', 'arcade', 'nes', 'snes', 'gba'];
        deployGameKWs.forEach(kw => {
            if (pageTitle.includes(kw) || pageUrl.includes(kw)) gameScore += 3;
        });
    }

    if (!hostname.includes("google.")) {
        document.querySelectorAll('input[type="text"], input[type="url"], input:not([type])').forEach(input => {
            const ph = (input.placeholder || "").toLowerCase();
            const inputId = (input.id || "").toLowerCase();
            const inputName = (input.name || "").toLowerCase();
            if (ph.includes('enter website') || ph.includes('enter url') || ph.includes('type url') || ph.includes('search the web') || ph.includes('browse') || ph.includes('enter a url')) proxyScore += 3;
            if (inputId.includes('uv-') || inputId.includes('proxy') || inputName.includes('proxy') || inputName.includes('url-input')) proxyScore += 3;
        });

        const proxyKWs = ['web proxy', 'anonymous browsing', 'unblock websites', 'browse freely', 'proxy browser', 'unblocked proxy', 'internet freedom', 'censorship circumvention', 'access blocked sites', 'bare server', 'wisp server'];
        proxyKWs.forEach(kw => { if (pageText.includes(kw)) proxyScore += 2; });

        const proxyTitleKWs = ['proxy', 'unblock', 'anuraos', 'selenite', 'rammerhead', 'interstellar', 'holy unblocker', 'nebula', 'meteor', 'hypertabs', 'shuttle', 'gust proxy', 'surfshark'];
        proxyTitleKWs.forEach(kw => { if (pageTitle.includes(kw)) proxyScore += 4; });
        
        const proxyScripts1 = ['/uv/uv.bundle.js', '/uv/uv.config.js', '/uv/uv.handler.js', '/uv/uv.sw.js', '/search/bundle.js', '/uv.bundle.js'];
        const proxyScripts2 = ['libv86.js', 'bare.cjs', 'bare-mux', 'baremux', 'rammerhead.js', 'scramjet.codecs.js', 'scramjet.bundle.js', 'scramjet.config.js', 'epoxy.js', 'libcurl.js', 'wisp.js'];
        scriptSrcs.forEach(src => {
            if (proxyScripts1.some(ps => src.includes(ps))) proxyScore += 5;
            if (proxyScripts2.some(ps => src.includes(ps))) proxyScore += 6;
        });

        document.querySelectorAll('script:not([src])').forEach(s => {
            const code = (s.textContent || '').substring(0, 5000).toLowerCase();
            if (code.includes('__uv$config') || code.includes('ultraviolet') || code.includes('bare-mux') || code.includes('baremux')) proxyScore += 6;
            if (code.includes('importscripts') && (code.includes('uv.') || code.includes('scramjet'))) proxyScore += 5;
            if (code.includes('corsproxy') || code.includes('allorigins') || code.includes('cors-anywhere')) proxyScore += 4;
        });

        if (allHTML.includes('corsproxy.io') || allHTML.includes('api.allorigins.win') || allHTML.includes('cors-anywhere')) proxyScore += 5;

        const proxyGlobals = ['__uv$config', '__dynamic$config', '__aero$config', '__scramjet$config', '__womginx', 'rammerhead', 'Ultraviolet', 'scramjet', 'BareMux', 'Rammerhead', '__uv', '__dynamic', '__aero', 'EpoxyTransport', 'CurlTransport', 'BareTransport'];
        proxyGlobals.forEach(g => {
            try { if (window[g]) proxyScore += 6; } catch(e) {}
        });
        
        if (document.getElementById('uv-form') || document.querySelector('form[action*="/uv/"]') || document.querySelector('form[action*="/service/"]') || document.querySelector('form[action*="/bare/"]') || document.querySelector('form[action*="/prox"]')) proxyScore += 3;

        try {
            const storageKeys = ['bare-mux-path', 'rammerhead_session', 'uv-version', 'uv-client-config', '__sv', 'scramjet-config', 'interstellar-config'];
            storageKeys.forEach(key => {
                if (localStorage.getItem(key)) proxyScore += 4;
            });
        } catch (e) {}
        
        if (registeredSuspiciousSW) proxyScore += 5;
        if (suspiciousWSDetected) proxyScore += 5;
    }

    let chatScore = 0;
    const chatTitleKWs = ['uhmegle', 'umingle', 'omoggle', 'omegle', 'chat with strangers', 'random video chat', 'chat random'];
    chatTitleKWs.forEach(kw => { if (pageTitle.includes(kw)) chatScore += 4; });

    const chatTextKWs = [
        'chat with strangers',
        'random video',
        'interest matching',
        'start chatting on umingle',
        'omoggle does not sell, store, or use your face',
        'mediapipe face landmarker',
        'anti-abuse and age acknowledgment',
        'omoggle session gate'
    ];
    chatTextKWs.forEach(kw => { if (pageText.includes(kw)) chatScore += 4; });

    if (chatScore >= 4) {
        window.netshieldHasBlocked = true;
        reportViolation("proxy");
        return;
    }

    document.querySelectorAll('iframe').forEach(iframe => {
        const src = (iframe.src || '').toLowerCase();
        const srcdoc = (iframe.srcdoc || '').toLowerCase();
        if (src === 'about:blank' || src === '') {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc && iframeDoc.body && iframeDoc.body.innerHTML.length > 500) {
                    proxyScore += 4;
                }
            } catch(e) {}
        }
        if (src.includes('proxy') || src.includes('unblock') || src.includes('ultraviolet') || src.includes('/service/') || src.includes('rammerhead')) proxyScore += 4;
        if (srcdoc.includes('<canvas') || srcdoc.includes('game') || srcdoc.includes('proxy')) gameScore += 3;
    });

    let sitesScore = 0;
    if (hostname === 'sites.google.com') {
        if (document.querySelectorAll('iframe').length > 5) sitesScore += 5;
        if (pageTitle.includes('games') || pageTitle.includes('unblocked') || pageTitle.includes('proxy')) sitesScore += 3;
        const gameMenuKWs = ['gmes', 'g𝙖mes', 'unblocked', 'unblσcked', 'prσxy', 'prοxy', 'g4mes', 'gam3s', 'unblocke', 'pr0xy'];
        document.querySelectorAll('a').forEach(a => {
            const t = (a.textContent || "").toLowerCase();
            const href = (a.href || "").toLowerCase();
            gameMenuKWs.forEach(kw => { if (t.includes(kw) || href.includes(kw)) sitesScore += 4; });
        });
    }

    if (cloudScore >= 5 || proxyScore >= 4) {
        window.netshieldHasBlocked = true;
        reportViolation("proxy");
    } else if (gameScore >= 5 || sitesScore >= 5) {
        window.netshieldHasBlocked = true;
        reportViolation("game");
    }
}

function startIframeMonitor() {
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeName === 'IFRAME') {
                    const src = (node.src || '').toLowerCase();
                    if (src === 'about:blank' || src === '' || src.includes('proxy') || src.includes('unblock')) {
                        setTimeout(runFastScanners, 1000);
                    }
                }
            }
        }
    });
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

function isSafeSchoolSite() {
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
    
    const h = window.location.hostname;
    if (coreSchoolSites.some(site => h.includes(site))) return true;
    
    if (document.referrer) {
        try {
            const refHost = new URL(document.referrer).hostname;
            if (coreSchoolSites.some(site => refHost.includes(site))) return true;
        } catch (e) {}
    }
    return false;
}

if (!isSafeSchoolSite()) {
    try {
        const originalContentWindowDesc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'contentWindow');
        const originalGet = originalContentWindowDesc.get;
        
        Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
            configurable: true,
            enumerable: true,
            get: function() {
                const win = originalGet.call(this);
                if (win) {
                    try {
                        if (win.WebSocket && !win.WebSocket.__patchedByNetShield) {
                            const OriginalIframeWS = win.WebSocket;
                            win.WebSocket = function(url, protocols) {
                                const urlStr = (url || '').toString().toLowerCase();
                                if (urlStr.includes('/bare/') || urlStr.includes('/wisp/') || urlStr.includes('bare-mux') || urlStr.includes('/epoxy/')) {
                                    suspiciousWSDetected = true;
                                    setTimeout(() => { if (typeof runFastScanners === 'function') runFastScanners(); }, 300);
                                }
                                return new OriginalIframeWS(url, protocols);
                            };
                            win.WebSocket.prototype = OriginalIframeWS.prototype;
                            win.WebSocket.__patchedByNetShield = true;
                        }
                        
                        if (win.fetch && !win.fetch.__patchedByNetShield) {
                            const OriginalIframeFetch = win.fetch;
                            win.fetch = async function(resource, config) {
                                const url = (typeof resource === 'string') ? resource : (resource?.url || '');
                                if (NETSHIELD_CONFIG.blockedUrlPatterns.some(pattern => url.includes(pattern))) {
                                    return Promise.reject("Blocked by NetShield");
                                }
                                return OriginalIframeFetch.apply(this, arguments);
                            };
                            win.fetch.__patchedByNetShield = true;
                        }
                    } catch (e) {}
                }
                return win;
            }
        });
    } catch (e) {}

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            runFastScanners();
            startIframeMonitor();
        });
    } else {
        runFastScanners();
        startIframeMonitor();
    }
    
    window.addEventListener('load', () => {
        runFastScanners();
    });

    setTimeout(() => {
        runFastScanners();
    }, 3000);
    setTimeout(() => {
        runFastScanners();
    }, 7000);
}
