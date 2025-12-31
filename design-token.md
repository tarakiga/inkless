Inkless Frontend Design System & Implementation Blueprint (2025)
1. Design Token Registry

These tokens define the visual DNA of Inkless. They are optimized for a "Fortune 500" aesthetic: high-contrast, high-trust, and technologically superior.
A. Color Palette (Quantum Integrity)
Token Name	Hex/Value	Usage
color-bg-base	#0A0C10	Deep Space Black (Primary background)
color-bg-surface	rgba(255, 255, 255, 0.03)	Frosted Glass surface base
color-accent-primary	#2D5BFF	Quantum Blue (Actions & Processing)
color-text-vivid	#FFFFFF	Primary headers & labels
color-text-muted	#94A3B8	Subtext & metadata
color-border-glass	rgba(255, 255, 255, 0.1)	1px "Rim-light" for glass panels
color-semantic-success	#10B981	NIMC Verified / Signature Success
B. Typography (Modern Geometric)

    Font Family: Instrument Sans (Variable)

    Scale:

        hero-display: 64px / 1.1 tracking (Headline)

        section-title: 24px / 1.2 tracking (Subheaders)

        body-main: 16px / 1.6 leading (Readability)

        micro-label: 12px / 1.0 (Audit log data)

C. Motion & Physics (Framer Motion)

    Global Spring: stiffness: 300, damping: 24, mass: 1

    Entrance: y: 20 -> 0, opacity: 0 -> 1

    Glass Blur: backdrop-filter: blur(12px)

2. Atomic Component Library (Phase 1)

Developers must build these Atoms first before composing any pages.
Atoms

    QuantumButton: No native borders. Uses a 1px glass edge and a whileTap={{ scale: 0.98 }} spring interaction.

    GlassInput: Floating label design. Focus state triggers a subtle "Quantum Blue" glow effect on the glass panel.

    HapticBadge: Micro-indicator for "Local-Only" or "Syncing" status. Uses a subtle pulse animation.

Organisms (The Signature Heart)

    SecureZone Dropzone:

        Idle: Minimalist dashed glass border.

        Active (Drag): Border glows Quantum Blue; background blur increases.

        Processing: Triggers the "Vault Scan" Animation—a horizontal light beam sweeps the document locally to signify hashing.