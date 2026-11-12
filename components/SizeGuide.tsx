"use client";

import { useState } from "react";

// Body measurements in centimetres; inches are derived.
const ROWS = [
  { size: "XS", uk: "6", bust: [80, 84], waist: [62, 66], hips: [86, 90] },
  { size: "S", uk: "8", bust: [84, 88], waist: [66, 70], hips: [90, 94] },
  { size: "M", uk: "10", bust: [88, 92], waist: [70, 74], hips: [94, 98] },
  { size: "L", uk: "12", bust: [92, 98], waist: [74, 80], hips: [98, 104] },
  { size: "XL", uk: "14", bust: [98, 104], waist: [80, 86], hips: [104, 110] },
];

const TIPS = [
  { title: "Bust", text: "Measure around the fullest part of your chest, keeping the tape level." },
  { title: "Waist", text: "Measure around your natural waistline, the narrowest part of your torso." },
  { title: "Hips", text: "Stand with feet together and measure around the fullest part of your hips." },
];

type Unit = "cm" | "in";

function fmt([a, b]: number[], unit: Unit) {
  if (unit === "cm") return `${a}–${b}`;
  const r = (n: number) => (Math.round((n / 2.54) * 2) / 2).toString();
  return `${r(a)}–${r(b)}`;
}

export default function SizeGuide() {
  const [unit, setUnit] = useState<Unit>("cm");
  return (
    <section className="section size-guide">
      <div className="container">
        <div className="size-head">
          <div className="section-head">
            <p className="eyebrow">Fit &amp; sizing</p>
            <h1>Size guide</h1>
          </div>
          <div className="unit-switch" role="group" aria-label="Measurement unit">
            {(["cm", "in"] as Unit[]).map((u) => (
              <button key={u} type="button" aria-pressed={unit === u} onClick={() => setUnit(u)}>{u}</button>
            ))}
          </div>
        </div>

        <div className="size-table-wrap">
          <table className="size-table">
            <caption className="sr-only">Body measurements by size, in {unit === "cm" ? "centimetres" : "inches"}</caption>
            <thead>
              <tr>
                <th scope="col">Size</th>
                <th scope="col">UK</th>
                <th scope="col">Bust</th>
                <th scope="col">Waist</th>
                <th scope="col">Hips</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.size}>
                  <th scope="row">{r.size}</th>
                  <td>{r.uk}</td>
                  <td>{fmt(r.bust, unit)}</td>
                  <td>{fmt(r.waist, unit)}</td>
                  <td>{fmt(r.hips, unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
