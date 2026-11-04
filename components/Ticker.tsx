const TEXT = ["Soft days, well dressed", "Designed in Sri Lanka", "Free shipping above Rs 12,000", "Dresses · Tops · Skirts · Pants"];

/** Endless looping text strip. */
export default function Ticker() {
  return (
    <div className="ticker" aria-label={TEXT.join(", ")}>
      <div className="ticker-track" aria-hidden>
        {["a", "b"].map((k) => (
          <div className="ticker-group" key={k}>
            {TEXT.map((t) => <span key={t}>{t}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}
