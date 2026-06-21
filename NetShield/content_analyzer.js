// Copyright (c) 2026 Mathias Andersen - All Rights Reserved
// NetShield - Under MIT License
// Filnavn: content_analyzer.js
// Version 3.8
// NS-CANARY-ID: 7b8f-9a2c-7r5e-bf63-8201-THISTED-SHIELD

console.log("NetShield [Isolated World]: Indlæser content_analyzer.js...");

// Modtag besked fra Main World (via CustomEvent) og videresend til background.js
document.addEventListener('NetShieldViolation', (e) => {
    const reason = e.detail ? e.detail.reason : 'unknown';
    console.log(" NetShield [Isolated World]: Modtog violation-event fra Main World. Årsag:", reason);
    try {
        console.log("NetShield [Isolated World]: Sender 'violationDetected' til background.js...");
        chrome.runtime.sendMessage({ action: "violationDetected", reason: reason });
    } catch(err) {
        console.error("NetShield [Isolated World]: Fejl ved afsendelse af besked til background.js:", err.message);
    }
});
