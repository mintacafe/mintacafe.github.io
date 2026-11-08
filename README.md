# Web de Minta Cafè

Web estàtic per publicitar **Circell**, **Confitura**, **Vitrall**, **Planxa** i **Finestreta** (iPhone),
**Ploma**, **Segell** i **Brillantor** (Mac), i **Vistes** (Apple TV i iPad). Sense dependències, sense build,
sense fonts externes: HTML, CSS i JS a mà. Les apps no tenen versió de prova, així que **la demo és la
web**: tot el que es pot provar aquí és el de debò, tret de quantitat.

## Com està feta la portada

D'amunt a avall:

0. **L'aparador** (`.aparador`), just sota el títol: les pantalles de debò de les nou apps, una al
   costat de l'altra, com en un aparador, que es desplacen a poc a poc cap a l'esquerra i tornen a
   començar (20 punts per segon, `SPEED` a `app.js`). S'aturen sota el ratolí o si un enllaç seu té
   el focus; un dit, el trackpad o les fletxes (només amb ratolí) les prenen, i tornen a moure's
   3,5 s després de deixar-les; el botonet de sota les atura del tot. Amb «menys moviment» no es
   mou mai. Mentre llisca es mou la cinta (`transform`); quan la prens, aquell desplaçament passa a
   ser el de la pista, perquè no salti res. Les imatges són a `assets/aparador/`, de les captures de
   la botiga (`Screenshots/AppStore-*`), reduïdes a WebP; les finestres de Mac, retallades amb les
   seves cantonades. (David, 7/11: un carrusel dels d'abans que passa d'un en un, no; que es
   desplaci a poc a poc, sí.)
1. **La carta** (`.carta`). Totes les apps d'un cop d'ull, com la carta d'un cafè, en tres grups:
   jocs per a iPhone, eines per al Mac, per a la tele. Cada plat és la icona de l'app, el nom, la
   frase i, si és el cas, «aviat» i «juga-hi aquí» / «prova-la aquí». Un clic porta al seu panell.
2. **El moll** (`.dock`, a la capçalera). Les nou icones, per saltar a qualsevol app des de qualsevol
   lloc. Surt quan la carta ja no es veu (`has-dock`, a `app.js`) i l'app que tens a la pantalla porta
   un anell de menta. A `privacy.html` hi és sempre, i hi porta (`index.html#app`).
3. **Els capítols** (`.chapter`): «Jocs per a iPhone», «Eines per al Mac», «Per a la tele i l'iPad». El
   que val per a tots els jocs (mode nit, català i anglès, res que et reclami) es diu un cop aquí i no a
   cada joc.
4. **Els panells** (`section.app`). Cada app és en un panell translúcid, el mateix per a totes
   (`--panel`), perquè els capítols quedin clarament a part. El color de cada app és el de la seva
   frase, les xifres i les vinyetes (`--say-<app>`, de dia i de nit, a dalt de `style.css`). Dins:
   icona, nom, què és, la frase, l'art i el text (un paràgraf, tres punts i el botó de la botiga).
   En pantalla ampla l'art va a un costat i el text a l'altre, alternant; al mòbil, nom, frase, art
   i text. (Abans cada app tenia una franja del seu color; David, 7/11: «millor sense».)
5. **El compromís**, **Al foc** i el peu.

L'art de cada app:

| App | Què s'hi veu | D'on surt |
|---|---|---|
| Circell | un tauler 4×4 jugable | `app.js`: arbre d'expansió aleatori, sempre té solució |
| Confitura | la captura del joc, i de tant en tant una fruita obre els ulls, dues de iguals es miren o una badalla | `confitura-faces.js`, amb la imatge sense cares del mateix fotograma (vegeu més avall) |
| Vitrall | cinc finestres jugables, de les primeres del joc | `vitrall.js` i `vitrall.css` (vegeu més avall) |
| Planxa, Finestreta | captures del director del joc | `assets/<app>-dia.jpg` i `-nit.jpg` |
| Ploma | la finestra dibuixada en SVG, i un botó que la torna a obrir en el temps que triga de debò | `app.js`, `PLOMA_LAUNCH_MS` |
| Segell | la finestra, amb el requadre de signatura que dibuixa l'app | SVG a `index.html` |
| Brillantor | una foto fosca i el control de l'app, amb la correcció de gamma de debò | `app.js` |
| Vistes | dues captures de l'Apple TV en un marc de tele | `assets/vistes-*.jpg` |

Les captures de dia i de nit van amb `<picture>`: la de nit quan el navegador va en mode fosc. Surten
dels directors de captures de cada joc (mida de 6,3 polzades, reduïdes a 600 px d'amplada).

Segell: el requadre de la signatura és el que dibuixa l'app (`Features/Signing/SignatureAppearance.swift`
del repositori de Segell, amb els mateixos números per a un requadre de 240 × 84).

Ploma: la finestra té les mides de l'app (Menlo 16 en una graella de 9,633 × 19, el marge de números, el
minimapa de 96, la barra de pestanyes de 32 i la d'estat de 24) i els colors dels temes Minta Light i
Minta Dark de `Core/Theme/Theme.swift`, que d'entrada segueixen el Mac. La nota hi és en anglès i en
català: el CSS amaga la que no toca segons el `lang` de la pàgina.

### La velocitat de la Ploma

És el que més importa de la Ploma, i per això va just sota la frase: tres xifres i d'on surten. Són
les de `Apps/Ploma/Docs/Rendiment.md` (MacBook Pro M1 Max): **0,15 s** de clicar la icona al primer
fotograma amb el text, **0,2 ms** de feina per tecla, **0,19 s** per obrir un fitxer de 146 MB amb
37 MB de memòria. El botó «Torna-la a obrir» amaga la finestra i la torna a ensenyar al cap de
`PLOMA_LAUNCH_MS` (150 ms, a dalt de `app.js`): el que hi veus és el temps de debò. **Si es tornen a
mesurar, canvia les xifres als dos idiomes (`ploma.speed*`) i la constant.**

### El Vitrall jugable

`assets/vitrall.js` i `assets/vitrall.css`, sense res més: es munta a `[data-vitrall-demo]`, dins la
pantalla del telèfon (`.phone__screen--live`), i ho dibuixa tot ell (la paret, els números, el
vitrall, el botó Pinta/Nota). És un port del joc: les mateixes regles, els mateixos colors i el mateix
dibuix (`WindowArt`, `WallArt`).

Les cinc finestres són nivells del joc, en aquest ordre: **6, 8, 13, 25 i 36**. Cadascuna porta una
idea nova de l'escala del joc (amable, tancar línies amb notes, solapament, abast, bloc), perquè
qualsevol en pugui fer la primera i a la cinquena calgui pensar. Les solucions són les del joc
(`Sources/World/Nonogram.swift` i `Ladder.swift`); si l'escala del joc canvia, cal copiar-les de nou.

### Les cares de la Confitura

La captura de la Confitura és la de debò, i a sobre hi ha un `<canvas>` (`assets/confitura-faces.js`)
que només pinta quan una fruita fa una cara: retalla la mateixa fruita de la imatge sense cares
(`confitura-*-bare.jpg`, el mateix fotograma) i hi dibuixa la cara amb el codi del joc
(`FruitArt.paintExpression`). Quan ningú no fa res, el llenç és buit i es veu la captura tal qual. Les
imatges i les posicions de cada fruita surten del director `-ConfituraWebStill` del joc.

Res de tot això es fa si el navegador demana poc moviment (`prefers-reduced-motion`), ni quan la
secció no es veu.

### Els preus, la frase i el tiquet

Cada plat de la carta porta el seu preu, com a la carta d'una cafeteria, i al peu hi ha la frase de
la casa: «Si el cafè t'agrada, demà el tornes a pagar. **Si el joc t'agrada, ja és teu.**» A «Com
venem les coses», al costat de les regles, hi ha un sol tiquet: el que costa un joc i el que no (la
versió sense anuncis, les compres de dins, les actualitzacions, la família fins a sis: 0), «Gràcies.
Torna quan vulguis.», i que si no és el teu cafè pots demanar a Apple que et torni els diners
(`reportaproblem.apple.com`: a la UE i al Regne Unit són 14 dies sense explicacions; a la resta ho
decideix Apple, per això diu «pots demanar»).

Els preus surten en la moneda de qui mira, sense dir mai el país: l'endevina per la zona horària i,
si no, per la regió de la llengua del navegador; si no en sap res, euros. `?store=JP` ensenya els
d'una altra botiga. Són a `assets/preus.js`, generat per `Eines/preus-web.py` (al repositori de Minta
Cafè) des d'App Store Connect: **cal tornar-lo a generar quan canviï un preu o surti una app nova**, i
`--comprova` el compara amb el que diu la botiga de debò. Sense aquest fitxer no surt cap preu ni el
tiquet: millor res que un preu equivocat.

Les regles «Sense anuncis» i «Sense seguiment» diuen que a dins no hi ha codi d'anuncis ni cap
llibreria d'altres, només el nostre codi i el d'Apple. Comprovat el 8/11/2026 a les nou apps (i a
MintaKit): només importen marcs d'Apple, MintaKit i els seus mòduls, i cap no fa servir la xarxa. Si
mai s'hi afegeix una dependència de fora, cal treure-ho.

```
Web/
├── index.html              la pàgina principal
├── privacy.html            política de privadesa (l'App Store en demana una URL)
├── assets/
│   ├── style.css           paleta Solarpunk-Mint, sales de cada app, mode clar i fosc
│   ├── app.js              enllaços, idiomes, Circell, Brillantor, Ploma, el moll, preus i tiquet
│   ├── preus.js            els preus de cada botiga (generat: no el toquis)
│   ├── vitrall.js / .css   el Vitrall jugable
│   ├── confitura-faces.js  les cares de la Confitura
│   ├── icons/<app>.webp    icones de 192 px, de l'AppIcon de cada app
│   └── <app>-dia.jpg, -nit.jpg   captures, de dia i de nit
├── CNAME                   domini personalitzat de GitHub Pages
└── .nojekyll               serveix els fitxers tal com són
```

## Afegir una app

1. **Icona**: `assets/icons/<app>.webp`, 192 × 192, de l'`icon-1024.png` de l'AppIcon. Les de Mac
   porten la seva forma i un marge transparent de 100 px: retalla'l (de 100 a 924) abans de reduir-la.
   A l'HTML, `icon--ios` (el navegador l'arrodoneix) o `icon--mac` (ja és rodona).
2. **Un plat a la carta** i **una icona al moll**, a `index.html` i al moll de `privacy.html`.
3. **Un panell**: `<section class="app" id="<app>">`, copiant-ne un de la mateixa plataforma
   (`app--flip` si toca l'art a l'esquerra), i el seu color, `--say-<app>`, de dia i de nit, a dalt
   de `style.css`, més la línia `#<app> { --say: …; }`.
4. **Una pantalla a l'aparador**: una imatge a `assets/aparador/` i el seu `<li class="vitrina">`.
5. **Els textos** als dos idiomes de `app.js`: `<app>.kind`, `.tagline`, `.body`, `.f1`–`.f3`,
   `.caption`, i l'`alt` de les captures. Pensant en qui la voldria, no com una llista de funcions.
6. **L'enllaç de la botiga** a `STORE_LINKS` (buit mentre no hi sigui) i **la fila de privadesa**.
7. **El preu**: el plat de la carta porta `<span class="dish__price" data-price="<app>">`; posa l'app
   a `APPS` d'`Eines/preus-web.py` i torna a fer córrer l'eina.
8. **Si és de Mac**, a l'aparador porta la icona a la cantonada: `<img class="vitrina__badge icon
   icon--mac" …>` just després del seu `.vitrina__glass`.

## Veure'l en local

```bash
cd Web && python3 -m http.server 8000
```

I obre <http://localhost:8000>. (Dins de Claude Code també hi ha la
configuració `mintacafe-web`, que serveix aquesta carpeta amb
`.claude/serve.js` al port 8766.)

## Forçar la llengua per URL

El web tria la llengua sol (el que vas triar l'últim cop, i si no, el
navegador), però es pot manar des de la URL. Serveix per als enllaços de
suport de l'App Store, o per enviar una pàgina a algú sabent com la veurà.

| Enllaç | Què obre |
|---|---|
| `mintacafe.com/?lang=ca` | portada en català |
| `mintacafe.com/privacy.html?lang=en` | privadesa en anglès |
| `mintacafe.com/ca/` | el mateix que `/?lang=ca` |
| `mintacafe.com/ca/privacy.html` | el mateix que `/privacy.html?lang=ca` |

Qui mana de debò és **`?lang=`**. Les carpetes `ca/` i `en/` són quatre fitxers
d'una línia que hi redirigeixen, perquè GitHub Pages és estàtic i no pot
reescriure rutes. Així el contingut no està duplicat enlloc: hi ha un sol
`index.html` i un sol `privacy.html`.

La llengua demanada per URL es desa, perquè els enllaços interns no porten el
paràmetre i si no es perdria en el primer clic. I el botó CA/EN actualitza
l'adreça, o sigui que copiar-la de la barra ja dona un enllaç que obre la
pàgina tal com la veus. Les demos (Vitrall, Confitura) escolten el mateix canvi
(`langchange`).

⚠️ Si hi afegeixes pàgines noves, recorda fer-ne els dos redirectors a `ca/` i
`en/`, o les rutes boniques donaran 404 per a aquella pàgina.

## Enllaços de l'App Store

Són a dalt de tot de `assets/app.js`, a `STORE_LINKS`, i és l'únic lloc on cal tocar. Amb la cadena
buida, en lloc del botó surt «Aviat a l'App Store»; quan hi poses una URL, surt el botó. Les de Mac
porten `?mt=12`.

A la carta, les que encara no hi són porten «aviat» al costat del nom: quan surtin, cal treure aquest
`<small class="dish__soon">` a mà.

## La política de privadesa

`privacy.html` no ha de créixer amb cada app. Les seccions generals («què
recollim», «tercers», «aquest web»…) **no anomenen cap app**: parlen de «les
nostres apps». El que és de cada app és una fila de la llista de «What stays on
your device» (`<dl class="appdata">`), amb la plataforma al costat del nom.

Afegir una app hi és:

1. una fila nova a `privacy.html`, amb `id` igual a la clau de l'app (així
   `privacy.html#segell` porta a la seva fila);
2. el text de la fila, `privacy.app.<clau>`, als dos idiomes de `assets/app.js`;
3. la seva icona al moll de dalt, com a la portada.

Si una app recull o envia alguna cosa, això ja no és una fila: cal tornar a
escriure les seccions generals, perquè deixarien de ser veritat.

## Desplegar a GitHub Pages

Es publica fent push a `main` del repositori de la web (`env -u GH_TOKEN -u GITHUB_TOKEN`). El fitxer
`CNAME` apunta a `mintacafe.com` i el DNS del domini ja va cap a GitHub.

## Coses que hi ha per decidir

- **Preus.** No surten escrits enlloc del web (la majoria costen 3 €, la Ploma 5 €), i així no
  s'ha de mantenir per a cada país. El compromís («un sol pagament, preu rodó») sí que hi és.
- **Botons de l'App Store.** Són fets a mà amb la tipografia del web. Apple
  demana el seu *badge* oficial per a la promoció; val la pena
  baixar-lo de l'Apple Marketing Resources i posar-lo al seu lloc.
- **Imatge per compartir** (og:image). Posa'n una de 1200×630 a `assets/og.png` i afegeix
  `<meta property="og:image" content="https://mintacafe.com/assets/og.png">`.

## Accessibilitat i detalls

- Bilingüe anglès/català amb el botó CA/EN; recorda la tria i, la primera
  vegada, tria segons l'idioma del navegador.
- Mode fosc automàtic (`prefers-color-scheme`).
- Respecta `prefers-reduced-motion`: res es mou sol.
- Sense animacions d'entrada: el que es mou sol és l'aparador, a poc a poc, i les fruites.
- El tauler de Circell del web és jugable de veritat: genera un arbre
  d'expansió aleatori sobre la graella, així sempre té solució.
- El control de Brillantor aplica una correcció de gamma real (filtre SVG
  `feFuncR/G/B type="gamma"`, exponent `1/boost`), exactament el que fa l'app
  a les pantalles.
