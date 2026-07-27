# Web de Minta Cafè

Web estàtic per publicitar **Circell** (iPhone) i **Brillantor** (Mac). Sense
dependències, sense build, sense fonts externes: HTML, un CSS i un JS. Tot el
visual és programàtic, la mateixa filosofia que MintaKit.

```
Web/
├── index.html          la pàgina principal
├── privacy.html        política de privadesa (l'App Store en demana una URL)
├── assets/
│   ├── style.css       paleta Solarpunk-Mint, mode clar i fosc
│   └── app.js          enllaços, idiomes, demo de Circell, demo de Brillantor
├── CNAME               domini personalitzat de GitHub Pages
└── .nojekyll           serveix els fitxers tal com són
```

## Veure'l en local

```bash
cd Web && python3 -m http.server 8000
```

I obre <http://localhost:8000>. (Dins de Claude Code també hi ha la
configuració `mintacafe-web`, que serveix aquesta carpeta amb
`.claude/serve.js` al port 8766.)

## Quan tinguis els enllaços de l'App Store

Només cal tocar una cosa. A dalt de tot de `assets/app.js`:

```js
const STORE_LINKS = {
  circell:    "",   // enganxa-hi la URL
  brillantor: ""
};
```

Amb la cadena buida, el botó queda esmorteït i surt l'etiqueta «Enllaç a punt
aviat». Quan hi poses una URL, el botó s'encén tot sol.

## Desplegar a GitHub Pages

1. Crea el repositori (per exemple `mintacafe/mintacafe.github.io` o
   `mintacafe/web`).
2. Puja **el contingut** d'aquesta carpeta a l'arrel del repositori, de manera que
   `index.html` quedi a dalt de tot, no dins de `Web/`.
3. Settings → Pages → *Deploy from a branch* → `main` / `/ (root)`.
4. El fitxer `CNAME` ja apunta a `mintacafe.com`. El DNS del domini ja va cap a
   GitHub. Si al final el web va a un altre domini, canvia'l o esborra'l.

## Coses que hi ha per decidir

- **Nom de l'app de Mac.** Al codi (`Apps/Brillant/`) l'app es diu **Brillant**;
  al web hi ha posat **Brillantor**, que és com me'n vas parlar. Si el nom bo és
  «Brillant», és un «Cerca i reemplaça» a `index.html` i `assets/app.js`.
- **Preus.** No n'hi ha cap d'escrit enlloc, perquè no els sé. El compromís
  («un sol pagament, preu rodó») sí que hi és.
- **Botons de l'App Store.** Són fets a mà amb la tipografia del web. Apple
  demana el seu *badge* oficial per a la promoció; quan publiquis, val la pena
  baixar-lo de l'Apple Marketing Resources i posar-lo al seu lloc.
- **Secció «Al foc»** (Traç, Vitrall, Escuma). Si encara no ho vols anunciar,
  esborra el `<section class="brewing">` de `index.html`.
- **Imatge per compartir** (og:image). Quan tinguis captures de l'App Store,
  posa'n una de 1200×630 a `assets/og.png` i afegeix
  `<meta property="og:image" content="https://mintacafe.com/assets/og.png">`.

## Accessibilitat i detalls

- Bilingüe anglès/català amb el botó CA/EN; recorda la tria i, la primera
  vegada, tria segons l'idioma del navegador.
- Mode fosc automàtic (`prefers-color-scheme`).
- Respecta `prefers-reduced-motion`.
- El tauler de Circell del web és jugable de veritat: genera un arbre
  d'expansió aleatori sobre la graella, així sempre té solució.
- El control de Brillantor aplica una correcció de gamma real (filtre SVG
  `feFuncR/G/B type="gamma"`, exponent `1/boost`), exactament el que fa l'app
  a les pantalles.
