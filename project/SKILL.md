---
name: cks-booking-design
description: Use this skill to generate well-branded interfaces and assets for CKS 課室及功能室預約系統 (school room reservation system), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files — especially `colors_and_type.css` (tokens), `ui_kits/booking/` (JSX components + interactive demo), and the preview cards under `preview/`.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation

- **Language**: 繁體中文 (zh-Hant). UI copy stays Chinese; code stays English.
- **Brand**: calm, orderly, school-administration — NOT a consumer SaaS.
- **Palette**: Brand blue `#2A53D3` · canvas `#ECEEF2` · text `#0F2242` · semantic green `#10A957` · semantic red `#E14F61`. No purple gradients, no neon.
- **Type**: Noto Sans TC across the board; weights 400 / 600 / 700 / 800.
- **Radii**: 6 / 8 / 10 / 12 only.
- **Icons**: emoji as functional markers (📅 🕘 🖨️ 📩 🔎 ⟳ ⬇ 👤 👥 📘). No custom SVG icons.
- **Motion**: 150ms ease color transitions; no spring / bounce / parallax.

## Files

- `README.md` — content + visual foundations (full rationale)
- `colors_and_type.css` — token source of truth
- `preview/` — design system cards
- `ui_kits/booking/` — React UI kit (App.jsx, BookingView.jsx, MyBookingsView.jsx, PrintView.jsx, AdminView.jsx, components.jsx, data.jsx, index.html)
- `assets/` — logos / images (if any)
- `index.html`, `src/` — the original Codex app this system was derived from
