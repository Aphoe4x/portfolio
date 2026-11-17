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
main.js           loader, fan, rail spy, reveals, flips, shuffle, dialogs
assets/favicon.svg
assets/projects/  project logos
```

## Notes

- Motion respects `prefers-reduced-motion`. Reduced motion gets the same content, static.
- No em-dashes, no middle dots. Plain copy on purpose.
- The loader only runs once per browser session.
- Live Whot opens in a native dialog, with the game mounted on first use.
- Built and shipped in small commits, one section at a time.
