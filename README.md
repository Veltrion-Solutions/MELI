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
  Header.tsx        Announcement bar, scroll-up sticky nav, mega menu, search + bag
  HeroSlider.tsx    Fade slider (3s autoplay, slow zoom, dots)
  SplitBanner.tsx   Full-bleed side-by-side image tiles (hover to expand)
  Categories.tsx    Four category tiles (filter the product grid)
  ProductRow.tsx    Carousel row with arrows and "Add to bag"
  Products.tsx      "New arrivals" (filterable) and "Best sellers" rows
  Reviews.tsx       Customer reviews
  Ticker.tsx        Looping text strip
  ParallaxBanner.tsx Full-width parallax image banner
  Reveal.tsx        Fade-up-on-scroll wrapper
  CartDrawer.tsx    Slide-in bag with free-shipping progress
  SearchOverlay.tsx Search panel
  MobileDock.tsx    Bottom nav bar on phones
  Footer.tsx        Reveal-on-scroll footer, accordions on phones, newsletter
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
- **Banner photos:** `public/images/hero.jpg` and `public/images/story.jpg`; banner copy is in `app/page.tsx`.
- **Styling:** colours, fonts and layout width are CSS variables at the top of `app/globals.css`.

## Notes

- The photos in `public/images/` were cropped from mockup screenshots, so they are low resolution. Replace them with original photos using the same file names for a sharper result.
- The bag keeps items in memory only (lost on refresh); there is no checkout or backend yet.
- The newsletter form (in the footer) does not send data anywhere yet.

## License

See [LICENSE](LICENSE) and [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
