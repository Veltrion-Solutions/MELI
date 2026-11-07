"use client";

import { useState } from "react";

export default function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="newsletter">
      <div className="container">
        <h2>Join the MELI list</h2>
        <p>Be first to new drops, plus 10% off your first order.</p>
        {done ? (
          <p className="thanks" role="status">Thank you — welcome to MELI.</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            <input type="email" required placeholder="Your email" aria-label="Email address" />
            <button type="submit" className="btn btn-solid">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
}
