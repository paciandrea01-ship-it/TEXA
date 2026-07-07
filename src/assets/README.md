# Immagini reali del progetto

Metti qui i file immagine e collegali in `src/config/media.js`.

Consigliati:
- `gomitoli.jpg` — gomitoli di lana colorati su fondo bianco (hero, a destra)
- `oranges.jpg` — fette d'arancia / agrumi (sfondo Index e Ricerca)

Poi in `src/config/media.js`:

```js
import yarn from "../assets/gomitoli.jpg";
import fruit from "../assets/oranges.jpg";
export const YARN_PHOTO = yarn;
export const FRUIT_PHOTO = fruit;
```

Finché i valori restano `null`, l'app usa i fallback grafici SVG già pronti.
Il build (`npm run build`) incorpora le immagini come data-URI, così il
bundle in `dist/` resta autoconsistente e apribile con doppio click.
