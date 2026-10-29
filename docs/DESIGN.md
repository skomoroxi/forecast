# DESIGN.md: design instructions for Claude Code

> Put this file in the project root and reference it from `CLAUDE.md` with the line
> "Follow DESIGN.md for all UI work." Claude Code should read it before creating or changing any page or component.

## 0. Goal and boundaries

Build the asset forecast pages in an **editorial "private bank" style**: a classic serif for headlines, a clean sans-serif for body text, alternating dark-navy and light sections, generous whitespace, and big serif numbers for the forecast values.

The reference is the *layout and visual style* of goldrepublic.com/en-us/gold-price/forecast (analysed 2026-10-29).

**Do NOT copy from it:**
- the brand name or logo
- photos
- text
- icons
- the watermark
- any code or CSS files

Use the **FinForecast** serif wordmark (Old Standard TT), AI-generated renders of silver and gold bars and coins (no real brand or mint logos), and our own copy. Recreate everything from the tokens and specs below.

Stack context: the small site is Astro (static) with plain CSS. Put the tokens in `src/styles/tokens.css`, the global styles in `src/styles/global.css` and one `.astro` component per block in `src/components/`. Don't use Tailwind or a UI kit. Hand-written CSS with custom properties keeps the look exact.

## 1. Design tokens

```css
:root {
  /* colors */
  --navy-900: #181D27;   /* dark sections, hero, main text color */
  --navy-850: #181D29;   /* live ticker bar */
  --navy-700: #252B37;   /* disclaimer box on dark */
  --slate-500: #535862;  /* forecast card border */
  --gray-300: #D5D7DA;   /* body text on dark, dividers on light */
  --gray-250: #CCCDCE;   /* FAQ row divider */
  --gray-200: #E5E7EB;   /* chart widget borders */
  --gray-100: #F5F5F5;   /* FAQ section background */
  --gray-50:  #FAFAFA;   /* page background, soft sections */
  --white:    #FFFFFF;
  --cream:    #F4EFED;   /* headline text on dark, icon tiles */
  --accent:   #1431CD;   /* FinForecast brand blue: buttons, links, focus */
  --accent-hover: #0F27A6;
  --up:       #16C47F;   /* price up, LIVE dot */
  --down:     #EF4444;   /* price down */
  --chart-line: #C07A4F; /* copper line for gold; use #8A96A8 (steel) for silver */
  --chart-fill-top: rgba(192,122,79,.18);

  /* type */
  --font-serif: "Old Standard TT", Georgia, serif;   /* Google Fonts, 400 + italic */
  --font-sans:  "Inter", system-ui, "Segoe UI", Roboto, Arial, sans-serif; /* 400/500/700 */

  /* layout */
  --container: 1300px;
  --gutter: 24px;          /* side padding inside container; 16px on mobile */
  --section-y: 64px;       /* vertical padding of every section; 48px on mobile */
  --grid-gap: 40px;
  --radius: 4px;
  --radius-widget: 6px;
  --hairline: 0.8px;       /* all borders are hairlines; never thicker than 1px */
}
```

Load fonts from Google Fonts: `Old+Standard+TT:ital,wght@0,400;0,700;1,400` and `Inter:wght@400;500;700`, with `display=swap`.

## 2. Typography

| Role | Font | Size / line-height | Weight | Letter-spacing | Color |
|---|---|---|---|---|---|
| H1 (hero) | serif | 60px / 1.0 (mobile 40px) | 400 | -2px | `--cream` on dark |
| H2 section | serif | 52px / 1.2 (mobile 34px) | 400 | -2px when centered, normal when left | `--navy-900` (light) / `--cream` (dark) |
| Big number (forecast value) | serif | 32px / 1.2 | 400 | normal | same as section text |
| H3 / FAQ question | sans | 18px / 1.2 | 500 | normal | `--navy-900` |
| Body | sans | 16px / 1.6 | 400 | 0.4px | `--navy-900` (light) / `--gray-300` (dark) |
| Small body / factor text | sans | 14px / 1.6 | 400 | 0.4px | same |
| Labels / meta ("Last updated…") | sans | 13px / 1.4 | 400 | normal | 60% opacity of text color |

Rules:
- **Headlines are always serif and weight 400. Never bold a serif headline.**
- Body and UI text are always sans. Important numbers inside paragraphs are `<strong>` in the sans font.
- Links: `--accent`, underlined, no color change on visited.

## 3. Global layout

- The page background is `--gray-50`. Each section is full-bleed, with content inside `.container { max-width: var(--container); margin: 0 auto; padding: 0 var(--gutter); }`.
- **Section rhythm:** alternate light and dark sections down the page:

  ```
  hero (dark) → year sections (light) → chart → … → long-term (dark) → factors (white) → CTA (soft gray) → FAQ (#F5F5F5) → footer (white + dark bottom band)
  ```

- **Two-column grid:** `grid-template-columns: 1fr 1fr; gap: var(--grid-gap);`. The text column is left. The visual is right, and on dark sections it can be on the left for variety. On screens narrower than 768px it becomes one column with the image after the text.
- Section padding is `var(--section-y) 0` everywhere. Don't invent other spacings. Use multiples of 8 (8, 12, 16, 24, 40, 64).

## 4. Components

### 4.1 Live price ticker (top bar, 35px, `--navy-850`)
- A horizontal row of assets. For each asset: a colored dot (gold = #E5B53C, silver = #C9CDD3, platinum = #6D7BF5), name, price + `/toz` in two lines, % change colored `--up`/`--down`, and a tiny 60×20 sparkline in the same color.
- At the right end: a pulsing green dot + "LIVE" (or "Updated daily" for our static data).
- Font sans 12–13px, white. On mobile it scrolls horizontally with no visible scrollbar.

### 4.2 Navbar (white, 70px, sticky under the ticker)
- Serif wordmark on the left.
- Links in the middle, sans 16px `--navy-900`. Asset groups (Metals, Crypto, Stocks) have dropdowns with chevrons.
- On the right: a language switcher (flag + chevron), a secondary text link, and a **primary button** (filled `--accent`, white text, radius 4, padding 12×20, full navbar height on desktop).
- On mobile: a hamburger opening a full-screen white menu.

### 4.3 Hero (dark `--navy-900`, min-height ~ 90vh)
- Left column: H1 (e.g. "Silver price forecast for 2026, 2027 and beyond"), then 2 short paragraphs in body/dark, then a **disclaimer box**, then a primary button.
  - Disclaimer box: bg `--navy-700`, radius 4, padding 12px. A small outlined info icon on its own line, then 16px sans text in `--gray-300`.
- Right side: a large product photo (metal bar or coin, or a crypto/stock visual) on a dark background. It bleeds to the right viewport edge (`position:absolute; right:0; width:~60%`). The image is decorative, so `alt=""` and lazy loading are off for the hero only.

### 4.4 Year forecast section (light, repeated per horizon)
- Left column, in order:
  1. H2 "Expected silver price 2026" (left aligned)
  2. 3–5 paragraphs of trend text (our generated description), with key numbers in `<strong>` and institutions linked
  3. The **forecast card**
  4. A primary button
- Right column: a tall image card (radius 4, `object-fit: cover`, same height as the text column). For our pages, this column can instead hold the **monthly forecast table** for that year (§4.6). Prefer the table on data-heavy pages and keep one photo section for visual relief.
- **Forecast card:** `border: var(--hairline) solid var(--slate-500); border-radius: 4px; padding: 8px 16px; display:flex; justify-content:space-between; align-items:center;`
  - Left side: a small trend icon + "Forecast 2026" (sans 16px), with "Last updated: {date}" under it (sans 13px, muted).
  - Right side: the big serif value (32px), e.g. `$58.40` or a range `$52–$66`, with "per troy ounce" under it (sans 13px, right-aligned).
- For long horizons (e.g. 2030) use the **dark variant**: the section bg is `--navy-900`, text is `--cream`/`--gray-300`, the card border is `--gray-300`, and the image is on the left.

### 4.5 Price chart widget (white card inside a light section)
- **Header row:**
  - Current price in big sans (28px, weight 500) + an arrow icon in the change color.
  - Then label/value pairs: "Change (abs)" → `-0.60% · $-0.31/toz` colored; "High" / "Low" values. Labels are 12px muted and values 15px weight 500.
  - Then "As of {date time timezone}" at 12px muted.
- **Controls row:** 3 select boxes (interval: Day/Week/Month/Year/5Y/All; currency; type: Line/Candles). Each is white with a `--gray-200` hairline border, radius 6, height 36, sans 14, and a chevron.
- **Chart area:** 440px tall (300 on mobile).
  - Line color `--chart-line` (1.5px) with a vertical gradient fill from `--chart-fill-top` to transparent.
  - The y-axis is on the right, with a price tag in the line color for the last value.
  - Light horizontal gridlines `#F0F0F0`, no vertical gridlines. X-axis labels are 11px muted.
  - An optional faint serif wordmark watermark, top right, at 10% opacity (our own logo only).
  - **Our addition:** forecast series after "today", drawn dashed (ARIMA, Prophet, Monte Carlo median) with the Monte Carlo 10–90% band as a light fill. Add a legend under the controls.
- **Quick-period strip** under the chart: 5 equal cells (1 day, 1 week, 1 month, 6 months, Year to date) inside a `--gray-200` hairline box, radius 6. Each cell is centered, with the label at 13px muted and the % (15px, weight 500) colored up or down. Cells are separated by hairlines.
- Library: TradingView Lightweight Charts (preferred) or Chart.js 4. Style either one to the spec above.

### 4.6 Data tables (our addition, styled to fit the design)
- Use them for the daily 30-day forecast, the monthly tables, technical indicators, moving averages and pivot points.
- Full width of the column; `border-collapse: collapse`; sans 14px.
- Header row: sans 12px, uppercase, letter-spacing 0.6px, muted, with a bottom hairline `--gray-300`.
- Rows have padding 12px 8px and a bottom hairline `--gray-200`. There are no vertical borders and no zebra striping.
- Number columns are right-aligned with `font-variant-numeric: tabular-nums`. Up/down values are colored `--up`/`--down`, and Buy/Sell cells use the same colors.
- A long table (30 days) shows the first 10 rows and a "Show all 30 days" text button (accent color) that expands it.
- On mobile the table scrolls horizontally inside a wrapper with a soft fade on the right edge.

### 4.7 Technical analysis summary (our addition)
- A white card with a hairline `--gray-200` border and radius 6.
- Tabs at the top (Daily / Weekly / Monthly), sans 14. The active tab has a 2px accent underline.
- Three semicircle gauges in a row: Summary, Indicators and Moving averages.
  - Each gauge has 5 segments from Strong Sell to Strong Buy, colored with `--down` → gray → `--up`, and a needle.
  - The verdict sits under each gauge in serif 24px, with the Buy/Neutral/Sell counts under that (sans 13).

### 4.8 "Factors" section (white background)
- A centered H2 (serif 52px, -2px letter-spacing), then a row of 4 columns with 64px of space above.
- Each column has a `<strong>` label (sans 14px, weight 700) followed by text (sans 14px/1.6).
- Columns are separated by a right-hand hairline `--gray-300`; the last column has no divider. Each column has 24px of right padding.
- Tablet: 2 × 2 grid. Mobile: stacked, with horizontal dividers instead of vertical.

### 4.9 CTA section (`--gray-50`)
- Two columns: a serif H2 on the left; paragraphs, a bullet list and a primary button on the right.
- Use it for "Track more assets" or a newsletter signup, not "buy" (we are not a dealer).

### 4.10 FAQ accordion (section bg `--gray-100`)
- A left-aligned H2 "Frequently asked questions" (serif 52px, -2px letter-spacing).
- Each row: padding 24px 0, bottom hairline `--gray-250`, the question in sans 18px weight 500, and a chevron on the right that rotates 180° when open.
- The answer is sans 16px/1.6 with a 12px top margin. Animate the height over 200ms.
- Build it with `<details><summary>` so it works without JavaScript and can be indexed, and emit `FAQPage` JSON-LD from the same data.

### 4.11 Footer
- White part:
  - The wordmark on top.
  - A grid of link columns (Assets, Forecasts, Company, Legal).
  - A newsletter block on the right: an H4 serif title, then an email input and button in one row, with a hairline border and radius 4.
  - A row of 45×45 social icon tiles (bg `--cream`, accent-colored icon, radius 4).
- Bottom band: `--navy-900` with white text. It holds the full disclaimer ("Not financial advice…"), the data source attribution and the copyright.

### 4.12 Buttons
- **Primary:** bg `--accent`, white sans 16px, padding 12px 20px, radius 4, no shadow. On hover, bg `--accent-hover`.
- **Secondary:** transparent background, 0.8px border in the current text color, same size.
- **Text button:** accent color, underlined on hover.
- **Focus:** 2px accent outline with a 2px offset. Never remove focus outlines.

## 5. Page template: asset forecast page (block order)

Map our SEO structure onto the components above:

1. Ticker (4.1) → navbar (4.2)
2. Hero (4.3): H1, intro, disclaimer box, "See today's forecast" button that anchors to the summary
3. Key forecast summary: 3 forecast cards (4.4 card) in a row (30 days / end of this year / 2030), plus the TA verdict pill
4. Chart widget (4.5) with the forecast overlay
5. "Silver price forecast for the next 30 days": text + daily table (4.6)
6. "Expected silver price 2026": year section (4.4, light), with the table in the right column
7. "Silver price prediction 2027–2030": one year section per year, alternating table and image sides; **2030 uses the dark variant**
8. "Outlook to 2035": dark section, yearly table
9. Technical analysis (4.7) followed by the indicator, MA and pivot tables (4.6)
10. Analyst and bank forecasts table (4.6) on white
11. Factors (4.8)
12. Price history (5Y/10Y) table
13. Methodology and accuracy: two-column CTA-style section (4.9)
14. FAQ (4.10)
15. Related assets: 4 cards (serif asset name, sans price, colored %)
16. Footer (4.11)

The hub (home) page reuses the ticker, navbar, a dark hero, then grids of asset cards grouped by Metals / Crypto / Stocks, then the factors-style "How our forecasts work" section, the FAQ and the footer.

## 6. Responsive and quality rules

- Breakpoints: 480 / 768 / 992 / 1300px. The design must work at a 360px width with a 16px gutter and no horizontal page scroll; only tables and the ticker may scroll inside their own box.
- Images: AVIF/WebP, explicit width and height, lazy-loaded except the hero.
- Performance: LCP < 2.5s, CLS < 0.1. Fonts are preloaded and the chart library loads lazily (after the hero).
- Accessibility: contrast ≥ 4.5:1 (check `--gray-300` on `--navy-900`), never signal up/down with color alone (add ▲/▼), proper table `<th scope>`, and a visible keyboard focus.
- All numbers and dates are formatted per locale (`Intl.NumberFormat`), ready for the 10-language version.

## 7. How Claude Code should work with this file

1. Create `tokens.css` and `global.css` first, then build components in the order of §4. Each component lives in its own file and uses only tokens, with no hard-coded colors.
2. Build a `/styleguide` page that renders every component with sample data, and check it at 360, 768 and 1300px before building real pages.
3. Use realistic sample data (a silver price around the current level, 30 daily rows) so table and card widths are tested.
4. Don't fetch, embed or hotlink anything from goldrepublic.com. Use our own imagery and placeholders.
5. When in doubt about a style, choose the more restrained option: hairline borders, serif weight 400, no shadows, no gradients except the chart fill.
