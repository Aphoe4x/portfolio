# cards

A card table portfolio for **Afolabi Abdulbasit Opeyemi**.

Plain HTML, CSS and JavaScript. No build step, no dependencies, no framework. Every section is dealt like a hand: the name arrives as five cards, projects flip when you pick them up, the experience deck stacks as you scroll, and a shuffle button re-deals the page.

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
main.js           reveal observer, cursor card, shuffle
assets/favicon.svg
```

## Notes

- Motion respects `prefers-reduced-motion`. Reduced motion gets the same content, static.
- No em-dashes, no middle dots. Plain copy on purpose.
- Built and shipped in small commits, one section at a time.
