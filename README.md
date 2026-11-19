# cards

A card table portfolio for **Afolabi Abdulbasit Opeyemi**.

Plain HTML, CSS and JavaScript. No build step, no dependencies, no framework.

The shell is a black rail and an off-white room. Type is Oswald, Geist and Geist Mono, with a single amber accent. The deck shows up everywhere: the name is dealt as a hand that fans with your pointer, the work is a spread of cards that straighten when you pick one up, sections are labelled like suits, and a shuffle button re-deals the whole spread.

## Run it

Open `index.html` directly, or serve the folder:

```powershell
python -m http.server 8130
```

Then visit http://localhost:8130

## Structure

```
index.html        markup for every section
styles.css        all styling, tokens at the top
main.js           fan, rail spy, reveals, flips, shuffle, dialogs
assets/favicon.svg
assets/touch-icon.png
assets/og.png     1200x630 share card
assets/projects/  project logos
```

## Deploy

The site is published with GitHub Pages at https://aphoe4x.github.io/portfolio/.

Pages serves the repo root of `Aphoe4x/portfolio` on `main`. There is no build step, so a push is a deploy. `.nojekyll` keeps Pages from running the files through Jekyll. Absolute `canonical`, `og:url` and share image URLs point at that address, so if the address ever changes, update them in one pass at the top of `index.html`.

This repo stays the place where the work happens. To publish:

```powershell
git push pages main
```

## Notes

- Motion respects `prefers-reduced-motion`. Reduced motion gets the same content, static.
- No em-dashes, no middle dots. Plain copy on purpose.
- The hand deals itself in on load. There is no loading screen to wait through.
- On mobile the rail sticks to the top of the screen when you scroll down.
- Whot is live at https://naija-whot.start.ng/. From the portfolio, "Play here" opens it in a native dialog; the game is mounted on first use. The room dialog also links straight to it.
- Built and shipped in small commits, one section at a time.
