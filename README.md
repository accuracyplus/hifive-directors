# HiFive Director Tracker

Mobile-first React 18 + Vite app for tracking tasks, meetings, appointments, site visits, and deadlines across five HiFive Holdings directors.

## Stack
- React 18 + Vite
- Cloudflare Pages (deploy)
- Cloudflare Worker + OneDrive Excel via MS Graph (backend — Phase 2)

## Directors
| Name    | Entity             | Colour    |
|---------|--------------------|-----------|
| Ameen   | APML               | `#1565a8` |
| Junaid  | Herbal Park        | `#0f6e56` |
| Praveen | Atomic Drugstore   | `#c0392b` |
| Sajeed  | Pine Pharmacy      | `#993556` |
| Suhail  | Al Jebal Opticals  | `#854f0b` |

## Dev
```bash
npm install
npm run dev
```

## Deploy (Cloudflare Pages)
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18+

## File map
```
src/
  constants.js          — directors, types, status, seed data
  utils.js              — date helpers, style helpers
  App.jsx               — root state + routing
  index.css             — global reset
  main.jsx              — ReactDOM entry
  components/
    LoginScreen.jsx     — name dropdown + PIN numpad
    CalendarScreen.jsx  — monthly calendar + day detail
    CombinedScreen.jsx  — all-director timeline + filter
    MyListScreen.jsx    — personal assignment list
    AddEntrySheet.jsx   — new entry form (modal overlay)
    ProfileScreen.jsx   — PIN change + WhatsApp + sign out
```
