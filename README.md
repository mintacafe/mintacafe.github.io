# Web de Minta Cafè

Web estàtic per publicitar **Circell** (iPhone), **Brillantor** (Mac) i
**Confitura** (iPhone, pròximament). Sense dependències, sense build, sense
fonts externes: HTML, un CSS i un JS. El visual és programàtic, la mateixa
filosofia que MintaKit, amb una excepció: Confitura s'ensenya amb dues captures
reals del joc (`assets/confitura-dia.jpg` i `assets/confitura-nit.jpg`, la de nit
quan el navegador va en mode fosc). Surten del director de captures del joc
(`-ConfituraShots`, mida de 6,3 polzades, reduïdes a 600 px d'amplada).

```
Web/
├── index.html          la pàgina principal
├── privacy.html        política de privadesa (l'App Store en demana una URL)
├── assets/
│   ├── style.css       paleta Solarpunk-Mint, mode clar i fosc
│   ├── app.js          enllaços, idiomes, demo de Circell, demo de Brillantor
│   └── confitura-*.jpg captures de Confitura, de dia i de nit
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
pàgina tal com la veus.

⚠️ Si hi afegeixes pàgines noves, recorda fer-ne els dos redirectors a `ca/` i
`en/`, o les rutes boniques donaran 404 per a aquella pàgina.

## Enllaços de l'App Store

Són a dalt de tot de `assets/app.js`, i és l'únic lloc on cal tocar:

```js
const STORE_LINKS = {
  circell:    "https://apps.apple.com/us/app/circell/id6795101676",
  brillantor: "https://apps.apple.com/us/app/brillantor/id6797081377?mt=12"
};
```

Circell (iPhone) va sortir el 6/10/2026 i Brillantor (Mac) el 10/8/2026.
Per a una app nova, afegeix-hi la clau. Amb la cadena buida, el botó queda
esmorteït i surt l'etiqueta «Enllaç a punt aviat». Quan hi poses una URL, el
botó s'encén tot sol.

## Desplegar a GitHub Pages

1. Crea el repositori (per exemple `mintacafe/mintacafe.github.io` o
   `mintacafe/web`).
2. Puja **el contingut** d'aquesta carpeta a l'arrel del repositori, de manera que
   `index.html` quedi a dalt de tot, no dins de `Web/`.
3. Settings → Pages → *Deploy from a branch* → `main` / `/ (root)`.
4. El fitxer `CNAME` ja apunta a `mintacafe.com`. El DNS del domini ja va cap a
   GitHub. Si al final el web va a un altre domini, canvia'l o esborra'l.

## Coses que hi ha per decidir

- **Preus.** Totes dues apps costen 3 € (3 $), però no surt escrit enlloc del
  web, i així no s'ha de mantenir per a cada país. El compromís («un sol
  pagament, preu rodó») sí que hi és.
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
