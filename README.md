# MELI

Storefront for **MELI** — easy dresses, tops, skirts and pants designed in Sri Lanka. Built with Next.js (App Router), React and TypeScript. The UI follows a clean white-and-black boutique style inspired by kellyfelder.com.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

Requires Node.js 20+.

## Project structure

```
app/
  layout.tsx        Root layout, fonts (Montserrat + Poppins), metadata
  page.tsx          Home page: assembles all sections
  globals.css       All styles, design tokens and responsive rules
components/
  Header.tsx        Announcement bar, sticky nav, bag counter
  Hero.tsx          Intro with arch image
  Categories.tsx    Four category tiles (filter the product grid)
  Products.tsx      Product grid with "Add to bag"
  Story.tsx         Brand story, split image/text
  Reviews.tsx       Customer reviews
  Newsletter.tsx    Email sign-up
  Footer.tsx        Links and copyright
  ShopProvider.tsx  Shared state: category filter and bag count
  Photo.tsx         next/image wrapper with a placeholder fallback
lib/
  products.ts       Categories, products, reviews, price formatting
public/
  assets/Logo.jpeg  Logo / favicon
  images/           Product, hero and story photos
ref/                Design reference screenshots (not used at runtime)
```

## Editing content

- **Products and categories:** edit `lib/products.ts`. Each product has `id`, `name`, `price` (LKR), `category`, optional `badge` and `image`.
- **Images:** put files in `public/images/` and set the `image` path, e.g. `/images/marisol-maxi.jpg`. Without an `image`, a grey placeholder is shown.
- **Hero and story photos:** `public/images/hero.jpg` and `public/images/story.jpg`.
- **Styling:** colours, fonts and layout width are CSS variables at the top of `app/globals.css`.

## Notes

- The photos in `public/images/` were cropped from mockup screenshots, so they are low resolution. Replace them with original photos using the same file names for a sharper result.
- The bag is a visual counter only; there is no checkout or backend yet.
- The newsletter form does not send data anywhere yet.

## License

See [LICENSE](LICENSE) and [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
