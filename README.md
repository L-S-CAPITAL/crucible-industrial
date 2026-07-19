# Crucible Industrial

**Copper certainty for switchboard builders & mining camp electrical packages**

Fork of [L-S-CAPITAL/crucible](https://github.com/L-S-CAPITAL/crucible) (originally built for Brisbane residential developers), adapted for industrial electrical fabricators who supply fixed-price switchboard packages to mining camps and EPC contractors.

## What changed from the residential product

| Area | Residential (original) | Industrial (this fork) |
|------|------------------------|------------------------|
| Volume model | Apartments × kg/unit | Direct tonnes **or** packages × t/package |
| Default project | Lumina Apartments, West End | Bowen Basin Camp — Main Switchboards |
| Holding cost | ~$4,500/day (metro site) | ~$8,500/day (remote demob / LD risk) |
| Delay assumption | Subcontractor re-tender | Fabricator variation / re-quote cycle |
| Language | Sparkies, fit-out, wholesalers | Packages, fabrication window, remote site |
| Sample data | Brisbane mid-rise towers | Bowen Basin, Pilbara, Hunter Valley, Galilee |

## Quick start

```bash
cd crucible-industrial
npm install
npm run dev
```

Open http://localhost:5173

- `/` — Landing page with problem/solution and live mini-calculator  
- `/forecaster` — Full interactive hedging model

## Core model

Same transparent structure as the original:

- Lock LME copper at order acceptance
- 20% margin **only** on operational pass-through costs (never on copper notional)
- Model surge exposure + delay cost vs lock-in fee
- Output net savings, days protected, and ROI

## Sample packages included

- Bowen Basin Camp — Main Switchboards  
- Pilbara Accommodation Village — Distribution Boards  
- Hunter Valley Expansion — MCC Packages  
- Galilee Basin Temporary Power — Switchrooms  

## Stack

React 18 + Vite + React Router + lucide-react

---

L-S-CAPITAL · Concept fork
