// Filnavn: blocked_sites.js
// Version 3.0 - Optimeret med nøgleord fra snedsted skole liste' og research fra mig

export const blockedSites = [
  // ==========================================================
  // 🧱 KATEGORI 1: PROXY, VPN, OMGÅELSE & TEKNISKE BAGDØRE
  // ==========================================================
  "pr[o0]xy|proxies|proxfree|proxysite|kproxy|croxy", // Fanger alle former for 'proxy' pøve bare
  "unbl[o0]ck(er|ing)?|blockaway|siteunblocker", // Fanger alt med 'unblock'
  "bypass|censor|bypassi",
  "tunnel|webtunnel",
  "hideip|hideme|hide.me|hidemyass|hide.mn|hidester", // Alt med 'hide'
  "vpn|atlasvpn|cyberghost|expressvpn|nordvpn|protonvpn|privatevpn|surfshark|ipvanish", // Fanger 'vpn' og store brands
  "browser\\.lol|webvm|cloudvm|browserling", // Cloud browsere
  "shadowpc|now\\.gg|replit|codesandbox|glitch|geforcenow", // Remote desktops & kodnings-bagdøre
  "github",
  "turbowarp|sh1mmer.me", // Kendte skole-exploits

  // ==========================================================
  // 🤖 KATEGORI 1.5: AI-VÆRKTØJER (CHAT & BILLEDE)
  // ==========================================================
  "chatgpt|gpt-?4|gpt-?3|gpt-3\\.5", // Alt med GPT
  "openai|bard|gemini|claude|copilot|perplexity|grok", // Store AI-modeller
  "aistudio.google", // Google's AI-værktøj
  "you\\.com|huggingface|poe\\.com|replicate|deepai", // AI-platforme
  "midjourney|dall-?e|dalle|stable-?diffusion|bluewillow|nightcafe", // Billed-generatorer
  "jasper.ai|writesonic|synthesia|quillbot|socrative", // Skrive- og studie-AI'er

  // ==========================================================
  // 💬 KATEGORI 2: SOCIALE MEDIER, CHAT & FORA
  // ==========================================================
  "tiktok|douyin", //  den kinesiske version håber jeg haha
  "snapchat",
  "instagram",
  "facebook|meta.ai",
  "discord",
  "reddit",
  "twitch",
  "twitter|x\\.com",
  "telegram|t.me",
  "whatsapp",
  "messenger",
  "9gag",
  "omegle|ome.tv|monkey.app|chatrandom|emeraldchat|joingy", // Random chat
  "bereal|vero.co",
  "patreon|onlyfans", // 18+ af hvad jeg siger platforme
  "quora|substack|medium", // Forum/blog platforme
  
  // ==========================================================
  // 🎮 KATEGORI 3: SPIL, SPIL-SIDER 
  // ==========================================================
  "poki|kizi|friv|spilxl|gratisspil|bgames|agame|y8|y9|a10|miniclip", // Store spil-portaler
  "coolmathgame|crazygames|addictinggames|armorgames|kongregate|mousebreaker", // Flere portaler
  "roblox|fortnite|minecraft|epicgames", // Store spil
  "agar|slither|slope|cookieclicker|paper-io|amogus|amongus", // Specifikke populære spil
  "\\d{1,2}v\\d{1,2}", // Fanger 1v1.lol osv.
   "csgo|cs.money|dmarket|skinport|skinsmonkey", // CS:GO skin gambling
"definitelyscience.com",
"4j.com",
"y10.com",

  // ==========================================================
  // 🎬 KATEGORI 4: STREAMING, PIRATKOPIERING & SHOPPING
  // ==========================================================
  "netflix|disneyplus|hbo|viaplay|primevideo|hbomax|max\\.com", // Streaming-tjenester
  "putlocker|solarmovie|fmovies|123movies|myflixer|cineb|soap2day|sflix", // Pirat-sider
  "1337x|piratebay|rarbg", // Torrent-sider
  "crunchyroll|pluto.tv|tubitv|popcornflix", // Gratis (distraherende) streaming
  "amazon|ebay|alibaba|aliexpress|shein|temu|wish|zalando", // Store shopping-sider
  "adidas|nike|hummel|jackjones|calvinklein|ganni|samsoe", // Tøj-brands
  "bilka|fotex|elgiganten|power|proshop|coolshop", // Dansk butikker
  
  // ==========================================================
  // 🚫 KATEGORI 5: PORNO, NSFW & CHOK-SIDER
  // ==========================================================
  "porn|xxx|nsfw|adult|erotic|hentai|rule34", // Generelle termer
  "\\bsex\\b|\\bbutt\\b|\\bass\\b|\\bboob\\b|\\bcum\\b|\\blick\\b|\\bfap\\b", // Aggressive ord med "Word Boundaries"
  "xvideos|xnxx|pornhub|brazzers|redtube|xhamster|spankbang", // Store porno-brands
  "goatse|tubgirl|lemonparty|meatspin|2girls1cup", // Kendte chok-sider

  // ==========================================================
  // 🎲 KATEGORI 6: GAMBLING & BETTING (Opgraderet)
  // ==========================================================
  // Generelle termer, der er relativt sikre
  "gambling|poker|slots",

  // Brands, 
  "mariacasino|tivolicasino|888sport|spilnu|unibet|leovegas|mrgreen",

  // Brands, der indeholder almindelige ord - disse kræver "Word Boundari"
  // Ved at adskille dem er de mere præcise.
  "\\bbetting\\b",
  "\\bcasino\\b",
  "\\bnetbet\\b",
  "\\bbetfair\\b",
  "\\bbetsson\\b",
  "\\bbetway\\b",
  
  // smarte mønster for "bet" + tal
  "bet\\d{3,}"
];
