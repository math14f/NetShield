// Filnavn: content_analyzer.js
// Version 3.5 - Med intelligent Referrer-baseret Whitelisting

/**
 * FUNKTION 1: Fuld AI-Rensning
 * Fjerner alle kendte variationer af Googles AI-svar fra søgeresultater.
 */
function hideGoogleAiElements() {
  if (!window.location.hostname.includes("google.")) {
    return;
  }
  const hideMatchingElements = () => {
    let wasAnythingHidden = false;
    const allElements = document.querySelectorAll('div, span, h1');
    for (const element of allElements) {
      if (element.textContent.includes('AI-oversigt')) {
        const container = element.closest('div[jscontroller]');
        if (container && container.style.display !== 'none') {
          console.log("NetShield: Google AI-element fundet. Skjuler container.");
          container.style.display = 'none';
          wasAnythingHidden = true;
        }
      }
    }
    const spans = document.querySelectorAll('span');
    for (const span of spans) {
        if (span.textContent === 'AI-tilstand') {
            const buttonContainer = span.closest('div[role="listitem"]');
            if (buttonContainer && buttonContainer.style.display !== 'none') {
                console.log("NetShield: 'AI-tilstand' knap fundet. Skjuler.");
                buttonContainer.style.display = 'none';
                wasAnythingHidden = true;
            }
        }
    }
    return wasAnythingHidden;
  };
  hideMatchingElements();
  const observer = new MutationObserver((mutations) => {
    if (mutations.length > 0) {
      hideMatchingElements();
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

/**
 * FUNKTION 2: Cloud Browser Detector
 * Leder efter tegn på, at en side er en "browser i en browser" (Cloud Browser).
 */
function checkForCloudBrowser() {
    let cloudScore = 0;
    const pageTitle = (document.title || "").toLowerCase();
    const pageText = (document.body.innerText || "").toLowerCase();
    const cloudKeywords = ['virtual browser', 'browser session', 'cloud browser', 'isolated environment'];
    for (const keyword of cloudKeywords) {
        if (pageTitle.includes(keyword) || pageText.includes(keyword)) {
            cloudScore += 4;
        }
    }
    const metaKeywordsTag = document.querySelector('meta[name="keywords"]');
    if (metaKeywordsTag) {
        const metaKeywords = (metaKeywordsTag.content || "").toLowerCase();
        const forbiddenMetaKeywords = ['unblock', 'bypass', 'vnc'];
        for (const keyword of forbiddenMetaKeywords) {
            if (metaKeywords.includes(keyword)) {
                cloudScore += 5;
            }
        }
    }
    if (cloudScore >= 5) {
        console.log(`NetShield: Cloud Browser-lignende indhold fundet! Score: ${cloudScore}. Blokerer siden.`);
        try {
            chrome.runtime.sendMessage({ action: "proxyDetected" });
        } catch (e) {
            console.error("NetShield: Kunne ikke sende besked.", e);
        }
    }
}

/**
 * FUNKTION 3: Google Sites Game Portal Detector
 * Køber KUN på sites.google.com og leder efter misbrugs-mønstre.
 */
function checkForGoogleSitesAbuse() {
    if (window.location.hostname !== 'sites.google.com') {
        return;
    }
    let abuseScore = 0;
    const iframeCount = document.querySelectorAll('iframe').length;
    if (iframeCount > 5) {
        abuseScore += 5;
    }
    const gameMenuKeywords = ['gmes', 'g𝙖mes', 'unblocked', 'unblσcked', 'prσxy', 'prοxy'];
    const navLinks = document.querySelectorAll('a');
    for (const link of navLinks) {
        const linkText = (link.textContent || "").toLowerCase().trim();
        for (const keyword of gameMenuKeywords) {
            if (linkText.includes(keyword)) {
                abuseScore += 4;
            }
        }
    }
    if (document.title.toLowerCase().includes('games')) {
        abuseScore += 3;
    }
    if (abuseScore >= 5) {
        console.log(`NetShield: Misbrug af Google Sites fundet! Score: ${abuseScore}. Blokerer siden.`);
        try {
            chrome.runtime.sendMessage({ action: "proxyDetected" });
        } catch (e) {
            console.error("NetShield: Kunne ikke sende besked.", e);
        }
    }
}

/**
 * FUNKTION 4: Generel Game Fingerprint Detector
 * Leder efter generelle tegn på distraherende spil.
 */
function checkForGameFingerprints() {
  let gameScore = 0;
  const pageTitle = (document.title || "").toLowerCase();
  const pageUrl = window.location.href.toLowerCase();
  const gameKeywords = ['unblocked games', 'games 66', 'games 77', 'io game'];
  for (const keyword of gameKeywords) {
    if (pageUrl.includes(keyword) || pageTitle.includes(keyword)) {
      gameScore += 3;
    }
  }
  if (pageTitle.includes('slope')) {
    gameScore += 2;
  }
  if (document.querySelector('canvas')) {
    gameScore += 3;
  }
  if (window.unityInstance || document.getElementById('unity-canvas')) {
    gameScore += 6;
  }
  if (window.RufflePlayer) {
    gameScore += 6;
  }
  if (gameScore >= 5) {
    console.log(`NetShield: Spil-lignende indhold fundet! Score: ${gameScore}. Blokerer siden.`);
    try {
      chrome.runtime.sendMessage({ action: "proxyDetected" });
    } catch (e) {
      console.error("NetShield: Kunne ikke sende besked.", e);
    }
  }
}

/**
 * FUNKTION 4: Meta-Data Detektiv (Baseret på din Y9 opdagelse)
 */
function checkForGameFingerprints() {
  let gameScore = 0;
  
  // 1. HENT METADATA FRA SIDEN
  // Vi kigger efter beskrivelse og nøgleord, præcis som i dit eksempel
  const metaDescription = document.querySelector('meta[name="description"]')?.content.toLowerCase() || "";
  const metaKeywords = document.querySelector('meta[name="keywords"]')?.content.toLowerCase() || "";
  const pageTitle = document.title.toLowerCase();

  // 2. LISTEN OVER "AFSLØRENDE ORD" (SEO Keywords)
  // Disse ord bruger spil-sider for at blive fundet på Google.
  // Skolesider bruger ALDRIG disse ord sammen.
  const seoTriggerWords = [
      "friv",              // Kæmpe rødt flag!
      "unblocked games",   // De indrømmer det selv
      "free online games", // Y9 brugte denne
      "play now for free", // Y9 brugte denne
      "addicting games",
      "io games",
      "best free games",
      "jogos",             // Portugisisk for spil (meget brugt på Friv-kloner)
      "y9 games",          // Specifikke portaler
      "y8 games",
      "spil gratis onlinespil"
  ];

  // 3. TJEK FOR MATCH
  for (const word of seoTriggerWords) {
      // Tjekker Titel, Beskrivelse og Nøgleord
      if (pageTitle.includes(word) || metaDescription.includes(word) || metaKeywords.includes(word)) {
          console.log(`NetShield: Fandt SEO-ordet "${word}". Det er en spil-side.`);
          gameScore += 10; // BINGO! Vi behøver ikke tælle mere. Det er et spil.
      }
  }

  // 4. EKSTRA TJEK (Hvis de prøver at skjule sig, men stadig er spil)
  if (metaKeywords.includes("game") && metaKeywords.includes("play") && metaKeywords.includes("online")) {
      gameScore += 5;
  }

  // 5. AFGØRELSEN
  if (gameScore >= 5) {
    console.log(`NetShield: Spil-portal detekteret via Metadata! Score: ${gameScore}.`);
    try {
      chrome.runtime.sendMessage({ action: "proxyDetected" });
    } catch (e) { console.error(e); }
  }
}
/**
 * FUNKTION 5: Proxy Fingerprint Detector
 * Leder efter tegn på en traditionel proxy-side.
 */
function checkForProxyFingerprints() {
  if (window.location.hostname.includes("google.")) {
    return;
  }
  let proxyScore = 0;
  const pageText = (document.body.innerText || "").toLowerCase();
  const pageTitle = (document.title || "").toLowerCase();
  const inputs = document.querySelectorAll('input[type="text"], input[type="url"], input:not([type])');
  for (const input of inputs) {
    const placeholder = (input.placeholder || "").toLowerCase();
    if (placeholder.includes('enter website') || placeholder.includes('enter url')) { proxyScore += 3; }
  }
  const proxyKeywords = ['web proxy', 'anonymous browsing', 'unblock websites', 'browse freely'];
  for (const keyword of proxyKeywords) { if (pageText.includes(keyword)) { proxyScore += 2; } }
  if (pageTitle.includes('proxy') || pageTitle.includes('unblock')) { proxyScore += 4; }
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.src && (script.src.includes('/uv/uv.bundle.js') || script.src.includes('/search/bundle.js'))) { proxyScore += 5; }
  }
  if (window.__uv$config) { proxyScore += 5; }
  if (document.getElementById('uv-form')) { proxyScore += 3; }
  if (document.querySelector('script[src*="libv86.js"]')) { proxyScore += 6; }
  if (document.querySelector('script[src*="bare.cjs"]') || document.querySelector('script[src*="bare-mux"]')) { proxyScore += 6; }
  if (pageTitle.includes('anuraos')) { proxyScore += 4; }
  try {
    if (localStorage.getItem('bare-mux-path')) { proxyScore += 6; }
  } catch (e) { /* Ignorer fejl */ }
  if (proxyScore >= 4) {
    console.log(`NetShield: Proxy-lignende indhold fundet! Score: ${proxyScore}. Blokerer siden.`);
    try {
      chrome.runtime.sendMessage({ action: "proxyDetected" });
    } catch (e) {
      console.error("NetShield: Kunne ikke sende besked til baggrundsscriptet.", e);
    }
  }
}

/**
 * KØRSELS-LOGIK (Opgraderet med Referrer-Tjek)
 * Sørger for, at de rigtige funktioner kører på de rigtige tidspunkter.
 */
// 1. Kør AI-rensningen med det samme.
hideGoogleAiElements();

// 2. Kør de tunge analyser, efter siden er helt færdig.
window.addEventListener('load', () => {
  // UDVIDET LISTE: Den faste liste over kerne-sider.
  const coreSchoolSites = [
    'aula.dk', 'lectio.dk',
    'drive.google.com', 'docs.google.com', 'slides.google.com', 'classroom.google.com',
    'matematikfessor.dk', 'nota.dk', 'grammatip.com', 'ordbogen.com',
    'skoletube.dk', 'gyldendal-uddannelse.dk', 'clio.me', 'systime.dk',
'accounts.google.com',
'testogprøver.dk' ];

  // TJEK 1:  kerne-siderne?
  let isCoreSite = false;
  for (const site of coreSchoolSites) {
    if (window.location.hostname.includes(site)) {
      isCoreSite = true;
      break;
    }
  }

  // TJEK 2: kommer vi så fra en kerne-side?
  let isReferredFromCoreSite = false;
  if (!isCoreSite && document.referrer) {
    try {
      const referrerHostname = new URL(document.referrer).hostname;
      for (const site of coreSchoolSites) {
        if (referrerHostname.includes(site)) {
          isReferredFromCoreSite = true;
          break;
        }
      }
    } catch (e) {
      // Ignorer fejl, hvis referrer-URL'en er ugyldig.
    }
  }
  
  // Kør kun detektive, hvis siden ik er en kerne-side OG ik er henvist fra en kerne-side.
  if (!isCoreSite && !isReferredFromCoreSite) {
    setTimeout(() => {
      checkForProxyFingerprints();
      checkForGameFingerprints();
      checkForGoogleSitesAbuse();
      checkForCloudBrowser();
    }, 500);
   
  }
});
