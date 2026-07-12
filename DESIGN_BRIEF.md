# ASIF TRADERS Admin Dashboard — Design Brief

**Target quality:** $15,000 Figma-grade / Linear / Stripe / Vercel / Shopify Admin / Notion
**Date:** 2026-07-12
**Status:** Approved for implementation (Option B)

---

## Brand Identity
- **Brand Name:** ASIF TRADERS
- **Industry:** Construction Materials (Steel, Cement, TMT Bars, Aggregates)
- **Currency:** Indian Rupee (₹)
- **Brand Color:** Warm Amber/Orange (#E87722) — used sparingly, only for primary CTAs
- **Aesthetic:** Clean, professional, industrial-precision meets modern SaaS elegance

## Design Tokens

### Color Palette
| Token | Hex | Use |
|---|---|---|
| `primary` | `#E87722` | Primary CTAs ONLY |
| `primary-hover` | `#D06A1E` | Hover state |
| `success` | `#16A34A` | Active, in-stock, approved |
| `success-subtle` | `#DCFCE7` | Badge backgrounds |
| `danger` | `#DC2626` | Out of stock, rejected, delete |
| `danger-subtle` | `#FEE2E2` | Badge backgrounds |
| `warning` | `#EAB308` | Pending, featured |
| `info` | `#3B82F6` | Links, customer-related |
| `bg` | `#FAFBFC` | Page background |
| `surface` | `#FFFFFF` | Cards, modals, sidebar |
| `border` | `#E5E7EB` | Dividers |
| `text-primary` | `#111827` | Headings |
| `text-secondary` | `#6B7280` | Labels |
| `text-muted` | `#9CA3AF` | Placeholders |

### Typography
- **Font:** Inter (400, 500, 600, 700)
- **Scale:** 12 captions → 14 body → 16 card titles → 20 section → 24 page → 32 stats

### Spacing
- Base: 4px
- Card padding: 24px
- Section gap: 24px
- Page margin: 32px desktop / 16px mobile

### Shadows
- Card: `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Dropdown: `0 4px 12px rgba(0,0,0,0.08)`
- Modal: `0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)`
- Focus: `0 0 0 3px rgba(232,119,34,0.15)`

### Border Radius
- Inputs/Buttons: 6px
- Cards: 10px
- Badges: 9999px
- Modals/Drawers: 12px

## Pages (5)
1. **Dashboard** — 4 KPIs (no Categories/Products), sales chart, quote pipeline, quick actions, recent activity
2. **Products** — search, filter chips, 6-col table, bulk actions, pagination
3. **Add/Edit Product** — 560px right drawer with basic info, pricing, images
4. **Quotes** — pill status tabs, search, empty state
5. **Orders** — search, filters, 7-col table, status & payment badges

## Global Components
- Toast notifications (4s auto-dismiss)
- Confirmation dialog
- Command palette (Cmd+K)
- Loading skeletons (shimmer)
- Empty states (universal pattern)
