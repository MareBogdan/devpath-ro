# DevPath RO — Design System "Aurora"
Last updated: 2026-04-08

## Philosophy
Premium learning platform feel. Not generic SaaS blue. Violet primary stands out from every competitor. Dark mode is the default experience. Light mode is supported but secondary.

## Color Palette

### Primary — Violet
| Token | Hex | Usage |
|---|---|---|
| primary-50 | #F3F1FE | Hover backgrounds (light mode) |
| primary-100 | #E0DDFC | Light borders |
| primary-300 | #A29BFE | Secondary text, inactive states |
| primary-500 | #6C5CE7 | Buttons, links, active states — THE primary color |
| primary-700 | #4834D4 | Hover on primary buttons |
| primary-900 | #26215C | Text on light violet backgrounds |

### Accent — Teal
| Token | Hex | Usage |
|---|---|---|
| accent-50 | #E0FAF9 | Success backgrounds |
| accent-300 | #81ECEC | Tags, secondary badges |
| accent-500 | #00CEC9 | CTA buttons, accent highlights, "Mod Tehnic" badge |
| accent-700 | #0A6B68 | Text on teal backgrounds |
| accent-900 | #04342C | Dark text on teal |

### Gold — Gamification
| Token | Hex | Usage |
|---|---|---|
| gold-50 | #FFF8E7 | XP toast backgrounds |
| gold-300 | #FFEAA7 | Glow effects |
| gold-500 | #FDCB6E | XP numbers, level badges, difficulty dots (1-3) |
| gold-600 | #E17055 | Warm accent, difficulty dots (4-5) |
| gold-900 | #8B6914 | Text on gold backgrounds |

### Streak — Red
| Token | Hex | Usage |
|---|---|---|
| streak-50 | #FFE8E8 | Streak lost backgrounds |
| streak-500 | #FF6B6B | Streak counter, streak badges |
| streak-600 | #EB4D4B | Alerts, destructive actions |
| streak-900 | #501313 | Text on red backgrounds |

### Surfaces — Dark mode (DEFAULT)
| Token | CSS variable | Value | Usage |
|---|---|---|---|
| bg-deepest | --aurora-bg-deepest | #0F0B1E | Page background |
| bg-card | --aurora-bg-card | #1A1A2E | Cards, sidebar |
| bg-elevated | --aurora-bg-elevated | #16213E | Elevated cards, modals |
| bg-interactive | --aurora-bg-interactive | rgba(108,92,231,0.08) | Hover states on dark |
| border-subtle | --aurora-border-subtle | rgba(108,92,231,0.10) | Default borders |
| border-medium | --aurora-border-medium | rgba(108,92,231,0.15) | Card borders |
| border-strong | --aurora-border-strong | rgba(108,92,231,0.25) | Active/focus borders |
| text-primary | --aurora-text-primary | #E8E4F0 | Primary text |
| text-secondary | --aurora-text-secondary | #8B7FA8 | Muted text, labels |
| text-tertiary | --aurora-text-tertiary | #6B5F85 | Hints, placeholders |

### Surfaces — Light mode
| Token | Value | Usage |
|---|---|---|
| bg-deepest | #FAFAFE | Page background (slight violet tint) |
| bg-card | #FFFFFF | Cards |
| bg-elevated | #F3F1FE | Elevated/hover |
| border-subtle | #E8E4F0 | Default borders |
| border-medium | #D0CCE4 | Card borders |
| text-primary | #1A1A2E | Primary text |
| text-secondary | #6B5F85 | Muted text |
| text-tertiary | #8B7FA8 | Hints |

## Component Styles

### Buttons
- Primary: `bg-aurora-primary-500 hover:bg-aurora-primary-700 text-white`
- Accent: `bg-aurora-accent-500 hover:bg-aurora-accent-700 text-aurora-accent-900`
- Ghost: `bg-transparent border border-aurora-border-medium text-aurora-primary-300 hover:bg-aurora-bg-interactive`
- XP toast: `bg-aurora-gold-50 dark:bg-[rgba(253,203,110,0.12)] text-aurora-gold-900 dark:text-aurora-gold-500`

### Progress bars
- Course progress: gradient from `aurora-primary-500` to `aurora-accent-500`
- XP progress: gradient from `aurora-gold-500` to `aurora-gold-600`
- Streak progress: solid `aurora-streak-500`
- Track background: `aurora-border-subtle`

### Badges / Pills
- "Mod Simplu": `bg-[rgba(108,92,231,0.12)] text-aurora-primary-500`
- "Mod Tehnic": `bg-[rgba(0,206,201,0.12)] text-aurora-accent-500`
- Level badge: `bg-[rgba(253,203,110,0.12)] text-aurora-gold-500 dark:text-aurora-gold-900`
- Streak badge: `bg-[rgba(255,107,107,0.12)] text-aurora-streak-500`
- Difficulty: `bg-[rgba(108,92,231,0.06)] text-aurora-text-secondary`

### Difficulty rating dots
- Filled 1-3: `bg-aurora-gold-500`
- Filled 4-5: `bg-aurora-gold-600`
- Empty: `bg-[rgba(253,203,110,0.15)]`
- Size: 10×10px, border-radius 3px, gap 3px

### Cards
- Dark: `bg-aurora-bg-card border border-aurora-border-medium rounded-[14px]`
- Light: `bg-white border border-aurora-border-subtle rounded-[14px]`
- Active/current: top 3px border-gradient from `primary-500` → `accent-500`

### Navbar
- Background: `bg-aurora-bg-deepest border-b border-aurora-border-subtle`
- Logo: "DevPath" in `text-aurora-primary-300`, ".ro" in `text-aurora-accent-500`
- Active link: `bg-aurora-bg-interactive text-aurora-primary-300`
- Inactive link: `text-aurora-text-tertiary hover:text-aurora-text-secondary`
- XP display: `text-aurora-gold-500`

## Typography
- Font: Geist Sans (headings/body) + Geist Mono (code)
- Headings: `text-aurora-text-primary font-semibold`
- Body: `text-aurora-text-primary font-normal`
- Muted: `text-aurora-text-secondary`
- Code: Geist Mono, `bg-aurora-bg-interactive rounded-[6px]`

## Spacing
- Card padding: 20px
- Section gap: 28px
- Component gap: 12px
- Border radius: cards 14px, buttons 10px, pills 20px, inputs 8px, dots 3px

## Animations (Framer Motion)
- Page transitions: fade + slide up 8px, duration 0.2s
- Card hover: scale 1.01, border-color → border-strong, duration 0.15s
- XP toast: slide in from right, hold 2s, fade out
- Progress bar fill: spring animation, stiffness 50

## Logo
"DevPath" in primary-300 (#A29BFE) + ".ro" in accent-500 (#00CEC9)
Font-weight 500, letter-spacing -0.5px

## Tailwind class prefix
All Aurora tokens are available as Tailwind classes under the `aurora-` prefix:
- `bg-aurora-primary-500`, `text-aurora-accent-300`, `border-aurora-gold-500`
- `bg-aurora-bg-card`, `text-aurora-text-secondary`, `border-aurora-border-medium`
- `bg-aurora-streak-500`, `text-aurora-gold-900`
