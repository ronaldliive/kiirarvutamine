# Kiirarvutamine Apple Watch App

See kaust sisaldab koodi ("Source Code"), et luua Kiirarvutamine äpp oma Apple Watchile, kasutades tasuta kontot.

## Nõuded
- Mac arvuti
- Xcode (lae alla App Store'ist, tasuta)
- iPhone ja Apple Watch

## Juhend

### 1. Loo projekt
1. Ava **Xcode**.
2. Vali **Create New Project...**
3. Vali ülevalt tabist **watchOS** -> **App**.
4. Vajuta **Next**.
5. Täida väljad:
   - **Product Name**: `Kiirarvutamine`
   - **Interface**: `SwiftUI`
   - **Language**: `Swift`
6. Vajuta **Next** ja salvesta projekt kuhugi (nt Desktopile).

### 2. Kopeeri failid
1. Kustuta Xcodes projektist vaikimisi failid (`ContentView.swift` ja `KiirarvutamineApp.swift`).
2. Lohista selle kausta (`watchos/`) failid Xcode'i projekti peale:
   - `KiirarvutamineApp.swift`
   - `ContentView.swift`
   - `GameView.swift`
   - `Views.swift`
3. Kui küsitakse, vali "Copy items if needed".

### 3. Seadista "Signing" (Tasuta konto)
1. Kliki Xcodes vasakul sinisele ikoonile (projektile).
2. Vali paremalt **Signing & Capabilities**.
3. **Team** rippmenüüst vali **Add an Account...** ja logi sisse oma Apple ID-ga.
4. Vali nüüd Teamiks oma nimi (Personal Team).
5. Muuda **Bundle Identifier** unikaalseks (nt `com.sinunimi.kiirarvutamine`).

### 4. Käivita
1. Ühenda oma iPhone arvutiga.
2. Vali Xcode'i ülevalt seadmete menüüst oma paaritatud Apple Watch (või Simulator).
3. Vajuta **Play** (nool) nuppu.

**NB!** Esimesel korral võib telefon küsida, kas usaldad seda arendajat. Mine telefonis: `Settings -> General -> VPN & Device Management` ja luba oma äppi.

Head arvutamist randmel! ⌚
