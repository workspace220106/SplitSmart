# Design System Document: Arcade Futurism

## 1. Overview & Creative North Star
**The Creative North Star: "The Kinetic Labyrinth"**

This design system reimagines the 1980s arcade aesthetic through the lens of high-end fintech. It is not a "retro" parody; it is a sophisticated, "Arcade Futurism" experience where the precision of high-frequency trading meets the neon-drenched atmosphere of a midnight cabinet. 

We break the "standard app" mold by treating the UI as a living, glowing circuit board. We move away from static, centered layouts toward **intentional asymmetry**, where content feels like it is moving through a maze. By utilizing a "Pure Black" foundation, we allow neon tokens to bleed and vibrate, creating a sense of infinite depth. The experience should feel like a premium terminal—fast, electric, and authoritative.

---

## 2. Colors & Radiance
The color palette is built on high-contrast vibrance against a void. Every color choice is functional, designed to guide the user through the "labyrinth" of financial data.

### The Palette (Material Design Mapping)
- **Background (`#131313` / `#000000`):** The absolute void. Used to make neon elements appear to float.
- **Primary (`#fff3d4` to `#ffd300`):** The "Pac-Yellow." Reserved for primary actions and "Power Pellet" financial milestones.
- **Secondary (`#00e3fd`):** The "Plasma Blue." Used for informational accents and data visualizations.
- **Tertiary (`#ff2d95`):** The "Ghost Pink." Used for urgent alerts, market movements, and high-energy interactions.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. To define boundaries, designers must use **Surface Hierarchy**. A `surface-container-low` section should sit against a `surface` background to create a subtle shift in the "darkness" rather than a hard line. Hard lines are only permitted when they are "Neon Traces"—thin, glowing paths that signify connectivity, not just containment.

### Surface Hierarchy & Nesting
Treat the UI as stacked layers of tinted obsidian. 
- **Deepest Layer:** `surface-dim` (#131313) for the main canvas.
- **Mid Layer:** `surface-container` (#1f1f1f) for navigational sidebars.
- **Top Layer:** `surface-container-highest` (#353535) for cards that require immediate user focus.

### The "Glass & Gradient" Rule
To achieve a premium feel, use **Glassmorphism** for floating modals and navigation bars. Apply a 20% opacity to your surface color and a `backdrop-blur` of 12px. Enhance CTAs with a subtle linear gradient transitioning from `primary` to `primary_container` (Yellow to deep Gold) to give buttons a "charged" energy.

---

## 3. Typography: The Pixel-Precision Scale
Typography is our primary tool for blending retro-tech with modern readability. We use a dual-font approach to maintain a "Terminal" feel without sacrificing the legibility required for financial transactions.

- **Display & Headlines (`Space Grotesk`):** This is our "modern-pixel" typeface. With its wide stance and technical apertures, it mirrors the geometry of early arcade hardware. 
    - *Usage:* Large-scale balance displays and section headers.
- **Body & Titles (`Epilogue`):** A clean, sans-serif that feels slightly "engineered." It provides the necessary clarity for complex data and fine print.
    - *Usage:* Transaction histories, settings, and legal disclosures.

**Typography Hierarchy:**
- **Display LG (3.5rem):** Reserved for primary account balances. Use `primary` color.
- **Headline MD (1.75rem):** For page titles. Always in Uppercase to mimic arcade high-score screens.
- **Body LG (1rem):** Default for all transactional text. Use `on_surface_variant` for a dimmed, "phosphor" look.

---

## 4. Elevation & Depth: Tonal Layering
In this system, "Elevation" is synonymous with "Luminescence." We do not use traditional drop shadows.

- **The Layering Principle:** Depth is achieved by placing a `surface-container-lowest` card on top of a `surface` background. The slight shift in blackness creates a natural lift.
- **Ambient Glows:** When an element needs to "float," apply a **Neon Glow** instead of a shadow. Use the `primary` or `secondary` token at 10% opacity with a blur radius of 32px. This creates a "bloom" effect similar to a CRT monitor.
- **The "Ghost Border":** For essential card definitions, use a 0.5pt border with `outline-variant` at 20% opacity. It should look like a faint light trail, not a structural cage.
- **Corner Radius:** All components follow a **0px radius** (Sharpness Scale). The "Pac-Man" circular motif is reserved exclusively for icons and progress pellets; the UI containers themselves remain brutally rectangular to mimic 8-bit grid logic.

---

## 5. Components

### Buttons (The "Insert Coin" Variants)
- **Primary:** Filled `primary` yellow with black text. On hover, apply a `primary` outer glow.
- **Secondary:** Transparent with a 1px `secondary` electric blue border. Use for "Add Funds" or "Export."
- **Tertiary:** Text-only with a "Pellet" (circular dot) prefix. Use for low-priority actions.

### Cards & Lists (The "Maze" Layout)
Cards must never use divider lines. Separate list items using 16px of vertical space or by alternating background tints between `surface-container-low` and `surface-container-lowest`. 

### Progress & Loading (The "Pellet" Trail)
Replace standard progress bars with a line of "Pellets." As the user completes a step or data loads, the pellets transition from `outline` (dim) to `primary` (glowing).

### Data Visualization
Use the "Ghost" motifs for volatility. 
- **Pink (`tertiary`):** Market drop/Danger.
- **Blue (`secondary`):** Stability.
- **Yellow (`primary`):** Gains/Growth.

### Input Fields
Inputs are styled as "Terminal Prompts." A bottom-border only approach using the `outline` token. On focus, the border turns `primary` yellow and triggers a faint yellow glow across the input area.

---

## 6. Do’s and Don’ts

### Do:
- **Do** use the grid as a storytelling device. Align elements to a strict 8px grid to mimic pixel-perfect alignment.
- **Do** use intentional asymmetry. Allow a graph to bleed off the right edge of the screen to suggest a "scrolling level" feel.
- **Do** use `on_surface_variant` for secondary text to mimic the "dim phosphor" of old screens.

### Don’t:
- **Don't** use rounded corners on any container. The world is a grid. 
- **Don't** use 100% opaque, white borders. They break the immersion of the "black void."
- **Don't** use standard "Fintech Blue." Our blue is `secondary_container` (#00E5FF)—it must feel electric, not corporate.
- **Don't** clutter. In a maze, the path must be clear. Use generous whitespace (32px+) between major modules.