"use client";

import { useState } from "react";

import { SIZE_CHART as ROWS } from "@/lib/products";

const TIPS = [
  { title: "Bust", text: "Measure around the fullest part of your chest, keeping the tape level." },
  { title: "Waist", text: "Measure around your natural waistline, the narrowest part of your torso." },
  { title: "Hip", text: "Stand with feet together and measure around the fullest part of your hips." },
];

type Unit = "in" | "cm";

/** Chart values are stored in inches. */
function fmt(n: number, unit: Unit) {
  return unit === "in" ? String(n) : String(Math.round(n * 2.54));
}

export default function SizeGuide() {
  const [unit, setUnit] = useState<Unit>("in");
  return (
    <section className="section size-guide">
      <div className="container">
        <div className="size-head">
          <div className="section-head">
            <p className="eyebrow">Fit &amp; sizing</p>
            <h1>Size chart</h1>
          </div>
          <div className="unit-switch" role="group" aria-label="Measurement unit">
            {(["in", "cm"] as Unit[]).map((u) => (
              <button key={u} type="button" aria-pressed={unit === u} onClick={() => setUnit(u)}>{u}</button>
            ))}
          </div>
        </div>

        <div className="size-table-wrap">
          <table className="size-table">
            <caption className="sr-only">Body measurements by size, in {unit === "in" ? "inches" : "centimetres"}</caption>
            <thead>
              <tr>
                <th scope="col">Size</th>
                <th scope="col">Bust</th>
                <th scope="col">Waist</th>
                <th scope="col">Hip</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.size}>
                  <th scope="row">{r.size}</th>
                  <td>{fmt(r.bust, unit)}</td>
                  <td>{fmt(r.waist, unit)}</td>
                  <td>{fmt(r.hips, unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="size-note">Measurements in {unit === "in" ? "inches" : "centimetres"}.</p>

        <div className="size-tips">
          {TIPS.map((t) => (
            <div key={t.title} className="size-tip">
              <p className="size-tip-title">{t.title}</p>
              <p>{t.text}</p>
            </div>
          ))}
        </div>
        <p className="size-note">Between sizes? Size up for a relaxed fit, or down for a closer fit.</p>
      </div>
    </section>
  );
}
