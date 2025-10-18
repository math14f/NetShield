// Dette er HVIDLISTEN.
// Domæner og nøgleord på denne liste vil ALDRIG blive blokeret,
// selvom de indeholder et ord fra sortlisten.
// lavet af Mathias.
export const allowedSites = [
  // === Grundlæggende Systemer & Login ===
  "aula.dk",                  // Kommunikation i folkeskolen
  "lectio.dk",                // Udbredt på gymnasier (skema, afleveringer etc.)
  "studica.dk",               // Anvendes på nogle gymnasier i stedet for Lectio
  "unilogin.dk",              // Fælles login til mange af skolernes tjenester
  "broker.unilogin.dk",       // Del af Uni-Login infrastrukturen
  "idp.unilogin.dk",          // Del af Uni-Login infrastrukturen
  "mitid.dk",                 // Nødvendigt for login på mange offentlige sider
 
  // === Læringsplatforme ===
  "minuddannelse.net",        // Læringsplatform, udbredt i mange kommuner
  "meebook.com",              // Digital læringsplatform
  "easyiq.dk",                // Tilbyder bl.a. SkolePortal og Meddelelsesbog
  "kmd.dk",                   // Leverandør af bl.a. administrative systemer som KMD Nexus

  // === Google Workspace & Microsoft Office 365 ===
  "docs.google.com",      // Google Docs (Dokumenter)
  "sheets.google.com",    // Google Sheets (Regneark)
  "slides.google.com",    // Google Slides (Præsentationer)
  "forms.google.com",     // Google Forms (Spørgeskemaer)
  "drive.google.com",     // Google Drive (Filer og mapper)
  "classroom.google.com", // Google Classroom (Undervisningsplatform)
  "mail.google.com",      // Gmail
  "meet.google.com",      // Google Meet (Videomøder)
  "calendar.google.com",  // Google Calendar
  "sites.google.com",     // Google Sites (Hjemmesider)
  "keep.google.com",      // Google Keep (Noter)
  "jamboard.google.com",  // Google Jamboard (Digital tavle)
  "translate.google.com", // Google Translate  "microsoft.com",            
  "learn.microsoft.com", // Adgang til Office 365 (Word, PowerPoint, Excel, Teams)

  "accounts.google.com",  // Essentiel for al login og kontostyring
  "googleapis.com",       // Henter data og funktionalitet til næsten alle Google-apps
  "gstatic.com",          // Henter "statisk" indhold som billeder, ikoner og kode
  "googleusercontent.com",// Viser bruger-uploadet indhold (f.eks. billeder i Docs/Slides)
  "ggpht.com",            // Bruges ofte til profilbilleder og andet billedindhold
  "fonts.googleapis.com", // Henter skrifttyper, så dokumenter ser rigtige ud
  "fonts.gstatic.com",    // Henter selve skrifttype-filerne
  "office.com",

  // === Nationale & Tværgående Portaler ===
  "emu.dk",                   // Børne- og Undervisningsministeriets læringsportal
  "ug.dk",                    // UddannelsesGuiden om uddannelser i Danmark
  "optagelse.dk",             // Ansøgningsportal til ungdoms- og videregående uddannelser
  "mitcfu.dk",                // Center for Undervisningsmidlers materialer
  "faktalink.dk",             // Artikelsamling om mange emner
  "forfatterweb.dk",          // Forfatterleksikon
  "historiefaget.dk",         // Fagportal til historie
  "samfundsfaget.dk",         // Fagportal til samfundsfag
  "nota.dk",                  // Nationalbibliotek for mennesker med læsevanskeligheder

  // === Fagportaler & Digitale Læremidler (Grundskole) ===
  "gyldendal-uddannelse.dk",  // Fagportaler fra Gyldendal (fx dansk.gyldendal.dk)
  "alinea.dk",                // Udgiver af digitale læremidler
  "matematikfessor.dk",       // Digital matematikportal (under Alinea)
  "clio.me",                  // En bred vifte af fagportaler (fx dansk-, engelsk-, matematik-, historiefaget.clio.me)
  "grammatip.com",            // Træning af grammatik og sprog
  "restudy.dk",               // Videoundervisning i mange fag
  "biotechacademy.dk",        // Ressourcer til bioteknologi og naturfag

  // === Fagportaler & Digitale Læremidler (Gymnasiet) ===
  "systime.dk",               // Større udbyder af digitale undervisningsmaterialer til gymnasiet
  "lru.dk",                   // Lindhardt og Ringhof Uddannelse
  "praxis.dk",                // Online undervisningsmaterialer, især til erhvervsuddannelser, men også gymnasiet
  "columbus.dk",              // Forlag med materialer til bl.a. historie og oldtidskundskab

  // === Ordbøger & Opslagsværker ===
  "ordbogen.com",             // Udbredt online ordbog
  "denstoredanske.lex.dk",    // Den Store Danske Encyklopædi
  "sproget.dk",               // Ressourcer om det danske sprog
  "dsn.dk",                   // Dansk Sprognævn

  // === Værktøjer til Ordblinde ===
  "intowords.com",            // Læse- og skriveværktøj
  "adgangforalle.dk",         // Værktøjer og vejledning til læse- og skrivesvage
  "mv-nordic.com",            // Leverandør af hjælpeværktøjer som CD-ORD og AppWriter

  // === Kreativ Produktion, Præsentation & Samarbejde ===
  "youtube.com",              // Bruges til undervisningsvideoer og elevproduktioner
  "prezi.com",                // Præsentationsværktøj
  "canva.com",                // Grafisk design og præsentationer
  "padlet.com",               // Digital opslagstavle til samarbejde
  "trello.com",               // Projektstyring og samarbejde
  "mindmeister.com",          // Online mindmapping
  "coggle.it",                // Mindmapping og flowchart værktøj
  "scratch.mit.edu",          // Blokprogrammering og spiludvikling
  "bookcreator.com",          // Til at skabe digitale bøger
  "skoletube.dk",             // Platform til produktion, deling og lagring af medier
"findthetune.com", 
  // === Kodning & Teknologi ===
  "developer.chrome.com",               // Bruges i teknologifag og IT
  "code.org",                 // Introduktion til kodning
  "tinkercad.com",            // 3D-design og kodning

  // === Specifikke Fag-apps & Quiz-værktøjer ===
  "geogebra.org",             // Interaktivt matematikværktøj
  "kahoot.com",               // Spilbaseret læringsplatform
  "quizlet.com",              // Læringsværktøj med flashcards og quizzer
  "socrative.com",            // Værktøj til quiz og elevrespons
  "google.com/search?sca_esv=", 
"google.com/search?num=12&sca_esv=",
"www.google.com",
"myaccount.google.com",
"dr.dk",
"www.dr.dk",
"studio.flux3dp.com",
]; 
