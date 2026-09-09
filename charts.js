import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
const COLORS = ["#1a5fd0", "#0ea5e9", "#7c3aed", "#f97316", "#16a34a", "#dc2626", "#d97706", "#94a3b8"];
const brand = (v) => v >= 85 ? "#16a34a" : v >= 60 ? "#d97706" : "#dc2626";
function Sparkline({ data, color = "#1a5fd0", w = 110, h = 34 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pad = 3;
  const step = (w - pad * 2) / Math.max(1, data.length - 1);
  const pts = data.map((d, i) => [pad + i * step, pad + (h - pad * 2) * (1 - (d - min) / (max - min || 1))]);
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `${pad},${h - pad} ${line} ${w - pad},${h - pad}`;
  const gid = "g" + Math.random().toString(36).slice(2, 7);
  return /* @__PURE__ */ jsxDEV("svg", { width: w, height: h, viewBox: `0 0 ${w} ${h}`, children: [
    /* @__PURE__ */ jsxDEV("defs", { children: /* @__PURE__ */ jsxDEV("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1", children: [
      /* @__PURE__ */ jsxDEV("stop", { offset: "0%", stopColor: color, stopOpacity: "0.28" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 20,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("stop", { offset: "100%", stopColor: color, stopOpacity: "0" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 21,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 19,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 18,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("polygon", { points: area, fill: `url(#${gid})` }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 24,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("polyline", { points: line, fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 25,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 17,
    columnNumber: 5
  }, this);
}
function AxisLabel({ x, y, text, anchor }) {
  return /* @__PURE__ */ jsxDEV("text", { x, y, textAnchor: anchor || "middle", fontSize: "10", fill: "var(--ink-4)", fontFamily: "Inter", children: text }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 31,
    columnNumber: 10
  }, this);
}
function LineChart({ labels, datasets, height = 220 }) {
  const W = 700, H = height;
  const P = { l: 46, r: 16, t: 16, b: 34 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const all = datasets.flatMap((d) => d.data);
  const max = Math.max(1, ...all) * 1.12;
  const X = (i) => P.l + iw / Math.max(1, labels.length - 1) * i;
  const Y = (v) => P.t + ih - v / max * ih;
  const grid = 5;
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", children: [
      Array.from({ length: grid + 1 }).map((_, i) => {
        const y = P.t + ih / grid * i;
        const v = Math.round(max - max / grid * i);
        return /* @__PURE__ */ jsxDEV("g", { children: [
          /* @__PURE__ */ jsxDEV("line", { x1: P.l, y1: y, x2: W - P.r, y2: y, stroke: "var(--line)", strokeWidth: "1" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 51,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("text", { x: P.l - 8, y: y + 3.5, textAnchor: "end", fontSize: "10", fill: "var(--ink-4)", children: v }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 52,
            columnNumber: 15
          }, this)
        ] }, i, true, {
          fileName: "<stdin>",
          lineNumber: 50,
          columnNumber: 13
        }, this);
      }),
      labels.map((l, i) => /* @__PURE__ */ jsxDEV("text", { x: X(i), y: H - 10, textAnchor: "middle", fontSize: "10", fill: "var(--ink-4)", children: l }, i, false, {
        fileName: "<stdin>",
        lineNumber: 57,
        columnNumber: 11
      }, this)),
      datasets.map((ds, si) => {
        const d = ds.data.map((v, i) => `${X(i)},${Y(Number(v))}`).join(" ");
        const gid = "area" + si + Math.random().toString(36).slice(2, 6);
        return /* @__PURE__ */ jsxDEV("g", { children: [
          ds.fill && /* @__PURE__ */ jsxDEV(Fragment, { children: [
            /* @__PURE__ */ jsxDEV("defs", { children: /* @__PURE__ */ jsxDEV("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1", children: [
              /* @__PURE__ */ jsxDEV("stop", { offset: "0%", stopColor: ds.color, stopOpacity: "0.25" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 68,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV("stop", { offset: "100%", stopColor: ds.color, stopOpacity: "0" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 69,
                columnNumber: 23
              }, this)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 67,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 66,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("polygon", { points: `${X(0)},${Y(0)} ${d} ${X(labels.length - 1)},${Y(0)}`, fill: `url(#${gid})` }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 72,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 65,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("polyline", { points: d, fill: "none", stroke: ds.color || COLORS[si], strokeWidth: "2.6", strokeLinecap: "round", strokeLinejoin: "round" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 75,
            columnNumber: 15
          }, this)
        ] }, si, true, {
          fileName: "<stdin>",
          lineNumber: 63,
          columnNumber: 13
        }, this);
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 45,
      columnNumber: 7
    }, this),
    datasets.length > 1 && /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 14, marginTop: 4 }, children: datasets.map((ds, i) => /* @__PURE__ */ jsxDEV("span", { className: "legend-item", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "swatch", style: { background: ds.color || COLORS[i] } }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 83,
        columnNumber: 51
      }, this),
      ds.label
    ] }, i, true, {
      fileName: "<stdin>",
      lineNumber: 83,
      columnNumber: 13
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 81,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 44,
    columnNumber: 5
  }, this);
}
function BarChart({ x, datasets, height = 220 }) {
  const W = 760, H = height;
  const P = { l: 46, r: 16, t: 18, b: 40 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const series = datasets;
  const total = series.length;
  const all = x.flatMap((_, ri) => series.map((s) => s.data[ri] || 0));
  const max = Math.max(1, ...all) * 1.1;
  const groupW = iw / Math.max(1, x.length);
  const barW = Math.min(34, groupW * 0.7 / total);
  const barX = (ri, si) => P.l + ri * groupW + groupW * 0.15 + si * barW + (groupW * 0.7 - barW * total) / 2;
  return /* @__PURE__ */ jsxDEV("div", { children: /* @__PURE__ */ jsxDEV("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", children: [
    Array.from({ length: 5 }).map((_, i) => {
      const y = P.t + ih / 4 * i;
      const v = Math.round(max - max / 4 * i);
      return /* @__PURE__ */ jsxDEV("g", { children: [
        /* @__PURE__ */ jsxDEV("line", { x1: P.l, y1: y, x2: W - P.r, y2: y, stroke: "var(--line)", strokeWidth: "1" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 110,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("text", { x: P.l - 8, y: y + 3.5, textAnchor: "end", fontSize: "10", fill: "var(--ink-4)", children: v }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 111,
          columnNumber: 15
        }, this)
      ] }, i, true, {
        fileName: "<stdin>",
        lineNumber: 109,
        columnNumber: 13
      }, this);
    }),
    x.map((d, ri) => series.map((s, si) => {
      const v = Number(s.data[ri] || 0);
      const y = P.t + ih - v / max * ih;
      return /* @__PURE__ */ jsxDEV("rect", { x: barX(ri, si), y, width: barW, height: Math.max(0, P.t + ih - y), rx: "3", fill: s.color || COLORS[si], children: /* @__PURE__ */ jsxDEV("title", { children: `${d}: ${v}` }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 120,
        columnNumber: 15
      }, this) }, ri + "-" + si, false, {
        fileName: "<stdin>",
        lineNumber: 119,
        columnNumber: 13
      }, this);
    })),
    x.map((d, ri) => /* @__PURE__ */ jsxDEV("text", { x: P.l + ri * groupW + groupW / 2, y: H - 10, textAnchor: "middle", fontSize: "10", fill: "var(--ink-4)", children: d }, "l" + ri, false, {
      fileName: "<stdin>",
      lineNumber: 125,
      columnNumber: 11
    }, this))
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 104,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 103,
    columnNumber: 5
  }, this);
}
function Donut({ value, size = 180, color = "#16a34a", label, sub }) {
  const r = size / 2 - 16;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return /* @__PURE__ */ jsxDEV("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: [
    /* @__PURE__ */ jsxDEV("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "var(--bg-sunken)", strokeWidth: "18" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 138,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(
      "circle",
      {
        cx: size / 2,
        cy: size / 2,
        r,
        fill: "none",
        stroke: color,
        strokeWidth: "18",
        strokeLinecap: "round",
        strokeDasharray: `${pct / 100 * c} ${c}`,
        transform: `rotate(-90 ${size / 2} ${size / 2})`
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 139,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("text", { x: "50%", y: "48%", textAnchor: "middle", fontSize: "30", fontWeight: "800", fill: "var(--ink)", fontFamily: "JetBrains Mono", children: [
      pct,
      "%"
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 141,
      columnNumber: 7
    }, this),
    label && /* @__PURE__ */ jsxDEV("text", { x: "50%", y: "63%", textAnchor: "middle", fontSize: "9", fill: "var(--ink-4)", letterSpacing: ".08em", children: label.toUpperCase() }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 142,
      columnNumber: 17
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 137,
    columnNumber: 5
  }, this);
}
function HBar({ data, max, format }) {
  return /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", flexDirection: "column", gap: 13 }, children: data.map((d, i) => /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { width: 140, textAlign: "right", fontSize: 12.5, fontWeight: 500, color: "var(--ink-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: d.label }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 152,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { flex: 1, height: 18, background: "var(--bg-sunken)", borderRadius: 6, overflow: "hidden" }, children: /* @__PURE__ */ jsxDEV("div", { style: { width: `${d.value / maxV(data) * 100}%`, height: "100%", background: d.color || "#1a5fd0", borderRadius: 6, minWidth: 2 } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 154,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 153,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "mono", style: { width: 46, fontSize: 12, textAlign: "right", fontWeight: 600 }, children: format ? format(d.value) : d.value }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 156,
      columnNumber: 11
    }, this)
  ] }, i, true, {
    fileName: "<stdin>",
    lineNumber: 151,
    columnNumber: 9
  }, this)) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 149,
    columnNumber: 5
  }, this);
}
const maxV = (d) => Math.max(1, ...d.map((o) => o.value));
function MultiDonut({ data, size = 200, innerRatio = 0.7, total, center, sub }) {
  const sum = total || data.reduce((a, d) => a + d.value, 0);
  const r = size / 2 - 2;
  const c = 2 * Math.PI * r;
  const ir = r * innerRatio;
  let acc = 0;
  return /* @__PURE__ */ jsxDEV("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: [
    data.map((d, i) => {
      const frac = d.value / sum;
      const len = c * frac;
      const off = c * acc;
      acc += frac;
      return /* @__PURE__ */ jsxDEV(
        "circle",
        {
          cx: size / 2,
          cy: size / 2,
          r,
          fill: "none",
          stroke: d.color,
          strokeWidth: r - ir,
          strokeDasharray: `${len} ${c - len} ${c}`,
          strokeDashoffset: -off + c * 0.25
        },
        i,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 178,
          columnNumber: 11
        },
        this
      );
    }),
    /* @__PURE__ */ jsxDEV("circle", { cx: size / 2, cy: size / 2, r: ir, fill: "var(--bg-card)", stroke: "var(--line)" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 182,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("text", { x: "50%", y: "51%", textAnchor: "middle", fontSize: "22", fontWeight: "800", fill: "var(--ink)", fontFamily: "JetBrains Mono", children: center || sum }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 183,
      columnNumber: 7
    }, this),
    sub && /* @__PURE__ */ jsxDEV("text", { x: "50%", y: "66%", textAnchor: "middle", fontSize: "9", fill: "var(--ink-4)", letterSpacing: ".06em", children: sub.toUpperCase() }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 184,
      columnNumber: 15
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 171,
    columnNumber: 5
  }, this);
}
function Ring({ value, size = 100, color = "#16a34a", children }) {
  const pct = Math.max(0, Math.min(100, value));
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  return /* @__PURE__ */ jsxDEV("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: [
    /* @__PURE__ */ jsxDEV("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "var(--bg-sunken)", strokeWidth: "10" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 195,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(
      "circle",
      {
        cx: size / 2,
        cy: size / 2,
        r,
        fill: "none",
        stroke: color,
        strokeWidth: "10",
        strokeLinecap: "round",
        strokeDasharray: `${pct / 100 * c} ${c}`,
        transform: `rotate(-90 ${size / 2} ${size / 2})`
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 196,
        columnNumber: 7
      },
      this
    ),
    children
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 194,
    columnNumber: 5
  }, this);
}
export {
  BarChart,
  COLORS,
  Donut,
  HBar,
  LineChart,
  MultiDonut,
  Ring,
  Sparkline
};
