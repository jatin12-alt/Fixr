# Fixr Premium Design System: Black & White

> "Intentional minimalism. Pure contrast. Every pixel matters."

## 🎭 Design Philosophy
The Fixr B&W Design System is inspired by the aesthetics of Apple, Arc Browser, and high-end architectural journals. It rejects the "default SaaS" rainbow for a strict, disciplined monochromatic palette. By removing color, we prioritize hierarchy through typography, spacing, and contrast.

---

## 🎨 Design Tokens

### Colors (Strict Monochromatic)
No other colors are permitted in this system. Functional states (Success, Warning, Danger) are communicated via icons, borders, and high-contrast typography rather than hue.

| Token | Value | usage |
| :--- | :--- | :--- |
| **Background** | `#FFFFFF` | Primary viewport background |
| **Dark Surface** | `#000000` | Primary dark surface / Black background |
| **Surface 1** | `#FAFAFA` | Secondary containers |
| **Surface 2** | `#F5F5F5` | Hover backgrounds / tertiary areas |
| **Surface 3** | `#EFEFEF` | Muted containers |
| **Border** | `#E5E5E5` | Default light borders |
| **Border Dark** | `#1A1A1A` | Borders on dark backgrounds |
| **Text Primary** | `#0A0A0A` | Headings and primary body |
| **Text Secondary**| `#525252` | Descriptions and labels |
| **Text Muted** | `#A3A3A3` | Placeholder and aux info |
| **Accent** | `#000000` | Principle action color / Primary CTA |
| **Inverse** | `#FFFFFF` | Text on black backgrounds |

---

### Typography
The system uses **Geist Sans** for interface and **Geist Mono** for metrics/code, emphasizing a technical yet elegant structure.

- **Scale**: 12 / 14 / 16 / 18 / 24 / 32 / 48 / 64 / 80 (px)
- **Hero Title**: 72-80px, weight 800, tracking `-0.03em`.
- **Body Text**: 16px, weight 400, line-height `1.5` or `1.6`.
- **UI Labels**: 11-12px, weight 600, tracking `0.08em`, UPPERCASE.

---

### Spacing & Layout
Strict 4px base grid system.
- **Scale**: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 (px)
- **Container**: Max-width 1280px, Padding 24-32px.

---

### Shape & Radius
- **Buttons / Inputs**: `6px` (Squared elegance)
- **Cards**: `10px`
- **Modals**: `14px`
- **Pills / Badges**: `999px` (Full round)

---

### Shadows & Elevation
- **Subtle**: `0 1px 3px rgba(0,0,0,0.08)`
- **Card**: `0 4px 16px rgba(0,0,0,0.08)`
- **Hover**: `0 8px 32px rgba(0,0,0,0.12)`
- **Focus Ring**: `0 0 0 3px rgba(0,0,0,0.15)`

---

## ✨ Motion Signature
- **Global Transition**: `150ms ease` (for all interactive changes)
- **Card Hover**: `translateY(-1px)` + Hover Shadow.
- **Button Interaction**: `scale(0.98)` on press.
- **Entrance Animation**: `fade-in` + `translateY(6px → 0)` for all major sections.

---

## 🏗️ Technical Override (shadcn/ui)

Map these tokens to your `tailwind.config.ts` or `globals.css`:

| Component | Style |
| :--- | :--- |
| **Button Primary** | BG: `#000000`, Text: `#FFFFFF`, Hover: `#1A1A1A` |
| **Button Ghost** | BG: `transparent`, Text: `#0A0A0A`, Hover: `#F5F5F5` |
| **Input** | BG: `#FFFFFF`, Border: `#E5E5E5`, Focus-Border: `#000000` |
| **Card** | BG: `#FFFFFF`, Border: `#E5E5E5`, Shadow: `Subtle` |
| **Separator** | BG: `#E5E5E5` |

---

## 📸 Component Principles

1. **Negative Space**: Prioritize generous padding to allow content to breathe.
2. **Hard Corners vs Soft**: Use `6px` for small interactive objects but `10px+` for structural containers to create a "nested" logical feel.
3. **Contrast as Color**: Use solid black backgrounds for high-impact sections (like the Hero or footer) to create dramatic visual breaks.
4. **Graphic Borders**: Use `1px` solid borders instead of generic shadows where possible to define structure.
