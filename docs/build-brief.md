# Chinese Radicals Learning App — Build Brief for Grok Build Beta

**Deliverable:** A fully deployed, production-ready web application that teaches the **214 Kangxi radicals** with stroke animation, audio pronunciation, example characters, and a bilingual English/Vietnamese UI.

**Agent autonomy:** You are free to choose the tech stack, libraries, plugins, and architecture. Next.js is suggested but not mandatory. You may add, remove, or replace any component as long as the final product meets the requirements below.

---

## 1. Mission & Vision

Create the definitive interactive learning tool for Chinese radicals, inspired by the **Chineasy methodology** of visual storytelling. Each radical should feel like a memorable story: a character, a sound, a meaning, and a visual anchor. The app must be delightful, fast, and accessible to both English and Vietnamese speakers.

---

## 2. Core Requirements

- **214 Kangxi radicals** — the complete standard set.
- **Stroke-order animation** for every radical.
- **Audio pronunciation** (Mandarin Chinese) for every radical.
- **Example characters/words** that commonly contain each radical, with Pinyin and translations.
- **Bilingual UI** — switch between English and Vietnamese at runtime. All labels, meanings, and example translations must update.
- **Visual storytelling** — each radical should have a simple illustration or icon that reinforces its meaning (e.g., a flame for 火).
- **Responsive design** — works beautifully on mobile, tablet, and desktop.
- **Deployable immediately** — provide a live URL and source code.

---

## 3. Radical Dataset

### 3.1 The 214 Kangxi Radicals

Use the standard **Kangxi radical list** (214 entries). Each radical must have:

| Field | Description | Example |
|-------|-------------|---------|
| `id` | 1–214 | `1` |
| `character` | The radical glyph | `一` |
| `pinyin` | Romanization | `yī` |
| `english` | English meaning | `one` |
| `vietnamese` | Vietnamese meaning | `một` |
| `strokes` | Stroke count (for filtering) | `1` |
| `examples` | Array of example characters/words | See below |
| `illustration` | Optional SVG/emoji/icon | `1️⃣` |

**Example object:**
```json
{
  "id": 1,
  "character": "一",
  "pinyin": "yī",
  "english": "one",
  "vietnamese": "một",
  "strokes": 1,
  "examples": [
    { "character": "一个", "pinyin": "yī gè", "english": "one (item)", "vietnamese": "một cái" },
    { "character": "一起", "pinyin": "yī qǐ", "english": "together", "vietnamese": "cùng nhau" }
  ],
  "illustration": "1️⃣"
}
```

### 3.2 Data Sourcing

Do not hard-code the dataset manually. Use scripts to fetch, merge, and validate data from open sources:

- **Radical list & meanings:** [`chinese-radicals.json`](https://github.com/nicolas-jaussaud/chinese-radicals) or the Kangxi radicals Wikipedia page.
- **Pinyin & stroke data:** [`hanzi-writer-data`](https://github.com/chanind/hanzi-writer-data) (CDN or npm package).
- **Example words:** Use [`cnchar`](https://github.com/theajack/cnchar) or the [HSK vocabulary dataset](https://github.com/drkameleon/complete-hsk-vocabulary) to find characters containing each radical.
- **Vietnamese translations:** Use a translation API (Google Translate, DeepL) or a Chinese-Vietnamese dictionary dataset. If unavailable, you may generate translations using an LLM and cache them.

> **You may generate any missing data programmatically.** Ensure the final dataset is complete for all 214 radicals.

---

## 4. Feature Specifications

### 4.1 Radical Cards (Grid View)

- Display all 214 radicals in a responsive grid.
- Each card shows:
  - The radical character (large, clear font).
  - Pinyin.
  - English and Vietnamese meanings (based on active language).
  - A small illustration/icon.
- Clicking a card opens a **detail view** or expands it inline.

### 4.2 Detail View

For each radical, show:

- Large animated stroke-order visualisation (playable).
- Audio pronunciation button (🔊).
- Pinyin, English, Vietnamese meanings.
- List of 2–4 example characters/words with:
  - The example character(s).
  - Pinyin.
  - English and Vietnamese translations.
- Optional: a short "story" or mnemonic in both languages.

### 4.3 Stroke Order Animation

- Use [`hanzi-writer`](https://github.com/chanind/hanzi-writer) or an equivalent library.
- Animation must be smooth, replayable, and interactive (e.g., quiz mode optional).
- Lazy-load animation data only when a card enters the viewport or is clicked.

### 4.4 Audio Pronunciation

- Use the **Web Speech API** (`SpeechSynthesisUtterance` with `lang='zh-CN'`) as a zero-dependency baseline.
- If you prefer higher quality, integrate a TTS API (Google Cloud TTS, Amazon Polly, Azure Speech). You may use API keys if provided; otherwise, fall back to Web Speech.
- Ensure audio plays on user interaction (click) to comply with browser autoplay policies.
- Provide a visual indicator when audio is playing.

### 4.5 Bilingual UI (English / Vietnamese)

- Implement a language switcher in the header.
- All UI text, radical meanings, and example translations must switch instantly.
- Persist the user's language preference (localStorage or cookie).
- Use a lightweight i18n solution (e.g., `next-intl`, `react-i18next`, or a custom context).

### 4.6 Visual Storytelling

- Each radical should have a simple, recognisable illustration. You may:
  - Use emojis (e.g., 🔥 for 火).
  - Generate simple SVGs.
  - Use an icon library (Lucide, Heroicons) where appropriate.
  - Optionally, use AI image generation to create custom illustrations (if you have access).
- The illustration should appear on the card and in the detail view.

---

## 5. Technical Freedom & Suggestions

### 5.1 Tech Stack

- **Framework:** Next.js (App Router) is recommended for SSR, routing, and performance. You may use Remix, SvelteKit, Nuxt, or a plain Vite + React setup if you prefer.
- **Styling:** Tailwind CSS, CSS Modules, or styled-components. Choose what enables a clean, modern UI fastest.
- **State Management:** React Context, Zustand, or Jotai for language and UI state.
- **Animation:** Hanzi Writer, Framer Motion, or CSS transitions.
- **Audio:** Web Speech API or a cloud TTS service.

### 5.2 Libraries & Data Sources

- `hanzi-writer` — stroke animation.
- `cnchar` — radical and character data.
- `chinese-radicals.json` — radical list.
- `next-intl` or `react-i18next` — internationalization.
- `react-window` or `@tanstack/react-virtual` — virtualization for performance.

### 5.3 Performance Optimization

- **Lazy-load** Hanzi Writer instances using Intersection Observer. Only initialise when a card is visible.
- **Virtualize** the radical grid if rendering 214 cards causes lag.
- **On-demand data fetching** for stroke data: load from CDN only when needed.
- **Code splitting** per route or component.
- **Image/icon optimization**: use SVGs, lazy-load images.

### 5.4 Internationalization

- Store translations in JSON files (`en.json`, `vi.json`) or use a CMS.
- Ensure date/number formatting is locale-aware if you add any.
- Test that switching languages updates all dynamic content, including example translations.

---

## 6. UI/UX Guidelines

- **Modern, playful, clean:** Use rounded cards, soft shadows, generous whitespace, and a warm colour palette.
- **High contrast:** Ensure text is readable against backgrounds (WCAG AA).
- **Micro-interactions:** Hover effects, button press animations, and smooth transitions.
- **Navigation:** A simple header with logo, language switcher, and maybe a search/filter bar.
- **Filtering:** Allow filtering by stroke count, or search by Pinyin/English/Vietnamese meaning.
- **Accessibility:** Keyboard navigation, ARIA labels for buttons, alt text for illustrations.

---

## 7. Deployment & Deliverables

1. **Source code** in a public Git repository (GitHub, GitLab, etc.).
2. **Live deployed URL** (Vercel, Netlify, Cloudflare Pages, or any host).
3. **README.md** with:
   - Setup instructions.
   - Tech stack overview.
   - Data sourcing explanation.
   - How to run locally.
   - Any API keys or environment variables required.
4. **Dataset** (JSON or equivalent) included in the repo or generated via script.
5. **Tests** (optional but recommended): unit tests for data parsing, component tests for key UI.

---

## 8. Acceptance Criteria

The app is considered complete when:

- [ ] All 214 Kangxi radicals are present and display correctly.
- [ ] Each radical has stroke-order animation that plays on demand.
- [ ] Each radical has audio pronunciation that plays on click.
- [ ] Each radical has at least 2 example characters/words with Pinyin, English, and Vietnamese translations.
- [ ] The UI can switch between English and Vietnamese instantly, and all text updates.
- [ ] The app is responsive and works on mobile, tablet, and desktop.
- [ ] The app is deployed and accessible via a public URL.
- [ ] The source code is clean, documented, and runnable locally.

---

## 9. Appendix: Data Schema Example

```json
{
  "id": 1,
  "character": "一",
  "pinyin": "yī",
  "english": "one",
  "vietnamese": "một",
  "strokes": 1,
  "examples": [
    {
      "character": "一个",
      "pinyin": "yī gè",
      "english": "one (item)",
      "vietnamese": "một cái"
    },
    {
      "character": "一起",
      "pinyin": "yī qǐ",
      "english": "together",
      "vietnamese": "cùng nhau"
    }
  ],
  "illustration": "1️⃣"
}
```

---

**You are now fully briefed. Build the best possible Chinese radicals learning app. Use your judgment to choose tools, optimise performance, and deliver a polished, bilingual experience. When in doubt, prioritise clarity, speed, and delight.**

---

*End of brief.*