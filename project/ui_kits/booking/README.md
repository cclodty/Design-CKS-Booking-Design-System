# CKS Booking — UI Kit

Pixel-faithful React/JSX recreation of the 課室及功能室預約系統 product, built on the design system tokens in `../../colors_and_type.css`.

## Files

- `index.html` — interactive click-through demo (all 4 views)
- `App.jsx` — top-level shell: topbar, nav, admin session
- `BookingView.jsx` — date + room list + slot grid + confirm dialog
- `MyBookingsView.jsx` — name lookup table
- `PrintView.jsx` — week selector + room checklist + preview
- `AdminView.jsx` — records table + account management
- `components.jsx` — low-level primitives (Button, Panel, SegBtn, SlotCard, RoomItem, etc.)
- `data.jsx` — ROOMS, SLOTS, mock store backed by in-memory state

## Coverage

- All 4 primary views (預約課室 / 我的預約 / 時間表列印 / 管理後台)
- Booking confirmation dialog
- Admin login / logout flow
- Mock store (no Firebase) — preloaded with a few sample records so the UI has content

## What's stubbed

Everything that would need a real backend is a no-op with cosmetic feedback (toast-like alerts, in-memory mutations). Real print output, CSV export and Firebase writes are not implemented here — this is a UI kit, not production code.
