# Design QA

**Comparison Target**

- Source visual truth: `qa/reference-screen-normalized.webp` (selected generated mock, normalized from 853 × 1844 px to 393 × 852 px).
- Browser-rendered implementation: `qa/implementation-browser-final.jpg` (1363 × 936 px cloud-browser viewport).
- Normalized app screen: `qa/implementation-screen-final-normalized.webp` (browser crop 361 × 782 px at runtime scale 0.917, normalized to the 393 × 852 CSS screen).
- Full-view comparison: `qa/comparison-pass-3.webp` (source left, implementation right).
- Focused output evidence: `qa/exported-card.png` (1119 × 1119 px PNG, exactly square at 3× the 373 px card).
- State: iPhone preview, default fictional sample person and sample information.
- Density normalization: source and implementation were both normalized to 393 × 852 px for full-screen comparison. The cloud browser scaled the template device to 0.917 to fit its window; the exported card provides unscaled 3× evidence for the primary artifact.

**Findings**

- No actionable P0, P1, or P2 issues remain.
- Fonts and typography: Korean system sans-serif, heavy headline, bold facts, and compact metadata preserve the source hierarchy. The final export has clean glyph rendering and no clipped type.
- Spacing and layout rhythm: header-to-card spacing, horizontal margins, card width, button size, and vertical gaps now track the selected mock. The card itself is intentionally square, following the user's explicit requirement even though the mock's poster area was slightly taller.
- Colors and visual tokens: yellow alert band, red emergency strip, warm paper background, black primary action, gray dividers, and muted metadata match the source roles and contrast.
- Image quality and asset fidelity: the fictional sample portrait is sharp, correctly cropped, and clearly labeled `예시 인물`. UI icons come from Radix Icons; no placeholder, emoji, CSS-drawn, or handcrafted SVG substitutes are used.
- Copy and content: headline, sample facts, 112 instruction, verification line, action labels, and local-only privacy message match the selected direction.
- Accessibility and behavior: labeled inputs, keyboard focus, live status feedback, disabled export state, large touch targets, and local-only file processing are present.

**Comparison History**

1. Pass 1 found P2 drift in horizontal margins and vertical rhythm: the card was narrower and sat too close to the header. Fixed by changing screen padding from 16 px to 10 px, increasing the header gap, widening the card, and matching the action spacing.
2. Pass 2 found P2 typography drift: the alert headline and card facts were visibly undersized, and the clothing description broke inside a word. Fixed by increasing the headline/name/fact/112 scale and applying Korean keep-all wrapping.
3. Pass 3 found no actionable P0/P1/P2 differences. Remaining differences are expected: template-owned device chrome and the explicitly requested square export.

**Primary Interactions Tested**

- Opened `정보 수정` and confirmed the editor resets to the top.
- Selected a local PNG and confirmed it became an in-memory data URL.
- Edited the public name and confirmed the mobile keyboard state.
- Returned to preview and confirmed the edited value appeared in the card.
- Generated and downloaded a 1119 × 1119 PNG.
- Checked a clean browser tab for app-origin console warnings and errors: none.

**Implementation Checklist**

- [x] Selected visual reproduced in the mobile runtime.
- [x] Local photo selection and text editing work.
- [x] Square PNG download/share works without a backend.
- [x] GitHub Pages subpath build rewrites protected runtime asset paths.
- [x] Runtime integrity, production build, Sites worker tests, and browser flow pass.

**Follow-up Polish**

- None required for this scope.

final result: passed
