# NetShield - Et Moderne Webfilter til Skolemiljøer

NetShield er et open-source, intelligent og privatlivs-sikkert webfilter, designet fra bunden til at løse de moderne udfordringer, som danske skoler står over for med webfiltrering.

Projektet blev startet som en direkte reaktion på de begrænsninger og sårbarheder, der findes i ældre systemer. Målet var at skabe en løsning, der ikke kun er mere effektiv, men også er bygget på principper om datasikkerhed, ydeevne og brugervenlighed for administratorer.

Hvorfor NetShield?

NetShield er designet til at være en komplet afløser for forældede løsninger som LetSpær. Det er teknisk overlegent på alle afgørende punkter:

🚀 Moderne & Fremtidssikret: Bygget på Googles nyeste Manifest V3 og den lynhurtige Declarative Net Request API. Dette sikrer maksimal ydeevne uden at gøre browseren langsommere og garanterer, at NetShield vil blive ved med at virke i fremtiden.

🔒 100% Privatlivs-sikker (GDPR-venlig): Takket være DNR API'en kan NetShield teknisk set aldrig se, læse eller logge elevernes browsing-historik. Al filtrering sker lokalt i browserens kerne. Der sendes ingen persondata.

🧠 Intelligent & Proaktiv Blokering: Bruger avancerede Regex-mønstre til at genkende og blokere tusindvis af ukendte proxy-sider, omgåelses-værktøjer og nye trusler, i det øjeblik de dukker op.

🤖 Avanceret Indholds-Analyse: En indbygget "agent" scanner aktivt hjemmesider for at finde skjulte trusler. Den kan:
Fjerne Google AI-oversigter: Fjerner dynamisk de AI-genererede svar direkte fra Googles søgeresultater for at modvirke snyd.
Identificere skjulte proxy-sider: Genkender de tekniske "fingeraftryk" fra proxy-scripts, selv på sider med uskyldige navne.
Opdage spil-portaler: Genkender spil baseret på den teknologi, de er bygget med (f.eks. Unity, Canvas), ikke kun deres navn.

🕹️ Total Kontrol for Administratorer: NetShield er designet til central styring via Google Admin. Administratorer kan fjernstyre simple sort- og hvidlister via eksterne tekstfiler, hvilket gør daglig vedligeholdelse utrolig nem og hurtig.

🛡️ Multi-Lags Forsvar: Et avanceret prioritetssystem med separate, specialiserede regelsæt (lokal/fjern, sortliste/hvidliste, force-block, billed-blokering) sikrer maksimal beskyttelse uden at blokere for kritisk undervisningsmateriale.

Arkitektur

NetShield er bygget på en separat arkitektur, der adskiller den indbyggede, intelligente motor fra de simple, admin-styrede lister:
Den Lokale Motor (Udvikler-styret): De lokale .js-filer indeholder de avancerede, kraftfulde Regex-regler og den grundlæggende funktionalitet. Dette er NetShields "hjerne".

De Fjernstyrede Lister (Admin-styret): Via Google Admin kan administratoren pege på simple .txt-filer. Disse bruges til hurtigt at tilføje specifikke domæner til sort- eller hvidlisten uden at skulle redigere i koden.

Dette design sikrer en robust, fejlsikker og ekstremt fleksibel platform.

Status
Version 3.2 er i øjeblikket under gennemgang i Chrome Web Store.
