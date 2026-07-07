import React from "react";
import { FRUIT_PHOTO } from "../config/media.js";

// Sfondo frutta (agrumi). Usa la foto reale FRUIT_PHOTO se presente,
// altrimenti un pattern SVG di fette d'arancia, tenue e non invasivo.
function OrangeSlice({ x, y, r, rot }) {
  const segs = Array.from({ length: 10 }).map((_, i) => {
    const a0 = (i / 10) * Math.PI * 2, a1 = ((i + 1) / 10) * Math.PI * 2;
    const rr = r * 0.82;
    return "M0 0 L" + (Math.cos(a0) * rr).toFixed(1) + " " + (Math.sin(a0) * rr).toFixed(1) +
      " A" + rr + " " + rr + " 0 0 1 " + (Math.cos(a1) * rr).toFixed(1) + " " + (Math.sin(a1) * rr).toFixed(1) + " Z";
  });
  return (
    <g transform={"translate(" + x + " " + y + ") rotate(" + rot + ")"}>
      <circle r={r} fill="#F5A623" />
      <circle r={r * 0.9} fill="#FF7A1A" />
      <circle r={r * 0.84} fill="#FFB24D" />
      {segs.map((d, i) => <path key={i} d={d} fill="#FFCC80" stroke="#FF7A1A" strokeWidth="1.2" />)}
      <circle r={r * 0.08} fill="#FFE0A3" />
    </g>
  );
}

export function FruitBackground() {
  if (FRUIT_PHOTO) {
    return (
      <div className="fruit-bg" aria-hidden="true">
        <img src={FRUIT_PHOTO} alt="" />
      </div>
    );
  }
  const balls = [
    [120, 90, 92, 8], [340, 60, 74, -14], [520, 150, 100, 20],
    [80, 300, 82, 26], [300, 320, 96, -8], [500, 360, 70, 12],
    [640, 280, 88, -20], [220, 500, 90, 16], [430, 520, 78, -12],
  ];
  return (
    <div className="fruit-bg" aria-hidden="true">
      <svg viewBox="0 0 720 600" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.17 }}>
        {balls.map((b, i) => <OrangeSlice key={i} x={b[0]} y={b[1]} r={b[2]} rot={b[3]} />)}
      </svg>
    </div>
  );
}
