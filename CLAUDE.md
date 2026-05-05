# Aura of the Unseen — Claude Code Instructions

## Colour Scheme

**NEVER change the UI colour palette unless the user explicitly and specifically asks for a colour change.**

The entire game UI — HUD bar, satchel, journal, status panel, menus, popovers — uses a single shared palette. All components must stay in sync with these values:

| Role | Value |
|---|---|
| Panel background | `#d6cab0` |
| Panel background (darker variant) | `#c9bca0` |
| Primary text | `#3a2010` |
| Dim text | `rgba(58,32,16,0.45)` |
| Mid text | `rgba(58,32,16,0.65)` |
| Accent (hover, active, borders-lit) | `#cb7866` |
| Quest gold | `#b8952a` |
| Slot empty background | `rgba(58,32,16,0.07)` |
| Slot filled background | `rgba(58,32,16,0.13)` |
| Border subtle | `rgba(58,32,16,0.18)` |
| Border medium | `rgba(58,32,16,0.3)` |
| Font (UI labels, keys) | `Courier New, monospace` |
| Font (flavour text, descriptions) | `Georgia, serif` |
| HUD bar height | `48px` |
| Stats bar background | `#89ceaf` |

If a task touches any component file, preserve these values exactly. Do not introduce new colours, rename constants, or adjust opacity/alpha unless the user specifically says to change the colour scheme.
