# 🧮 Kiirarvutamine

> Hariduslik veebirakendus 7-aastastele lastele matemaatilise kiiruse arendamiseks

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://ronaldliive.github.io/kiirarvutamine)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-purple)](https://vitejs.dev)

**[🚀 Proovi rakendust](https://ronaldliive.github.io/kiirarvutamine)**

---

## 📖 Ülevaade

**Kiirarvutamine** on mobiili-keskne React veebirakendus, mis aitab algklasside lastel harjutada liitmist, lahutamist, korrutamist ja jagamist läbi mängulise ja motiveeriva kasutajaliidese.

### 🎯 Peamised omadused

- ✨ **Zen-stiilis disain** - rahustav, minimalistlik kasutajaliides
- 📱 **Mobile-first** - optimeeritud puuteekraanile
- ⏱️ **Ajapõhine** - dünaamiline tempo (nt 48 tehet 10 minutiga)
- 📊 **Detailne statistika** - jälgi arengut aja jooksul
- 💾 **Automaatne salvestamine** - pole vaja manuaalset salvestamist
- 📤 **Eksport CSV/Clipboard** - jaga tulemusi vanemaga või õpetajaga
- 🎓 **Telemetria** - näitab vigade ajalugu ja vastamise aegu

### 🎮 Funktsioonid

1. **Raskusastmed:**
   - 10 piires (liitmine/lahutamine)
   - 20 piires (liitmine/lahutamine)
   - Kohandatud (kõik tehted 0-100+)

2. **Mängurezhiim:**
   - Reaalajas tagasiside (õige/vale)
   - Progressi jälgimine
   - Punane hoiatus üle aja vastamisel
   - 3 vale vastuse puhul "puhkepaus" pakkumine
   - Vihje funktsioon (numbri sõnaline vorm)
   - "Jäta vahele" nupp keeruliste tehete jaoks

3. **Statistika:**
   - Sessioonide ajalugu
   - Detailne iga küsimuse telemetria
   - Vale vastuste logi koos ajastustega
   - Seadme ja IP info (analüüsiks)

4. **Eksport:**
   - CSV faili eksport (Excel-sõbralik)
   - Kopeeri tulemused clipboard'i
   - Jaga tulemusi sotsiaalmeediasse

---

## 🚀 Kiirstart

### Eeldused

- **Node.js** 18+ ja **npm** 9+
- Kaasaegne brauser (Chrome, Firefox, Safari, Edge)

### Installatsioon

```bash
# Klooni repositoorium
git clone https://github.com/ronaldliive/kiirarvutamine.git
cd kiirarvutamine

# Paigalda sõltuvused
npm install

# Käivita arendusserver
npm run dev
```

Ava brauser aadressil: **http://localhost:5173**

---

## 🛠️ Arendus

### Kasutatavad skriptid

```bash
npm run dev       # Arendusserver (Vite hot reload)
npm run build     # Produktsiooniks kompileerimine
npm run preview   # Eelvaate server built versioonile
npm run lint      # ESLint kontroll
npm run deploy    # Deploi GitHub Pages'ile
```

### Tehnoloogiad

- **React** 19.2.0 - UI framework
- **Vite** 7.2.4 - Build tool & dev server
- **Tailwind CSS** 3.4.17 - Styling
- **Lucide React** - Ikoonid
- **LocalStorage** - Andmete salvestamine

### Projekt struktuur

```
kiirarvutamine/
├── public/               # Staatilised failid (favicon, pildid)
├── src/
│   ├── App.jsx          # Peamine rakendus (game logic)
│   ├── index.css        # Tailwind + kohandatud animatsioonid
│   └── main.jsx         # React entry point
├── index.html           # HTML template
├── gemini.md            # Projekti kontekst ja dokumentatsioon
└── package.json         # Sõltuvused ja skriptid
```

---

## 📦 Deployment

Rakendus on seadistatud automaatseks GitHub Pages deploymendiks:

```bash
npm run deploy
```

See käsk:
1. Kompileerib produktsiooni versiooni (`npm run build`)
2. Laeb `dist/` kataloogi GitHub Pages'i (`gh-pages` branch)

**Live URL:** https://ronaldliive.github.io/kiirarvutamine

---

## 🎨 Disain

### Värviskeem

- **Taust:** `#f0f9ff` - Hele sinine (zen-bg)
- **Aktsent:** `#38bdf8` - Taevasinine (sky 400)
- **Tekst:** `#334155` - Halli (slate 700)
- **Õige:** `#86efac` - Roheline (green 300)
- **Vale:** `#fca5a5` - Punane (red 300)

### Font

- **Inter** (Google Font fallback)

### UI põhimõtted

- Mobile-first responsive disain
- Puutetundlikud nupud (min 44x44px)
- Sujuvad üleminekud ja animatsioonid
- Minimalistlik, Zen-stiilis esteetika

---

## 📊 Kasutusjuhend

### Mängu alustamine

1. **Vali raskusaste** - 10 piires, 20 piires või kohanda ise
2. **Vasta küsimustele** - kasuta ekraani klaviatuuri
3. **Jälgi progressi** - roheline/punane progress bar näitab tempot
4. **Vaata tulemusi** - detailne ajalugu iga küsimuse kohta

### Kohandatud seaded

- **Tehete arv:** Määra mitu tehet soovid lahendada (vaikimisi 48)
- **Aeg:** Määra kogutempo minutites (vaikimisi 10)
- **Suurim arv:** Vali max väärtus tehetes (10-100+)
- **Tehted:** Vali liitmine, lahutamine, korrutamine ja/või jagamine

### Statistika vaatamine

- Klõpsa **statistika** ikoonil (paremas ülanurgas)
- Laienda sessioone et näha detaile
- Ekspordi CSV-na või kopeeri tulemused

---

## 🐛 Teadaolevad piirangud

- **LocalStorage:** Andmed salvestatakse ainult selles brauseris
- **Offline:** Vajab internetti IP telemeetria jaoks (mitte kriittiline)
- **1200+ rida App.jsx:** Refaktoreerimine planeeritud (vt `gemini.md`)

---

## 🤝 Panustamine

Kui soovid panustada:

1. Fork repositoorium
2. Loo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit muudatused (`git commit -m 'Add amazing feature'`)
4. Push branch'i (`git push origin feature/amazing-feature`)
5. Ava Pull Request

Loe rohkem projekti dokumentatsioonist: [gemini.md](./gemini.md)

---

## 📄 Litsents

See projekt on avatud lähtekoodiga ja saadaval isiklikuks ning hariduslikuks kasutamiseks.

---

## 👨‍💻 Autor

**Ronald** - [GitHub](https://github.com/ronaldliive)

---

## 🙏 Tänuavaldused

- React tiimile täiusliku UI framework'i eest
- Tailwind CSS tiimile utility-first CSS eest
- Eesti algklasside õpilastele, kes inspireerisid seda projekti

---

**Valmis koos ❤️ ja ☕ Eestis**
