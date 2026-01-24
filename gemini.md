# Kiirarvutamine - Projekti Kontekst

## 🎯 North Star

**Eesmärk:** Luua hariduslik veebirakendus, mis aitab 7-aastastel Eesti lastel arendada arvutuskiirust ja matemaatilisi oskusi läbi mängulise, Zen-stiilis kasutajaliidese.

**Peamine väärtus:**
- Lihtsalt kasutatav mobiilirakendus matemaatika harjutamiseks
- Isikupärastatud tempo ja raskusaste
- Detailne statistika ja progressi jälgimine
- Motiveeriv ja rahustav kasutajakogemus

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19.2.0
- **Build Tool:** Vite 7.2.4
- **Styling:** Tailwind CSS 3.4.17
- **Icons:** Lucide React 0.562.0
- **Language:** JavaScript (JSX)

### Hosting & Deployment
- **Platform:** GitHub Pages
- **Homepage:** https://ronaldliive.github.io/kiirarvutamine
- **Deploy Script:** gh-pages

### Development Tools
- **Linter:** ESLint 9.39.1
- **Package Manager:** npm

## 📊 Current State

### Arhitektuur
Rakendus on ühe-faili React aplikatsioon (`App.jsx`, ~1200 rida), mis kasutab:
- **State Management:** React Hooks (useState, useEffect, useCallback, useRef)
- **Persistent Storage:** localStorage (sessioonide salvestamine, seaded)
- **Styling Approach:** Tailwind utility classes + custom CSS animations

### Komponendi Struktuur (praegu kõik ühes failis)
```
App.jsx (Main Component)
├── Menu Screen (raskusastme valik)
├── Custom Setup Screen (kohandatud seaded)
├── Playing Screen (mäng ise)
│   ├── Question Display
│   ├── Timer Progress Bar
│   ├── Virtual Keypad
│   └── Help Modals
├── Finished Screen (tulemused)
└── Stats Screen (ajalugu)
```

### Põhifunktsioonid
1. **Matemaatilised harjutused:** +, -, ×, ÷ tehted vahemikuga 0-100+
2. **Raskusastmed:** 10 piires, 20 piires, kohandatud
3. **Ajastamine:** Dünaamiline tempo töös (nt 48 tehet 10 minutiga)
4. **Statistika:** Detailne sessioonide ajalugu koos:
   - Vastuse aeg
   - Vigade telemetria (iga vale vastus logitakse)
   - Seadme tüüp (Mobile/Desktop)
   - IP aadress (võrgupõhine)
5. **Ekspordivõimalused:**
   - CSV eksport (Excel-sõbralik, UTF-8 BOM)
   - Clipboard copy (tulemuste jagamiseks)
6. **Kasutajaliidese omadused:**
   - Mobile-first disain
   - Jõudlusnäitajad (roheline/punane ajatakside visuaal)
   - "3 viga" puhkepaus
   - "60s üle aja" abimenüü (Skip / Hint)
   - Numbrite sõnaliseks teisendamine (vihje funktsioon)

### Tehnilised Tugevused
- ✅ Täielikult funktsioneeriv ja deployed (GitHub Pages)
- ✅ Responsive mobile-first disain
- ✅ Keeruliste staatide haldamine (timer, feedback, history)
- ✅ Rikkalik telemetria ja andmete salvestamine
- ✅ Kvaliteetne UX (animatsioonid, visuaalne feedback)

### Tuvastatud Tehnilised Võlad ja Probleemid
1. **Koodistruktuur:**
   - ❌ Monoliitne 1200-realine fail (App.jsx)
   - ❌ Puuduvad eraldiseisvad komponendid
   - ❌ Business logic segunenud UI-ga
   - ❌ Raske testida ja hooldada

2. **State Management:**
   - ⚠️ Keeruline sõltuvuste ahel (useCallback, useRef hacks)
   - ⚠️ Potentsiaalsed closure stale-state probleemid
   - ⚠️ Useeffect loop takistused (ridade 317-318 jms)

3. **Andmehaldus:**
   - ⚠️ localStorage otsemanipulatsioon (puudub abstraktsioonikihid)
   - ⚠️ Pole error handling'i storage operatsioonidel
   - ⚠️ Sessioonide migratsioon (rida 18: hardcoded cutoff kuupäev)

4. **Tüübikindlus:**
   - ❌ Puudub TypeScript
   - ❌ PropTypes puuduvad
   - ❌ Runtime vead võimalikud (nt parseInt edge cases)

5. **Funktsionaalsus:**
   - ⚠️ IP fetch kasutab avalikku API-d (api.ipify.org) - võimalik tõrge, pole fallback
   - ⚠️ Duplicate timer setup (read 384-386 vs 380-382)
   - ⚠️ Settings modal ainult menu-s (pole kohandatud mängu ekraanil)

6. **Testimine:**
   - ❌ Pole unit teste
   - ❌ Pole integration teste
   - ❌ Pole E2E teste

7. **Dokumentatsioon:**
   - ❌ README on generic Vite template
   - ❌ Puudub arhitektuuri dokumentatsioon
   - ❌ Puudub kasutajajuhend

### Versioonihaldus
- **Git:** Inicializeeritud (.git kataloog olemas)
- **Remote:** Tõenäoliselt ronaldliive/kiirarvutamine (GitHub Pages endpoint järgi)

### Kasutatavad API-d / Teenused
- **IP Geolocation:** https://api.ipify.org?format=json (telemetria jaoks)

## 🎨 Design System

### Värviskeem (Tailwind Config)
- **Background:** `#f0f9ff` (zen-bg) - light blue
- **Accent:** `#38bdf8` (zen-accent) - sky 400
- **Text:** `#334155` (zen-text) - slate 700
- **Success:** `#86efac` (zen-success) - green 300
- **Error:** `#fca5a5` (zen-error) - red 300

### Font
- **Primary:** Inter (Google Font fallback)

### Key UI Patterns
- Rounded corners (rounded-2xl, rounded-3xl)
- Soft shadows
- Smooth transitions
- Mobile-optimized touch targets

## 📁 File Structure
```
kiirarvutamine/
├── .git/                      # Git repository
├── dist/                      # Build output (for gh-pages)
├── node_modules/              # Dependencies
├── public/
│   ├── favicon.png
│   ├── favicon.svg
│   ├── apple-touch-icon.png
│   └── vite.svg
├── src/
│   ├── App.jsx               # Main application (monolithic, 1206 lines)
│   ├── index.css             # Tailwind + custom animations
│   ├── main.jsx              # React entry point
│   └── assets/
├── index.html                # HTML entry
├── package.json              # Dependencies & scripts
├── vite.config.js            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── eslint.config.js          # ESLint configuration
├── postcss.config.js         # PostCSS configuration
└── README.md                 # Generic Vite template (needs update)
```

## 🔄 Development Workflow

### Available Scripts
```bash
npm run dev       # Development server (Vite)
npm run build     # Production build
npm run preview   # Preview production build
npm run deploy    # Deploy to GitHub Pages
npm run lint      # Run ESLint
```

### Deployment Process
1. `npm run predeploy` - Builds the app
2. `npm run deploy` - Deploys dist/ to gh-pages branch

## 🎯 Järgmised Sammud (Initial Assessment)

### Prioriteet 1: Refaktoreerimine
- [ ] Komponendipõhine arhitektuur
- [ ] Custom hooks business logic'u jaoks
- [ ] Parema state management (Context API või lightweight library)

### Prioriteet 2: Kvaliteet
- [ ] TypeScript migratsioon
- [ ] Unit tests
- [ ] Error boundaries

### Prioriteet 3: Dokumentatsioon
- [ ] README update
- [ ] Arhitektuuri dokumentatsioon
- [ ] API dokumentatsioon

---

**Last Updated:** 2026-01-24  
**Maintainer:** Senior Software Engineer (Antigravity AI)  
**Project Status:** ✅ Production-ready, 🔨 Refactoring needed
