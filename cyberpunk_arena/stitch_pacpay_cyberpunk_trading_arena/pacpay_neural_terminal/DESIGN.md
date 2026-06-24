# Design System: The Kinetic Terminal

## 1. Overview & Creative North Star
**Creative North Star: "The Sovereign Interface"**
This design system moves away from the "friendly fintech" aesthetic of soft corners and approachable pastels. Instead, it adopts the persona of a high-stakes, encrypted AI terminal. It is built to feel like a high-end RPG dashboard where financial transactions are "missions" and portfolio growth is "leveling up."

The system breaks the standard "SaaS template" look through **intentional asymmetry** and **brutalist precision**. By utilizing a strictly 0px radius scale (Sharp Edges) and high-contrast tonal layering, we create an environment that feels engineered rather than designed. The UI does not sit on the screen; it projected onto it.

---

## 2. Colors & Atmospheric Depth
The palette is rooted in a "Void Black" foundation, punctuated by high-energy neon accents that signify data priority and system status.

*   **Primary (`#8ff5ff` / Neon Cyan):** The "User Focus." Used for active states, primary actions, and critical data points.
*   **Secondary (`#f2e805` / Vibrant Yellow):** The "Tactical Alert." Used for RPG progression elements, gold-tier status, and interactive warnings.
*   **Tertiary (`#d674ff` / Electric Purple):** The "AI Layer." Used for automated insights, machine-learning features, and secondary navigation.

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for sectioning. They clutter the "HUD" feel. Instead:
-   **Containment via Shift:** Define sections by moving from `surface` to `surface-container-low`.
-   **The Light-Bleed Boundary:** Use `primary-container` or `secondary-container` as a 1px glow-line only when an element is "Active" or "Focused."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical glass panels stacked in a 3D space:
-   **Base Layer:** `surface` (#0e0e10) — The terminal background.
-   **Mid-Level Panels:** `surface-container` (#19191c) — Standard content areas.
-   **Elevated HUDs:** `surface-container-highest` (#262528) — Floating modals or tooltips.
-   **Recessed Data Trays:** `surface-container-lowest` (#000000) — Monospaced data feeds and log entries.

### The "Glass & Gradient" Rule
To achieve a "premium tech" feel, main CTAs and hero panels should use a subtle linear gradient transitioning from `primary` to `on-primary-container`. Apply a `backdrop-blur` of 12px to any floating surface using a 60% opacity version of `surface-container-high` to create a "Smoked Glass" effect.

---

## 3. Typography: Tactical Information Display
The typography system balances "The Narrative" (Headings) with "The Data" (Body).

*   **Display & Headlines (`Space Grotesk`):** Chosen for its wide tracking and geometric construction. It feels like an architectural blueprint.
    *   *Usage:* Use `display-lg` for portfolio balances and `headline-sm` for "Mission Objectives" (page titles).
*   **Body & Titles (`Inter`):** While the prompt suggests high-tech, we use Inter for readability in dense financial contexts.
    *   *Usage:* All transaction history and standard UI labels.
*   **The Terminal Monospace:** For all raw data values (Numbers, Hash strings, timestamps), use a monospaced font-stack. This reinforces the "AI Terminal" persona.

---

## 4. Elevation & Depth: Tonal Layering
In this system, "Up" is defined by "Bright." We do not use traditional drop shadows.

*   **The Layering Principle:** A `surface-container-low` panel sitting on a `surface` background provides all the separation needed. If a card needs to feel "Primary," give it an inner-glow using the `primary` token at 5% opacity.
*   **Ambient Shadows:** If a floating element (like a context menu) requires a shadow, it must be a "Glow Shadow." Use the `primary` color with a 40px blur at 10% opacity. This mimics light emitting from the screen.
*   **The "Ghost Border":** For inactive states, use `outline-variant` (#48474a) at 20% opacity. It should be barely visible, suggesting a frame without enclosing the data.

---

## 5. Components

### Buttons (Tactical Triggers)
*   **Primary:** `primary` background, `on-primary` text. Sharp 0px corners. On hover, add a `primary-container` outer glow.
*   **Secondary:** `secondary` background, `on-secondary` text. Used for "Claim Reward" or "Level Up" actions.
*   **Tertiary:** Outline only using `primary` at 40% opacity.

### Input Fields (Data Entry Nodes)
Text inputs must feel like command-line prompts. Use `surface-container-lowest` for the field background and a 1px bottom-border of `primary`.
*   **Focus State:** The bottom border expands to a 2px `primary` line with a subtle glow. Label shifts to `primary` color.

### Progress Bars (RPG XP Trackers)
Instead of a smooth bar, use a segmented "Cell" approach. 
*   **Filled Cells:** `secondary` (Yellow).
*   **Empty Cells:** `surface-variant`.
*   **Animation:** Progress should "pulse" with a `secondary-fixed-dim` glow.

### Cards & Lists (The Ledger)
*   **Rule:** No dividers. Use 24px of vertical space between list items.
*   **Style:** Sharp-edged panels. Use `surface-container-low` for the card body. 
*   **Visual Flair:** Add a small "corner-clip" decoration or a 2px vertical accent bar of `tertiary` on the left side of the card to denote "AI-Sorted" content.

### HUD Overlays
For real-time alerts, use semi-transparent panels with a 1px `primary` border and `backdrop-filter: blur(10px)`. Text should be `primary` for maximum contrast against the dark background.

---

## 6. Do's and Don'ts

### Do:
*   **DO** use strict 0px border-radii for everything. The system is sharp and precise.
*   **DO** use monospaced fonts for all currency values to ensure numerical alignment.
*   **DO** use intentional asymmetry. A sidebar might be 300px wide, while a decorative "system status" bar on the opposite side is only 4px wide.
*   **DO** use "Cyberpunk Red" (`error`) sparingly for high-risk alerts only.

### Don't:
*   **DON'T** use rounded corners. It breaks the "Tactical Terminal" immersion immediately.
*   **DON'T** use 100% white. Use `on-surface` (#f9f5f8) to prevent eye strain against the black background.
*   **DON'T** use standard shadows. If it doesn't look like a neon glow or a physical stack of glass, it doesn't belong.
*   **DON'T** use icons with soft, hand-drawn styles. Use sharp, technical, 2pt-stroke icons.