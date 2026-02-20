# NetShield 🛡️
**Et Moderne, Intelligent og Privatlivs-Sikkert Webfilter til Skolemiljøer**

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/giihajigclffejnamppnoocgchebmagm.svg)](https://chromewebstore.google.com/detail/netshield/giihajigclffejnamppnoocgchebmagm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Er I trætte af webfiltre, der halter bagefter? Filtre, der kræver endeløse manuelle lister, og som eleverne let omgår ved at downloade "offline" filer, bruge ukendte proxy-sider eller skjule sig bag Google Sites?

**NetShield er løsningen.** Det er ikke bare endnu et simpelt URL-filter; det er en intelligent agent bygget fra bunden på Googles nyeste teknologi (Manifest V3) for at løse den moderne skoles udfordringer proaktivt.

---

## 🛡️ Nøglefunktioner

### 🧠 Intelligent Indholds-Analyse (Content Aware)
NetShield kigger ikke kun på URL'en, men analyserer sidens adfærd og kode i realtid.
* **Stopper Proxyer:** Genkender de tekniske "fingeraftryk" fra avancerede unblockers (f.eks. Ultraviolet, BareMux, Rammerhead), selv når de hostes på helt nye eller skjulte domæner.
* **Fanger Spil proaktivt:** Identificerer spil-portaler ved at scanne metadata og teknologier (Unity WebGL, Canvas), så uskyldige undervisnings-sites går fri.
* **Sikrer Google Sites:** Opdager automatisk, når platforme som Google Sites misbruges til at hoste spil eller proxyer.

### 🔎 Google Uden Snyd (Behold 'Alle' fanen)
I stedet for at blokere hele Google.com eller tvinge elever over i specifikke faner, renser NetShield søgningen kirurgisk.
* **Fjerner AI-Svar:** Skjuler automatisk "AI-oversigter" på tværs af sprog, så eleverne ikke får serveret det færdige svar. Understøtter også snart Bing Copilot og Ecosia.
* **Bevarer Værktøjerne:** Lader Google-værktøjer som ordbøger, lommeregner og fakta-bokse forblive intakte til gavn for undervisningen.

### 📂 Offline & Lokal Sikkerhed (Zero-Config)
Elever omgår ofte traditionelle filtre ved at gemme proxy-filer lokalt på computeren.
* **Fil-Vagt (Ny i v3.5):** NetShield overvåger browseren for lokale HTML-filer (`file://`) og cloaked sider (`about:blank`), der forsøger at agere browsere, og blokerer dem øjeblikkeligt.
* **Klar til brug:** Kræver ikke, at IT-afdelingen manuelt aktiverer "Allow access to file URLs" i Google Workspace.

---

## ⚙️ Total Kontrol for IT-Administratorer

NetShield er designet til Enterprise-styring via Google Workspace. Gennem `schema.json` får IT-afdelingen fuld kontrol over udrulningen:
* **Admin Regex:** Tilføj hurtigt ord (f.eks. "fortnite"), der skal blokeres på tværs af alle domæner.
* **Super Hvidliste (Prioritet 4):** En "Nødbremse", der tvinger adgang til vitale sider, uanset hvad filterets indbyggede logik ellers dikterer. IT har altid det sidste ord.
* **Fjernstyrede Lister:** Peg på simple `.csv`-filer for at opdatere sort- og hvidlister globalt på sekunder uden at røre ved selve udvidelsen.

---

## 🔒 Arkitektur & Privatliv (Privacy by Design)

Datasikkerhed er kernen i NetShield. I modsætning til ældre løsninger ("Forensic Logging"), der overvåger og logger elevernes adfærd, arbejder NetShield ud fra princippet om at *fjerne fristelsen*.

* **100% GDPR-sikker:** Vi indsamler, gemmer eller sender INGEN browsing-historik eller personlige data.
* **Lokal Afvikling:** Al filtrering sker lokalt i browserens kerne via **Declarative Net Request API**. Ingen elevdata forlader enheden.
* **Fremtidssikret & Lynhurtig:** Bygget eksklusivt på **Manifest V3**. Dette sikrer maksimal ydeevne uden at dræne Chromebookens batteri eller CPU, og garanterer kompatibilitet langt ind i fremtiden.

---

## 🚀 Status & Installation

* **Version 3.5** er live og kan installeres via Chrome Web Store.
* **Version 3.6** er under aktiv udvikling.

👉 **[Installer NetShield fra Chrome Web Store her](https://chromewebstore.google.com/detail/netshield/giihajigclffejnamppnoocgchebmagm)**

---

## 🤝 Bidrag & Kontakt

NetShield er Open Source (MIT Licens), og hele kildekoden kan inspiceres af enhver IT-afdeling for fuld transparens. 

Skoler og kommuner opfordres til at bidrage eller forke projektet. Læs venligst vores [CONTRIBUTING.md](CONTRIBUTING.md) før du opretter en Pull Request.

*Udviklet med stolthed i Thisted for at sikre danske skolers digitale arbejdsmiljø.*
