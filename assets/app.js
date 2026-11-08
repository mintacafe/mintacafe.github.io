/* ===========================================================
   Minta Cafè website behaviour
   1. STORE LINKS      paste the URLs here when you have them
   2. Language toggle  English / Català
   3. Circell demo     a real, playable rotation board
   4. Brillantor demo  a real gamma lift on a dark photo
   5. Ploma            reopens in the time it really takes
   6. The dock         every app one click away, and where you are
   Vitrall's windows and Confitura's faces live in their own files
   (vitrall.js, confitura-faces.js).
   =========================================================== */

/* ── 1. Store links ───────────────────────────────────────────
   Leave a string empty and the button gives way to a "Coming
   soon to the App Store" line. Fill it in and the button shows.
   Nothing else needs changing.                                */
const STORE_LINKS = {
  circell:    "https://apps.apple.com/us/app/circell/id6795101676",           // iPhone, live 2026-10-06
  brillantor: "https://apps.apple.com/us/app/brillantor/id6797081377?mt=12",  // Mac, live 2026-08-10
  confitura:  "https://apps.apple.com/us/app/confitura-fruit-jam/id6823305160", // iPhone, live 2026-10-18
  vitrall:    "",                                                              // iPhone, coming soon
  planxa:     "",                                                              // iPhone, coming soon
  finestreta: "",                                                              // iPhone, coming soon
  segell:     "https://apps.apple.com/us/app/segell/id6824278913?mt=12",       // Mac, live 2026-10-26
  ploma:      "https://apps.apple.com/us/app/ploma-plain-text-editor/id6824293343?mt=12", // Mac, live 2026-10-26
  vistes:     "",                                                              // Apple TV and iPad, coming soon
};

/* How long Ploma takes to open on a Mac, from the click to the first frame on
   screen (Apps/Ploma/Docs/Rendiment.md, MacBook Pro M1 Max). The button under
   its window waits exactly this long. */
const PLOMA_LAUNCH_MS = 150;

/* ── 2. Copy, in both languages ───────────────────────────── */
const I18N = {
  en: {
    "html.lang": "en",
    "html.title": "Minta Cafè · small, honest apps for iPhone and Mac",
    "lang.toggle": "CA",
    "lang.aria": "Canvia la llengua a català",
    "skip": "Skip to content",

    "hero.title": "Small apps, made with care.",
    "hero.lede": "One payment, a round price. No ads, no subscriptions, no pay-to-win, no dark patterns. Each one is a pause, like a coffee.",

    "aparador.label": "The apps, screen by screen",
    "aparador.prev": "Previous",
    "aparador.next": "Next",
    "aparador.pause": "Stop the shop window",
    "aparador.play": "Let the shop window move",
    "carta.label": "All our apps",
    "dock.label": "Apps",
    "platform.ios": "iPhone",
    "platform.mac": "Mac",
    "platform.tv": "Apple TV & iPad",
    "group.games": "Games for iPhone",
    "group.games.lede": "To play at your own pace. Nothing nags you: no notifications, no streaks. Day or night, the way your phone is set, in English and Catalan.",
    "group.mac": "Tools for the Mac",
    "group.mac.lede": "Small and quick. Each one does one job, opens at once and never connects to the internet.",
    "group.tv": "For the TV and iPad",
    "tag.play": "Play it here",
    "tag.try": "Try it here",
    "tag.soon": "soon",

    "store.pre.ios": "Download on the",
    "store.pre.mac": "Download on the",
    "store.comingSoon": "Coming soon to the App Store",
    "receipt.whole": "{app}, the whole game",
    "receipt.noads": "Ad-free version",
    "receipt.updates": "Every update",
    "receipt.family": "Up to six in the family",
    "receipt.iap": "In-app purchases",
    "receipt.total": "Total",
    "receipt.coffee": "If you like the coffee,\nyou pay again tomorrow.",
    "receipt.yours": "If you like the game,\nit's already yours.",
    "receipt.thanks": "Thank you. Come back any time.",
    "receipt.refund.pre": "Not your cup of coffee? You can ",
    "receipt.refund.link": "ask Apple for your money back",
    "receipt.refund.post": ".",
    "receipt.aria": "What {app} costs",
    "carta.motto.a": "If you like the coffee, you pay again tomorrow.",
    "carta.motto.b": "If you like the game, it's already yours.",

    "circell.kind": "A puzzle for iPhone",
    "circell.tagline": "Turn, join, bloom.",
    "circell.body": "A puzzle of rotation and connection. Tap the tiles to turn the vine strands 90° until no end is left open and the whole board is one living vine. When the vine closes, a wave of golden light runs through it and it blooms.",
    "circell.f1": "A gentle ladder of levels that opens up as you go.",
    "circell.f2": "Everything drawn in code: no clutter, no noise.",
    "circell.f3": "Sound synthesised on the fly, and it never interrupts your music.",
    "circell.demo.hint": "Tap the tiles to close the vine.",
    "circell.demo.won": "The vine lives!",
    "circell.demo.new": "New board",
    "circell.demo.caption": "A real board. Play it right here.",

    "confitura.kind": "A puzzle for iPhone",
    "confitura.tagline": "Drop, merge, make jam.",
    "confitura.body": "Fruit falls into a glass jar. Two of the same that touch become the next one up, from blueberries to watermelons, and two watermelons make a finished jar of jam. When nothing more fits, the lid tries to close and the café tells you how many grams you made.",
    "confitura.f1": "Ten jam fruits that roll, squash and splash, all drawn in code.",
    "confitura.f2": "No timer. You let go when you are ready.",
    "confitura.f3": "A best of the week, so there is always something within reach.",
    "confitura.caption": "From the game itself. Keep an eye on the fruit: they're not quite asleep.",
    "confitura.shot.alt": "A glass jar on a café counter, full of fruit with sleepy faces; now and then one of them opens its eyes",

    "vitrall.kind": "A logic puzzle for iPhone",
    "vitrall.tagline": "Light, cell by cell.",
    "vitrall.body": "The numbers beside each line say which panes to light. Work it out without guessing, and when the last pane comes on the grid turns into a stained-glass window.",
    "vitrall.f1": "Every window can be solved by logic alone.",
    "vitrall.f2": "No timer, no lives, no score.",
    "vitrall.f3": "Make one to measure: its size and how hard, up to where you've reached.",
    "vitrall.caption": "Five windows from the game, a step harder each time. In the app they go on, up to 8×8.",

    "planxa.kind": "Turn-based strategy for iPhone",
    "planxa.tagline": "A griddle that waits for you.",
    "planxa.body": "Turn-based strategy, with burgers. A late-night diner where time only moves when you do: plan the rush and serve everyone the way they asked. It's a puzzle, not a race, so think for as long as you like, or put it down and come back tomorrow.",
    "planxa.f1": "One stroke of your thumb along a row is a single turn.",
    "planxa.f2": "You can't lose, and there's always a way of serving everybody.",
    "planxa.f3": "Make a night to measure: the ingredients and how hard.",
    "planxa.caption": "From the game itself. In dark mode, it's the late shift.",
    "planxa.shot.alt": "A diner counter by day: customers on stools, tickets, and burgers on a griddle",

    "finestreta.kind": "A cooking game for iPhone",
    "finestreta.tagline": "Pizza for the whole street.",
    "finestreta.body": "You run a pizza window on a street at dusk. Slap the dough, spread the tomato with your finger, scatter the toppings, fire it and hand it to whoever's waiting.",
    "finestreta.f1": "The menu grows by one dish a night.",
    "finestreta.f2": "Nothing punishes you: a lopsided pizza still gets eaten.",
    "finestreta.f3": "Make a night to measure: from a quiet street to a packed one.",
    "finestreta.caption": "From the game itself. In dark mode, the street lights come on.",
    "finestreta.shot.alt": "A pizza window on a street: neighbours with their tickets, an oven, and pizzas on a green marble counter",

    "ploma.kind": "A text editor for Mac",
    "ploma.tagline": "Opens in a blink.",
    "ploma.speed1.n": "0.15 s",
    "ploma.speed1": "from clicking the icon to your text on screen",
    "ploma.speed2.n": "0.2 ms",
    "ploma.speed2": "of work for each key, so it's on screen on the very next frame",
    "ploma.speed3.n": "0.19 s",
    "ploma.speed3": "to open a 146 MB file, with 37 MB of memory",
    "ploma.speed.note": "Measured on a MacBook Pro with an M1 Max.",
    "ploma.body": "For the moment you need to write something down: a list, meeting notes, a few lines of Markdown, a config file. Ploma is open before you have finished the thought, and every key you press is on screen on the very next frame. Quit without saving and everything is still there next time. It is a plain-text editor for notes, not a whole development environment, and it has no permission to use the network.",
    "ploma.f1": "Multiple cursors and a command palette, to change many lines at once.",
    "ploma.f2": "Markdown tables that line up by themselves, and boxes and arrows drawn in plain text.",
    "ploma.f3": "If a script or a coding assistant changes your file, you see each change and keep what you want.",
    "ploma.open": "Open it again",
    "ploma.opened": "Back in 0.15 s, as on a Mac.",
    "ploma.art.alt": "A Ploma window with a short Markdown note: headings, a short list, a small table with its columns lined up and three boxes joined by arrows drawn in text. The first tab has a dot because it has unsaved changes",
    "ploma.caption": "Ploma follows your Mac by default: light by day, dark at night. The dot on the first tab means unsaved changes: quit anyway, and they are still there next time.",

    "segell.kind": "A PDF signer for Mac",
    "segell.tagline": "Open, sign, done.",
    "segell.body": "Someone sends you a contract or a form, and it has to come back signed with your digital certificate. Until now that meant a big PDF suite that goes online and starts with your Mac. Segell is a small viewer that does just this: open the PDF, choose Sign…, pick your certificate (the one in your keychain, like idCAT, or a .p12 file) and you get a signed copy that other PDF readers accept. It has no permission to use the network, so your documents and your keys stay with you.",
    "segell.f1": "Put the signature where it belongs: drag a box over the line, or sign without a visible mark.",
    "segell.f2": "Signing something someone else already signed? Their signature stays valid.",
    "segell.f3": "Open a signed PDF and a strip tells you who signed it and whether it has changed since.",
    "segell.art.alt": "A Segell window with a signed document: a green strip at the top says who signed it and that it has not changed, and the blue signature box on the page carries the name, the date and the Minta Cafè leaf",
    "segell.art.file": "agreement-signed.pdf",
    "segell.art.banner": "Signed by Marta Puig on 18 Oct 2026 at 10:42. The document hasn’t changed since.",
    "segell.art.details": "Details…",
    "segell.box.signed": "Digitally signed",
    "segell.box.reason": "Approved",
    "segell.caption": "The signature box as Segell draws it. In dark mode the window goes dark, but the page stays paper.",

    "brillantor.kind": "A menu bar utility for Mac",
    "brillantor.tagline": "Lighter shadows, darker nights.",
    "brillantor.body": "A small sun in your menu bar. Open it on any screen and you get one slider for that screen. Push it right and the dark parts of the picture open up, for a film that is too dark to follow. Push it left and the screen goes darker than macOS will let it go, for reading in bed at three in the morning.",
    "brillantor.f1": "One slider. That is the whole app.",
    "brillantor.f2": "Each display keeps its own light, and gets it back when you plug it in again.",
    "brillantor.f4": "Restores your colours the moment you quit. Nothing is permanent.",
    "brillantor.slider.label": "Screen light",
    "brillantor.scene.alt": "A dark photo that opens up or dims further as you move the slider",
    "brillantor.demo.caption": "Move the slider both ways. The photo is the same one.",
    "brillantor.screen": "Built-in Display",
    "brillantor.off": "Turn Off",
    "brillantor.quit": "Quit Brillantor",
    "brillantor.neutral": "Neutral",
    "brillantor.lift": "Shadows +{n}%",
    "brillantor.dim": "Dimmed to {n}%",

    "vistes.kind": "Ambient, for Apple TV and iPad",
    "vistes.tagline": "Something lovely to leave on.",
    "vistes.body": "A girl with headphones studies by the window of a high flat, her cat asleep on the sill, the city and the sea outside. The sky keeps changing, the rain comes and goes, and the lofi is made live on your own device, so it never goes round a loop.",
    "vistes.f1": "Buy it once and it's yours, on the TV and on the iPad.",
    "vistes.f3": "Choose the moment of the day, how long a day lasts and the weather, or leave it be.",
    "vistes.f4": "Runs on every Apple TV, from the HD up.",
    "vistes.caption": "From the app itself. In dark mode, it's night and raining.",
    "vistes.shot.alt": "A pixel-art room: a girl with headphones at her desk, a cat asleep on the sill, and the sun going down over the city and the sea",

    "promise.title": "How we sell things",
    "promise.lede": "The same rules for every app we make. Written here so you can hold us to them.",
    "promise.c1.t": "One payment",
    "promise.c1.b": "You buy it once and it is yours. No subscription on what you already own.",
    "promise.c2.t": "A round price",
    "promise.c2.b": "Whole numbers. Nothing ends in .99 to look smaller than it is.",
    "promise.c3.t": "No ads",
    "promise.c3.b": "Nothing interrupts you, nothing asks you to wait or watch. And they aren't just switched off: there isn't a single line of ad code inside.",
    "promise.c4.t": "No tracking",
    "promise.c4.b": "No analytics, no ad profiles, no accounts, nothing about you sold. Inside there's only our code and Apple's: no one else's library doing things you can't see.",
    "promise.fine": "The small print, and it really is small. If we ever make a game that needs a server to connect players, that server costs us money every month, so that game may carry a subscription. We will say so here and on the App Store before you pay, never after. A game that talks to a server also has to send something, and we will spell out exactly what leaves your device and why. What we will never do is take something you have already bought and put it behind a subscription.",

    "brewing.title": "Brewing",
    "brewing.lede": "Being made now, in the same cup.",
    "brew.tiny": "A small space station, and its first tourists.",
    "brew.llancadores": "People, ships, and the way to the Moon.",

    "foot.support": "Questions, bugs, ideas. Write to us and a person answers.",
    "foot.privacy": "Privacy",
    "foot.top": "Back to top",
    "foot.made": "Made in Catalonia.",

    /* privacy.html */
    "html.title.privacy": "Privacy · Minta Cafè",
    "privacy.title": "Privacy",
    "privacy.lede": "The short version: our apps collect nothing at all.",
    "privacy.updated": "Last updated: November 2026",
    "privacy.h1": "What we collect",
    "privacy.p1": "Nothing. Our apps have no analytics, no crash reporting, no advertising identifiers and no accounts, and none of them opens a network connection.",
    "privacy.h2": "What stays on your device",
    "privacy.p2": "Some of our apps remember a few things on your device, so they can pick up where you left off. This is all of it, app by app:",
    /* One string per app, in the same order as the rows of privacy.html. */
    "privacy.app.circell": "Remembers which level you reached, your sound and music switches, and whether you pinned day or night.",
    "privacy.app.confitura": "Remembers your best ever, the best of the week, and day or night.",
    "privacy.app.brillantor": "Remembers nothing between launches.",
    "privacy.app.vitrall": "Remembers which level you reached, your last custom window, your sound and music switches, and day or night.",
    "privacy.app.planxa": "Remembers the night you reached and one left half done, the best takings of each night, what you already know how to do, your last custom night, your sound and music switches, and day or night.",
    "privacy.app.finestreta": "Remembers the night you reached, the money so far, your menu, what you already know how to do, your last custom night, your sound and music switches, and day or night.",
    "privacy.app.vistes": "Remembers your settings on your device: the time of day, how long a day lasts, the weather and the sound. Vistes collects nothing and never opens a network connection.",
    "privacy.app.segell": "Remembers which certificate you signed with last and whether you wanted the signature to show on the page. Your documents, certificates and keys never leave your Mac: the private key stays in the keychain, and a .p12 file is read in memory and never stored. Segell does not even have permission to use the network.",
    "privacy.app.ploma": "Remembers your preferences, the tabs, files and folders you had open, your recent files and folders, and any text you had not saved yet, so nothing is lost when you quit. All of it stays in Ploma's own folder on your Mac, and Ploma has no permission to use the network.",
    "privacy.p2b": "None of it ever leaves your device. On iPhone it goes when you delete the app. On a Mac, macOS may keep it in your Library folder after you delete the app; it is still only on your Mac.",
    "privacy.h3": "Third parties",
    "privacy.p3": "There are none. We use no SDKs from anyone else. If you buy an app, Apple handles the payment and tells us nothing about you beyond anonymous sales totals.",
    "privacy.h4": "This website",
    "privacy.p4": "This page is static, hosted on GitHub Pages. There are no cookies and no analytics. GitHub keeps standard server logs of requests, which we do not read.",
    "privacy.h5": "Children",
    "privacy.p5": "Because we collect nothing, our apps are safe for any age.",
    "privacy.h6": "Getting in touch",
    "privacy.p6": "Write to info@mintacafe.com and a person answers.",
    "privacy.back": "Back to Minta Cafè"
  },

  ca: {
    "html.lang": "ca",
    "html.title": "Minta Cafè · apps petites i honestes per a iPhone i Mac",
    "lang.toggle": "EN",
    "lang.aria": "Switch language to English",
    "skip": "Ves al contingut",

    "hero.title": "Apps petites, fetes amb cura.",
    "hero.lede": "Un sol pagament, preu rodó. Sense anuncis, sense subscripcions, sense pagar per guanyar, sense trampes. Cada una és una pausa, com un cafè.",

    "aparador.label": "Les apps, pantalla a pantalla",
    "aparador.prev": "Anteriors",
    "aparador.next": "Següents",
    "aparador.pause": "Atura l'aparador",
    "aparador.play": "Deixa que l'aparador es mogui",
    "carta.label": "Totes les nostres apps",
    "dock.label": "Apps",
    "platform.ios": "iPhone",
    "platform.mac": "Mac",
    "platform.tv": "Apple TV i iPad",
    "group.games": "Jocs per a iPhone",
    "group.games.lede": "Per jugar al teu ritme. Res no et reclama: ni avisos ni ratxes. De dia o de nit, com tinguis el telèfon, en català i en anglès.",
    "group.mac": "Eines per al Mac",
    "group.mac.lede": "Petites i ràpides. Cadascuna fa una sola feina, s'obre a l'instant i no es connecta mai a internet.",
    "group.tv": "Per a la tele i l'iPad",
    "tag.play": "Juga-hi aquí",
    "tag.try": "Prova-la aquí",
    "tag.soon": "aviat",

    "store.pre.ios": "Descarrega-la a l'",
    "store.pre.mac": "Descarrega-la al",
    "store.comingSoon": "Aviat a l'App Store",
    "receipt.whole": "{app}, el joc sencer",
    "receipt.noads": "Versió sense anuncis",
    "receipt.updates": "Totes les actualitzacions",
    "receipt.family": "Fins a sis de la família",
    "receipt.iap": "Compres dins del joc",
    "receipt.total": "Total",
    "receipt.coffee": "Si el cafè t'agrada,\ndemà el tornes a pagar.",
    "receipt.yours": "Si el joc t'agrada,\nja és teu.",
    "receipt.thanks": "Gràcies. Torna quan vulguis.",
    "receipt.refund.pre": "No és el teu cafè? Pots ",
    "receipt.refund.link": "demanar a Apple que et torni els diners",
    "receipt.refund.post": ".",
    "receipt.aria": "Què costa {app}",
    "carta.motto.a": "Si el cafè t'agrada, demà el tornes a pagar.",
    "carta.motto.b": "Si el joc t'agrada, ja és teu.",

    "circell.kind": "Un trencaclosques per a iPhone",
    "circell.tagline": "Gira, uneix, floreix.",
    "circell.body": "Un trencaclosques de rotació i connexió. Toca les caselles per girar els brins de vinya 90° fins que cap punta quedi oberta i tot el tauler sigui una sola parra viva. Quan la vinya es tanca, una onada de llum daurada la recorre i floreix.",
    "circell.f1": "Una escala suau de nivells que s'obre a mesura que avances.",
    "circell.f2": "Tot dibuixat amb codi: net, sense soroll.",
    "circell.f3": "So sintetitzat al moment, i mai no talla la teva música.",
    "circell.demo.hint": "Toca les caselles per tancar la vinya.",
    "circell.demo.won": "Vinya viva!",
    "circell.demo.new": "Tauler nou",
    "circell.demo.caption": "Un tauler de debò. Juga-hi aquí mateix.",

    "confitura.kind": "Un trencaclosques per a iPhone",
    "confitura.tagline": "Deixa caure, fon, fes confitura.",
    "confitura.body": "La fruita cau dins un pot de vidre. Dues d'iguals que es toquen es fonen en la següent, dels nabius fins a les síndries, i dues síndries fan un pot de confitura acabat. Quan ja no hi cap res més, la tapa intenta tancar i el cafè et diu quants grams n'has fet.",
    "confitura.f1": "Deu fruites de confitura que rodolen, s'aixafen i esquitxen, tot dibuixat amb codi.",
    "confitura.f2": "Sense rellotge. Deixes anar quan vols.",
    "confitura.f3": "Un rècord de la setmana, perquè sempre hi hagi alguna cosa a l'abast.",
    "confitura.caption": "Del joc mateix. No els treguis l'ull: no dormen del tot.",
    "confitura.shot.alt": "Un pot de vidre al taulell d'un cafè, ple de fruites amb cara de son; de tant en tant, una obre els ulls",

    "vitrall.kind": "Un trencaclosques de lògica per a iPhone",
    "vitrall.tagline": "Llum, cel·la a cel·la.",
    "vitrall.body": "Els números al costat de cada línia diuen quins vidres encendre. Dedueix-ho sense endevinar, i quan s'encén l'últim vidre la quadrícula es torna un vitrall.",
    "vitrall.f1": "Totes les finestres es resolen només amb lògica.",
    "vitrall.f2": "Sense rellotge, sense vides i sense puntuació.",
    "vitrall.f3": "Fes-te'n una a mida: la mida i la dificultat, fins on hagis arribat.",
    "vitrall.caption": "Cinc finestres del joc, cada una un pas més difícil. A l'app continuen, fins a 8×8.",

    "planxa.kind": "Estratègia per torns per a iPhone",
    "planxa.tagline": "Una planxa que t'espera.",
    "planxa.body": "Estratègia per torns, amb hamburgueses. Una cafeteria de nit on el temps només passa si tu actues: planifica l'hora punta i serveix cadascú tal com ho vol. És un trencaclosques, no una cursa, així que pensa tant com vulguis, o deixa-ho i torna-hi demà.",
    "planxa.f1": "Una passada de dit al llarg d'una fila és un sol torn.",
    "planxa.f2": "No es pot perdre, i sempre hi ha manera de servir tothom.",
    "planxa.f3": "Fes-te una nit a mida: els ingredients i la dificultat.",
    "planxa.caption": "Del joc mateix. En mode fosc, és el torn de nit.",
    "planxa.shot.alt": "El taulell d'una cafeteria de dia: gent als tamborets, tiquets i hamburgueses a la planxa",

    "finestreta.kind": "Un joc de cuina per a iPhone",
    "finestreta.tagline": "Pizzes per a tot el carrer.",
    "finestreta.body": "Portes una finestra de pizzeria en un carrer al capvespre. Pica la massa, escampa el tomàquet amb el dit, deixa anar els ingredients, enforna i serveix.",
    "finestreta.f1": "La carta creix un plat cada nit.",
    "finestreta.f2": "Res no et castiga: una pizza torta també es menja.",
    "finestreta.f3": "Fes-te una nit a mida: d'un carrer tranquil a un de ple.",
    "finestreta.caption": "Del joc mateix. En mode fosc, s'encenen els fanals.",
    "finestreta.shot.alt": "Una finestra de pizzeria al carrer: veïns amb els seus tiquets, un forn i pizzes en un taulell de marbre verd",

    "ploma.kind": "Un editor de text per a Mac",
    "ploma.tagline": "S'obre en un parpelleig.",
    "ploma.speed1.n": "0,15 s",
    "ploma.speed1": "de clicar la icona a tenir el text a la pantalla",
    "ploma.speed2.n": "0,2 ms",
    "ploma.speed2": "de feina per tecla: surt a la pantalla al fotograma següent",
    "ploma.speed3.n": "0,19 s",
    "ploma.speed3": "per obrir un fitxer de 146 MB, amb 37 MB de memòria",
    "ploma.speed.note": "Mesurat en un MacBook Pro amb M1 Max.",
    "ploma.body": "Per al moment en què has d'apuntar alguna cosa: una llista, les notes d'una reunió, quatre línies de Markdown, un fitxer de configuració. Ploma ja és oberta abans que acabis de pensar-ho, i cada tecla surt a la pantalla al fotograma següent. Si surts sense desar, ho retrobes tot la propera vegada. És un editor de text pla per apuntar, no un entorn de programació sencer, i no té permís per fer servir la xarxa.",
    "ploma.f1": "Multicursor i paleta d'ordres, per canviar moltes línies d'un cop.",
    "ploma.f2": "Taules de Markdown que s'alineen soles, i quadres i fletxes dibuixats amb text.",
    "ploma.f3": "Si un script o un assistent de programació et canvia el fitxer, veus cada canvi i et quedes el que vols.",
    "ploma.open": "Torna-la a obrir",
    "ploma.opened": "Tornada en 0,15 s, com al Mac.",
    "ploma.art.alt": "Una finestra de Ploma amb una nota curta en Markdown: títols, una llista curta, una taula petita amb les columnes alineades i tres quadres units per fletxes dibuixades amb text. La primera pestanya porta una rodona perquè té canvis sense desar",
    "ploma.caption": "Per defecte, Ploma segueix el Mac: clara de dia i fosca de nit. La rodona de la primera pestanya vol dir canvis sense desar: surt igualment, i la propera vegada encara hi seran.",

    "segell.kind": "Per signar PDFs al Mac",
    "segell.tagline": "Obre, signa i prou.",
    "segell.body": "T'envien un contracte o un formulari i l'has de tornar signat amb el teu certificat digital. Fins ara calia un paquet de PDF enorme que es connecta a internet i s'engega amb el Mac. Segell és un visor petit que fa just això: obre el PDF, tria Signa…, escull el certificat (el del clauer, com l'idCAT, o un fitxer .p12) i tens una còpia signada que els altres lectors de PDF donen per bona. No té permís per fer servir la xarxa: els teus documents i les teves claus es queden amb tu.",
    "segell.f1": "La signatura on toca: arrossega un requadre sobre la línia, o signa sense que es vegi.",
    "segell.f2": "Signes un document que algú ja ha signat? La seva signatura continua valent.",
    "segell.f3": "Obre un PDF signat i una franja et diu qui l'ha signat i si ha canviat des d'aleshores.",
    "segell.art.alt": "Una finestra de Segell amb un document signat: una franja verda a dalt diu qui l'ha signat i que no ha canviat, i el requadre blau de la signatura porta el nom, la data i la fulla de Minta Cafè",
    "segell.art.file": "contracte-signat.pdf",
    "segell.art.banner": "Signat per Marta Puig el 18 oct. 2026, 10:42. El document no ha canviat des de llavors.",
    "segell.art.details": "Detalls…",
    "segell.box.signed": "Signat digitalment",
    "segell.box.reason": "Conforme",
    "segell.caption": "El requadre de la signatura, tal com el dibuixa Segell. En mode fosc la finestra es fa fosca, però la pàgina continua sent paper.",

    "brillantor.kind": "Una utilitat de la barra de menú per a Mac",
    "brillantor.tagline": "Ombres més clares, nits més fosques.",
    "brillantor.body": "Un solet a la barra de menú. Obre'l a qualsevol pantalla i tens un control per a aquella pantalla. Cap a la dreta, les zones fosques de la imatge s'obren, per a una pel·lícula massa fosca de seguir. Cap a l'esquerra, la pantalla es fa més fosca del que el macOS et deixa arribar, per llegir al llit a les tres de la matinada.",
    "brillantor.f1": "Un control lliscant. L'app és això.",
    "brillantor.f2": "Cada pantalla guarda la seva llum, i la recupera quan la tornes a connectar.",
    "brillantor.f4": "Recupera els teus colors just en sortir. Res no és permanent.",
    "brillantor.slider.label": "Llum de la pantalla",
    "brillantor.scene.alt": "Una foto fosca que s'obre o s'enfosqueix encara més quan mous el control",
    "brillantor.demo.caption": "Mou el control cap als dos costats. La foto és la mateixa.",
    "brillantor.screen": "Pantalla integrada",
    "brillantor.off": "Desactiva",
    "brillantor.quit": "Surt de Brillantor",
    "brillantor.neutral": "Neutre",
    "brillantor.lift": "Ombres +{n}%",
    "brillantor.dim": "Enfosquida al {n}%",

    "vistes.kind": "Ambient, per a l'Apple TV i l'iPad",
    "vistes.tagline": "Una cosa bonica per deixar encesa.",
    "vistes.body": "Una noia amb cascos estudia al costat de la finestra d'un pis alt, amb el gat dormint a l'ampit i la ciutat i el mar a fora. El cel no para de canviar, la pluja va i ve, i la lofi es fa en directe al teu aparell, de manera que no dóna mai voltes a cap bucle.",
    "vistes.f1": "La compres un cop i és teva, a la tele i a l'iPad.",
    "vistes.f3": "Tria el moment del dia, quant dura un dia i el temps, o deixa-ho estar.",
    "vistes.f4": "Va a totes les Apple TV, des de la HD.",
    "vistes.caption": "De l'app mateixa. En mode fosc, és de nit i plou.",
    "vistes.shot.alt": "Una habitació en píxels: una noia amb cascos a l'escriptori, un gat dormint a l'ampit, i el sol que es pon sobre la ciutat i el mar",

    "promise.title": "Com venem les coses",
    "promise.lede": "Les mateixes regles per a totes les apps que fem. Escrites aquí perquè ens hi puguis fer complir.",
    "promise.c1.t": "Un sol pagament",
    "promise.c1.b": "La compres una vegada i és teva. Cap subscripció sobre el que ja és teu.",
    "promise.c2.t": "Preu rodó",
    "promise.c2.b": "Xifres senceres. Res no acaba en .99 per semblar més barat.",
    "promise.c3.t": "Sense anuncis",
    "promise.c3.b": "Res no t'interromp, res no et fa esperar ni mirar. I no és que estiguin apagats: dins l'app no hi ha ni una línia de codi d'anuncis.",
    "promise.c4.t": "Sense seguiment",
    "promise.c4.b": "Ni analítiques, ni perfils publicitaris, ni comptes, ni res teu venut. A dins només hi ha el nostre codi i el d'Apple: cap llibreria d'altres que faci coses que no veus.",
    "promise.fine": "La lletra petita, i és petita de debò. Si algun dia fem un joc que necessiti un servidor per connectar jugadors, aquell servidor ens costarà diners cada mes, i per tant aquell joc pot portar subscripció. Ho direm aquí i a l'App Store abans que paguis, mai després. Un joc que parla amb un servidor també ha d'enviar alguna cosa, i direm exactament què surt del teu dispositiu i per què. El que no farem mai és agafar una cosa que ja has comprat i posar-la darrere d'una subscripció.",

    "brewing.title": "Al foc",
    "brewing.lede": "S'estan fent ara, a la mateixa tassa.",
    "brew.tiny": "Una estació espacial petita, i els seus primers turistes.",
    "brew.llancadores": "Gent, naus, i el camí fins a la Lluna.",

    "foot.support": "Dubtes, errors, idees. Escriu-nos i et contesta una persona.",
    "foot.privacy": "Privadesa",
    "foot.top": "Torna a dalt",
    "foot.made": "Fet a Catalunya.",

    /* privacy.html */
    "html.title.privacy": "Privadesa · Minta Cafè",
    "privacy.title": "Privadesa",
    "privacy.lede": "La versió curta: les nostres apps no recullen absolutament res.",
    "privacy.updated": "Darrera actualització: novembre del 2026",
    "privacy.h1": "Què recollim",
    "privacy.p1": "Res. Les nostres apps no tenen analítiques, ni informes d'errors, ni identificadors publicitaris, ni comptes, i cap d'elles obre una connexió de xarxa.",
    "privacy.h2": "Què es queda al teu dispositiu",
    "privacy.p2": "Algunes de les nostres apps recorden poques coses al teu dispositiu, per continuar on ho vas deixar. Això és tot, app per app:",
    "privacy.app.circell": "Recorda a quin nivell has arribat, els teus interruptors de so i música i si has fixat el dia o la nit.",
    "privacy.app.confitura": "Recorda el teu rècord absolut, el de la setmana i el dia o la nit.",
    "privacy.app.brillantor": "No recorda res entre execucions.",
    "privacy.app.vitrall": "Recorda a quin nivell has arribat, l'última finestra a mida, els interruptors de so i de música, i si vols dia o nit.",
    "privacy.app.planxa": "Recorda la nit on has arribat i la que tenies a mitges, els millors diners de cada nit, què ja saps fer, l'última nit a mida, els interruptors de so i de música, i si vols dia o nit.",
    "privacy.app.finestreta": "Recorda la nit on has arribat, els diners, la carta, què ja saps fer, l'última nit a mida, els interruptors de so i de música, i si vols dia o nit.",
    "privacy.app.vistes": "Recorda els teus ajustos a l'aparell: el moment del dia, quant dura un dia, el temps i el so. Vistes no recull res i no obre mai cap connexió de xarxa.",
    "privacy.app.segell": "Recorda amb quin certificat vas signar l'última vegada i si volies que la signatura es veiés a la pàgina. Els teus documents, certificats i claus no surten mai del Mac: la clau privada es queda al clauer, i un fitxer .p12 es llegeix en memòria i no es guarda enlloc. Segell no té ni tan sols permís per fer servir la xarxa.",
    "privacy.app.ploma": "Recorda les teves preferències, les pestanyes, fitxers i carpetes que tenies oberts, els fitxers i carpetes recents, i el text que encara no havies desat, perquè no es perdi res en sortir. Tot es queda a la carpeta pròpia de Ploma al teu Mac, i Ploma no té permís per fer servir la xarxa.",
    "privacy.p2b": "Res d'això no surt mai del dispositiu. A l'iPhone s'esborra quan esborres l'app. Al Mac, el macOS el pot conservar a la teva carpeta Biblioteca després d'esborrar l'app; continua sent només al teu Mac.",
    "privacy.h3": "Tercers",
    "privacy.p3": "No n'hi ha. No fem servir cap SDK de ningú altre. Si compres una app, Apple gestiona el pagament i no ens diu res de tu més enllà de totals de vendes anònims.",
    "privacy.h4": "Aquest web",
    "privacy.p4": "Aquesta pàgina és estàtica i està allotjada a GitHub Pages. No hi ha galetes ni analítiques. GitHub manté registres de servidor estàndard de les peticions, que nosaltres no llegim.",
    "privacy.h5": "Infants",
    "privacy.p5": "Com que no recollim res, les nostres apps són segures per a qualsevol edat.",
    "privacy.h6": "Contacte",
    "privacy.p6": "Escriu a info@mintacafe.com i et contesta una persona.",
    "privacy.back": "Torna a Minta Cafè"
  }
};

/* ── Language machinery ───────────────────────────────────── */

const LANG_KEY = "minta-lang";
const saved = localStorage.getItem(LANG_KEY);
const asked = (new URLSearchParams(location.search).get("lang") || "").toLowerCase();

/* Ordre: mana la URL, després el que vas triar l'últim cop, i si no, el
   navegador. ?lang=ca és on van a parar les rutes /ca/, i és el que poden
   dur els enllaços de suport de l'App Store. */
let lang = (I18N[asked] && asked)
        || (I18N[saved] && saved)
        || ((navigator.language || "en").toLowerCase().startsWith("ca") ? "ca" : "en");

/* Una llengua demanada per URL es recorda, perquè els enllaços interns no
   porten el paràmetre i si no es perdria en el primer clic. */
if (I18N[asked]) localStorage.setItem(LANG_KEY, lang);

/* Que l'adreça digui la veritat: així copiar-la de la barra ja és un enllaç
   que obre la pàgina en la llengua que estàs veient. */
function syncLangUrl() {
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(null, "", url);
}

function t(key) {
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

function applyLang() {
  const dict = I18N[lang];
  document.documentElement.lang = dict["html.lang"];
  const titleKey = document.documentElement.dataset.titleKey || "html.title";
  if (dict[titleKey]) document.title = dict[titleKey];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const val = dict[el.dataset.i18n];
    if (val != null) el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const val = dict[el.dataset.i18nAria];
    if (val != null) el.setAttribute("aria-label", val);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach(el => {
    const val = dict[el.dataset.i18nAlt];
    if (val != null) el.setAttribute("alt", val);
  });

  const toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.querySelector(".lang__flip").textContent = dict["lang.toggle"];
    toggle.setAttribute("aria-label", dict["lang.aria"]);
  }

  document.dispatchEvent(new CustomEvent("langchange"));
}

document.getElementById("langToggle")?.addEventListener("click", () => {
  lang = lang === "ca" ? "en" : "ca";
  localStorage.setItem(LANG_KEY, lang);
  syncLangUrl();
  applyLang();
});

/* ── 3. Circell: a playable board ─────────────────────────── */
/* Bits: N=1 E=2 S=4 W=8. A random spanning tree over the grid
   guarantees the board is solvable; then every tile is spun. */

const COLS = 4, ROWS = 4;
const DIRS = [
  { bit: 1, dx:  0, dy: -1, opp: 4 },  // N
  { bit: 2, dx:  1, dy:  0, opp: 8 },  // E
  { bit: 4, dx:  0, dy:  1, opp: 1 },  // S
  { bit: 8, dx: -1, dy:  0, opp: 2 }   // W
];

const rot = (mask, times) => {
  let m = mask;
  for (let i = 0; i < (times % 4 + 4) % 4; i++) m = ((m << 1) | (m >> 3)) & 15;
  return m;
};

function spanningTree() {
  const masks = new Array(COLS * ROWS).fill(0);
  const seen  = new Array(COLS * ROWS).fill(false);
  const stack = [[0, 0]];
  seen[0] = true;

  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const open = DIRS.filter(d => {
      const nx = x + d.dx, ny = y + d.dy;
      return nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !seen[ny * COLS + nx];
    });
    if (!open.length) { stack.pop(); continue; }
    const d  = open[(Math.random() * open.length) | 0];
    const nx = x + d.dx, ny = y + d.dy;
    masks[y * COLS + x]   |= d.bit;
    masks[ny * COLS + nx] |= d.opp;
    seen[ny * COLS + nx] = true;
    stack.push([nx, ny]);
  }
  return masks;
}

const board = document.getElementById("board");
const status = document.getElementById("boardStatus");
/* `turns` is the logical quarter-turn (0 to 3); `spin` only ever grows, so a
   tile going from 3 back to 0 still turns forwards on screen. */
let base = [], turns = [], spin = [], won = false;

function tileSVG(mask) {
  const bits = DIRS.filter(d => mask & d.bit);
  const ends = {
    1: "M50 50 L50 0",
    2: "M50 50 L100 50",
    4: "M50 50 L50 100",
    8: "M50 50 L0 50"
  };
  const stems = bits.map(d => `<path class="stem" d="${ends[d.bit]}"/>`).join("");
  const bud = bits.length === 1 ? '<circle class="bud" cx="50" cy="50" r="5"/>' : "";
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g class="tile__art">${stems}<circle class="hub" cx="50" cy="50" r="9"/>${bud}</g></svg>`;
}

function isSolved() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const i = y * COLS + x;
      const m = rot(base[i], turns[i]);
      for (const d of DIRS) {
        if (!(m & d.bit)) continue;
        const nx = x + d.dx, ny = y + d.dy;
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return false;
        const n = ny * COLS + nx;
        if (!(rot(base[n], turns[n]) & d.opp)) return false;
      }
    }
  }
  return true;
}

function paint() {
  board.querySelectorAll(".tile").forEach((tile, i) => {
    tile.querySelector(".tile__art").style.transform = `rotate(${spin[i] * 90}deg)`;
  });
}

function checkWin() {
  if (!isSolved()) return;
  won = true;
  board.classList.add("is-won");
  status.textContent = t("circell.demo.won");
  status.classList.add("is-won");
  board.querySelectorAll(".tile").forEach((tile, i) => {
    const x = i % COLS, y = (i / COLS) | 0;
    const art = tile.querySelector(".tile__art");
    art.style.transitionDelay = "";
    tile.querySelectorAll(".stem, .hub").forEach(el => {
      el.style.transitionDelay = `${(x + y) * 70}ms`;
    });
  });
}

function newBoard() {
  base = spanningTree();
  won = false;
  board.classList.remove("is-won");
  status.classList.remove("is-won");
  status.textContent = t("circell.demo.hint");

  // Spin every tile; make sure we do not hand out an already-solved board.
  do {
    turns = base.map(() => (Math.random() * 4) | 0);
  } while (isSolved());
  spin = turns.slice();

  board.innerHTML = "";
  base.forEach((mask, i) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.innerHTML = tileSVG(mask);
    tile.setAttribute("aria-label",
      `Rotate tile ${(i % COLS) + 1}, ${((i / COLS) | 0) + 1}`);
    tile.addEventListener("click", () => {
      if (won) return;
      turns[i] = (turns[i] + 1) % 4;
      spin[i] += 1;
      tile.querySelector(".tile__art").style.transform = `rotate(${spin[i] * 90}deg)`;
      checkWin();
    });
    board.appendChild(tile);
  });
  paint();
}

document.getElementById("newBoard")?.addEventListener("click", newBoard);

/* Keep the board's caption in the right language when it switches. */
document.addEventListener("langchange", () => {
  if (!status) return;
  status.textContent = won ? t("circell.demo.won") : t("circell.demo.hint");
});

/* ── 4. Brillantor: a real gamma lift ─────────────────────── */
/* Exactly what the app does to your displays: gamma = 1 / boost. */

const boost = document.getElementById("boost");
const funcs = document.querySelectorAll("#gammaFuncs > *");
const readout = document.getElementById("boostReadout");
const offRow = document.getElementById("offRow");

/* The same `t` as the app: -1 is as dark as it goes, 0 is neutral, +1 lifts
   the shadows the most. An feFunc computes amplitude * C^exponent, which maps
   one to one onto what CGSetDisplayTransferByFormula does in main.swift:
   a pure gamma to lift, a linear scale to dim. */
function applyBoost() {
  const level = parseFloat(boost.value);
  let exponent = 1, amplitude = 1;

  if (level > 0.001) {
    exponent = 1 / (1 + 1.5 * level);        // lift the shadows
  } else if (level < -0.001) {
    amplitude = 1 + 0.75 * level;            // dim below the system minimum
  }

  funcs.forEach(f => {
    f.setAttribute("exponent", exponent.toFixed(3));
    f.setAttribute("amplitude", amplitude.toFixed(3));
  });

  const neutral = Math.abs(level) < 0.05;
  offRow.classList.toggle("is-off", neutral);
  offRow.disabled = neutral;
  readout.textContent =
    neutral   ? t("brillantor.neutral")
  : level > 0 ? t("brillantor.lift").replace("{n}", Math.round(level * 150))
              : t("brillantor.dim").replace("{n}", Math.round(amplitude * 100));
}

if (boost) {
  boost.addEventListener("input", applyBoost);
  document.addEventListener("langchange", applyBoost);
  // Turn Off: this screen back to neutral, as the app does.
  offRow.addEventListener("click", () => {
    boost.value = 0;
    applyBoost();
  });
}

/* Quit row follows the language too. */
document.addEventListener("langchange", () => {
  const quit = document.querySelector(".popover__item--quiet");
  if (quit) quit.textContent = t("brillantor.quit");
});

/* ── Store links ──────────────────────────────────────────── */
/* With a link the button shows; without one, "Coming soon" takes its place. */

function wireStores() {
  document.querySelectorAll("[data-store]").forEach(box => {
    const url = STORE_LINKS[box.dataset.store];
    const link = box.querySelector("[data-store-link]");
    box.classList.toggle("is-soon", !url);
    if (link && url) link.href = url;
  });
}

/* ── Prices: on the carta, and one receipt ────────────────── */
/* Every dish on the carta carries its price, like a café's menu, and "How we
   sell things" has one receipt: what a game costs and what it doesn't. The
   prices are in your own currency (preus.js, from App Store Connect), guessed
   from your time zone or else your browser's language, and never named: a shop
   just shows you its price. When we can't tell, euros. ?store=JP shows another.
   Without the price table nothing is shown: better no price than a wrong one. */

const PRICES = window.MINTA_PRICES;
const REFUND_URL = "https://reportaproblem.apple.com/";

function guessStore() {
  const asked = (new URLSearchParams(location.search).get("store") || "").toUpperCase();
  if (PRICES.stores[asked]) return asked;
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (PRICES.zones[zone]) return PRICES.zones[zone];
  } catch (e) { /* no time zone: try the language */ }
  for (const tag of navigator.languages || [navigator.language || ""]) {
    const m = /[-_]([A-Za-z]{2})(?:[-_]|$)/.exec(tag);
    if (m && PRICES.stores[m[1].toUpperCase()]) return m[1].toUpperCase();
  }
  return "ES";
}

function money(amount, currency) {
  const whole = Number.isInteger(amount);
  try {
    return new Intl.NumberFormat(lang === "ca" ? "ca" : "en", {
      style: "currency", currency, currencyDisplay: "narrowSymbol",
      minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2,
    }).format(amount);
  } catch (e) {
    return `${amount} ${currency}`;
  }
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function paintPrices() {
  if (!PRICES) return;
  const [currency, ...columns] = PRICES.stores[guessStore()];
  const priceOf = key => columns[PRICES.apps[key]];

  document.querySelectorAll("[data-price]").forEach(node => {
    const price = priceOf(node.dataset.price);
    if (price != null) node.textContent = money(price, currency);
  });

  // The receipt: one real game as the example, so it doesn't read as "all 3".
  const box = document.querySelector("[data-receipt]");
  const price = box && priceOf(box.dataset.receipt);
  if (price == null) return;
  const name = document.querySelector(`#${box.dataset.receipt} h2`)?.textContent || box.dataset.receipt;

  // Name and amount pairs: a list for a screen reader, two columns to the eye.
  const lines = (cls, rows) => {
    const dl = el("dl", cls);
    rows.forEach(([label, amount]) => {
      const pair = el("div");
      pair.append(el("dt", null, label), el("dd", null, money(amount, currency)));
      dl.append(pair);
    });
    return dl;
  };
  const items = lines("receipt__lines", [
    [t("receipt.whole").replace("{app}", name), price],
    [t("receipt.noads"), 0],
    [t("receipt.iap"), 0],
    [t("receipt.updates"), 0],
    [t("receipt.family"), 0],
  ]);
  items.setAttribute("aria-label", t("receipt.aria").replace("{app}", name));

  const refund = el("p", "receipt__refund", t("receipt.refund.pre"));
  const link = el("a", null, t("receipt.refund.link"));
  link.href = REFUND_URL;
  link.rel = "noopener";
  refund.append(link, t("receipt.refund.post"));

  // The paper inside carries the torn edge; the box outside, its shadow.
  const paper = el("div", "receipt__paper");
  paper.append(
    el("p", "receipt__brand", "Minta Cafè"),
    el("p", "receipt__addr", "mintacafe.com"),
    items,
    lines("receipt__lines receipt__lines--total", [[t("receipt.total"), price]]),
    el("p", "receipt__motto", t("receipt.coffee")),
    el("p", "receipt__motto receipt__motto--yours", t("receipt.yours")),
    el("p", "receipt__thanks", t("receipt.thanks")),
    refund,
  );
  box.replaceChildren(paper);
  box.hidden = false;
}

document.addEventListener("langchange", paintPrices);

/* ── 5. Ploma: it opens in the time it really takes ───────── */
/* The window goes, and comes back after exactly as long as Ploma takes from
   the click to its first frame on a Mac. Nothing else is staged. */

const plomaOpen = document.getElementById("plomaOpen");
const plomaWindow = document.querySelector(".plm");
const plomaTime = document.getElementById("plomaTime");
let plomaTimer = 0;

if (plomaOpen && plomaWindow) {
  plomaOpen.addEventListener("click", () => {
    clearTimeout(plomaTimer);
    plomaWindow.classList.add("is-closed");
    plomaTime.textContent = "";
    plomaTimer = setTimeout(() => {
      plomaWindow.classList.remove("is-closed");
      plomaTime.textContent = t("ploma.opened");
    }, PLOMA_LAUNCH_MS);
  });
  document.addEventListener("langchange", () => {
    if (plomaTime.textContent) plomaTime.textContent = t("ploma.opened");
  });
}

/* ── The shop window ──────────────────────────────────────── */
/* It drifts slowly to the left, round and round (a second set of the same
   screens follows the first). It stands still while the mouse is over it or a
   link in it has the focus; a finger, the trackpad or the arrows take it over,
   and it drifts again a few seconds after you let go. The button stops it for
   good. With "less motion" it never moves: then it's a strip you pass yourself.

   While it drifts the belt slides (a transform, smooth at any speed); when you
   take over, that offset becomes the track's scroll, so nothing jumps. */

const strip = document.getElementById("aparador");
const track = document.getElementById("aparadorTrack");
const belt = track && track.querySelector(".aparador__belt");

if (strip && track && belt) {
  const SPEED = 20;     // points a second
  const REST = 3500;    // ms after you let go before it drifts again
  const lessMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let offset = 0, loop = 0, drifting = false, stopped = false;
  let hovering = false, focused = false, visible = false;
  /* It waits a moment before setting off, so the first look is a still one. */
  let touchedAt = performance.now() - REST + 1500, ownScrollAt = -Infinity, last = 0, frame = 0;

  const ends = () => {
    const pos = drifting ? offset : track.scrollLeft;
    strip.classList.toggle("is-start", pos < 8);
    strip.classList.toggle("is-end", !drifting && track.scrollLeft + track.clientWidth > track.scrollWidth - 8);
  };

  /* The second set, for the round trip: hidden from screen readers and Tab. */
  const double = () => {
    if (belt.dataset.doubled) return;
    [...belt.children].forEach(item => {
      const copy = item.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.querySelectorAll("a").forEach(a => { a.tabIndex = -1; });
      belt.appendChild(copy);
    });
    belt.dataset.doubled = "1";
  };
  const measure = () => {
    const half = belt.children.length / 2;
    loop = belt.children[half].offsetLeft - belt.children[0].offsetLeft;
    if (loop > 0) offset %= loop;
  };

  const scrollTo = x => { ownScrollAt = performance.now(); track.scrollLeft = x; };
  const takeOver = () => {
    if (!drifting) return;
    drifting = false;
    belt.style.transform = "";
    scrollTo(offset);
    strip.classList.remove("is-drifting");
  };
  const letGo = () => {
    offset = loop > 0 ? track.scrollLeft % loop : track.scrollLeft;
    scrollTo(0);
    belt.style.transform = `translate3d(${-offset}px, 0, 0)`;
    drifting = true;
    strip.classList.add("is-drifting");
  };
  const touched = () => { touchedAt = performance.now(); takeOver(); };

  const tick = now => {
    frame = 0;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const may = !stopped && !lessMotion.matches && !hovering && !focused && now - touchedAt > REST;
    if (may) {
      if (!drifting) letGo();
      offset += SPEED * dt;
      if (loop > 0 && offset >= loop) offset -= loop;
      belt.style.transform = `translate3d(${-offset}px, 0, 0)`;
      ends();
    }
    if (visible && !document.hidden && !stopped && !lessMotion.matches) frame = requestAnimationFrame(tick);
  };
  const run = () => {
    if (!frame && visible && !document.hidden && !stopped && !lessMotion.matches) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  if (!lessMotion.matches) { double(); measure(); }
  addEventListener("resize", () => { measure(); ends(); });

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; run(); }).observe(strip);
  document.addEventListener("visibilitychange", run);
  lessMotion.addEventListener?.("change", () => { if (lessMotion.matches) takeOver(); else { double(); measure(); run(); } });

  strip.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hovering = true; });
  strip.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") { hovering = false; touchedAt = performance.now() - REST + 900; run(); } });
  strip.addEventListener("focusin", () => { focused = true; touched(); });
  strip.addEventListener("focusout", () => { focused = false; });
  track.addEventListener("pointerdown", touched);
  track.addEventListener("touchstart", touched, { passive: true });
  track.addEventListener("wheel", e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) touched(); }, { passive: true });
  track.addEventListener("scroll", () => {
    if (performance.now() - ownScrollAt > 120) touchedAt = performance.now();
    ends();
  }, { passive: true });

  strip.querySelectorAll(".aparador__nav").forEach(button => button.addEventListener("click", () => {
    touched();
    track.scrollBy({ left: +button.dataset.dir * track.clientWidth * 0.7, behavior: lessMotion.matches ? "auto" : "smooth" });
  }));

  const pause = document.getElementById("aparadorPause");
  pause?.addEventListener("click", () => {
    stopped = !stopped;
    pause.setAttribute("aria-pressed", String(stopped));
    pause.setAttribute("aria-label", t(stopped ? "aparador.play" : "aparador.pause"));
    strip.classList.toggle("is-stopped", stopped);
    if (stopped) takeOver(); else { touchedAt = -Infinity; run(); }
  });
  document.addEventListener("langchange", () => {
    pause?.setAttribute("aria-label", t(stopped ? "aparador.play" : "aparador.pause"));
  });

  ends();
}

/* ── 6. The dock ──────────────────────────────────────────── */
/* The icons show in the header once the menu at the top has scrolled away,
   and the one of the app on screen is ringed. */

const head = document.getElementById("head");
const dock = document.getElementById("dock");
const carta = document.getElementById("carta");

if (head && dock) {
  if (carta) {
    new IntersectionObserver(([entry]) => {
      head.classList.toggle("has-dock", !entry.isIntersecting);
    }, { rootMargin: "-56px 0px 0px 0px" }).observe(carta);
  } else {
    head.classList.add("has-dock");
  }

  const links = new Map([...dock.querySelectorAll("a")].map(a => [a.hash.slice(1), a]));
  const mark = id => links.forEach((a, key) => {
    if (key === id) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
  /* A room counts as the one on screen while it crosses the middle of the window. */
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) mark(e.target.id); });
  }, { rootMargin: "-45% 0px -54% 0px" });
  document.querySelectorAll("section.app").forEach(room => spy.observe(room));
}

/* ── Small touches ────────────────────────────────────────── */

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Xarxa de seguretat per a l'àncora: el navegador hi salta abans que el text
   es tradueixi i que les imatges agafin l'alçada final, i llavors el punt on
   ha anat ja no és el bo. Ho refem quan la pàgina ja té la mida definitiva.
   Importa perquè /#support és l'enllaç de suport de l'App Store. */
addEventListener("load", () => {
  const el = location.hash && document.getElementById(location.hash.slice(1));
  if (el) requestAnimationFrame(() => el.scrollIntoView());
});

/* ── Go ───────────────────────────────────────────────────── */

applyLang();   // its "langchange" also paints the prices
wireStores();
if (board) newBoard();
if (boost) applyBoost();
