import Image from "next/image";

/** Image slot. Renders a soft placeholder until a `src` is provided. */
export default function Photo({ src, alt, sizes, priority }: { src?: string; alt: string; sizes: string; priority?: boolean }) {
  if (!src) return <div className="photo-placeholder" role="img" aria-label={alt} />;
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="photo" />;
}
