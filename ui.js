import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
const cls = (...a) => a.filter(Boolean).join(" ");
function Badge({ s, children, dot }) {
  return /* @__PURE__ */ jsxDEV("span", { className: cls("badge", s), children: [
    dot && /* @__PURE__ */ jsxDEV("span", { className: "dotb" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 9,
      columnNumber: 15
    }, this),
    children
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 8,
    columnNumber: 5
  }, this);
}
function SevTag({ level }) {
  const map = {
    critical: "sev-critical",
    high: "sev-high",
    moderate: "sev-moderate",
    information: "sev-information"
  };
  const key = (level || "").toString().toLowerCase().trim();
  return /* @__PURE__ */ jsxDEV("span", { className: cls("sev-tag", map[key] || "sev-information"), children: level }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 22,
    columnNumber: 10
  }, this);
}
function Confidence({ val, size = "md" }) {
  const color = val >= 85 ? "#16a34a" : val >= 60 ? "#d97706" : "#dc2626";
  return /* @__PURE__ */ jsxDEV("span", { className: "mono", style: { fontWeight: 700, fontSize: size === "sm" ? 12 : 13, color }, children: [
    val,
    "%"
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 28,
    columnNumber: 5
  }, this);
}
function Progress({ value, color, h }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "bar bar-sm", style: h ? { height: h } : void 0, children: /* @__PURE__ */ jsxDEV("span", { style: { width: `${Math.min(100, Math.max(0, value))}%`, background: color } }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 37,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 36,
    columnNumber: 5
  }, this);
}
function Meter({ label, value, color }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "meter-row", children: [
    /* @__PURE__ */ jsxDEV("span", { className: "m-lbl", children: label }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 45,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "bar", children: /* @__PURE__ */ jsxDEV("span", { style: { width: `${value}%`, background: color || "#1a5fd0" } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 46,
      columnNumber: 28
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 46,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "m-val", children: [
      value,
      "%"
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 47,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 44,
    columnNumber: 5
  }, this);
}
function Card({ title, sub, action, children, className, bodyStyle, pad }) {
  return /* @__PURE__ */ jsxDEV("div", { className: cls("card", className), children: [
    (title || action) && /* @__PURE__ */ jsxDEV("div", { className: "card-head", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("h3", { children: title }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 58,
          columnNumber: 13
        }, this),
        sub && /* @__PURE__ */ jsxDEV("div", { className: "card-title-sub", children: sub }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 59,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 57,
        columnNumber: 11
      }, this),
      action
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 56,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "card-body", style: pad ? { paddingTop: pad.t, paddingBottom: pad.b } : void 0, ...bodyStyle ? { style: bodyStyle } : {}, children }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 64,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 54,
    columnNumber: 5
  }, this);
}
function Section({ title, children, action }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "stack", children: [
    /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ jsxDEV("h2", { className: "section-title", style: { margin: 0 }, children: title }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 75,
        columnNumber: 9
      }, this),
      action
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 74,
      columnNumber: 7
    }, this),
    children
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 73,
    columnNumber: 5
  }, this);
}
function Legend({ items }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "legend-inline", children: items.map((it) => /* @__PURE__ */ jsxDEV("span", { className: "legend-item", children: [
    /* @__PURE__ */ jsxDEV("span", { className: "swatch", style: { background: it.color } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 88,
      columnNumber: 11
    }, this),
    it.label
  ] }, it.label, true, {
    fileName: "<stdin>",
    lineNumber: 87,
    columnNumber: 9
  }, this)) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 85,
    columnNumber: 5
  }, this);
}
function Empty({ title = "No data available", sub, icon }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "empty", children: [
    icon,
    /* @__PURE__ */ jsxDEV("div", { className: "e-title", children: title }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 100,
      columnNumber: 7
    }, this),
    sub && /* @__PURE__ */ jsxDEV("div", { className: "e-sub", children: sub }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 101,
      columnNumber: 15
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 98,
    columnNumber: 5
  }, this);
}
function SkeletonLines({ rows = 4 }) {
  return /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", flexDirection: "column", gap: 12, padding: 8 }, children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ jsxDEV("div", { className: "skeleton", style: { height: 16, width: `${100 - i * 8}%` } }, i, false, {
    fileName: "<stdin>",
    lineNumber: 110,
    columnNumber: 9
  }, this)) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 108,
    columnNumber: 5
  }, this);
}
function IconBtn({ children, title, onClick, className, style }) {
  return /* @__PURE__ */ jsxDEV("button", { className: cls("icbtn", className), title, onClick, style, children }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 118,
    columnNumber: 5
  }, this);
}
function StatChip({ n, l, tone }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "stat-chip", children: [
    /* @__PURE__ */ jsxDEV("span", { className: "n", style: tone ? { color: tone } : void 0, children: n }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 127,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "l", children: l }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 128,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 126,
    columnNumber: 5
  }, this);
}
function Pill({ children, tone }) {
  return /* @__PURE__ */ jsxDEV("span", { className: cls("live-pill", tone), children }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 134,
    columnNumber: 10
  }, this);
}
function Tooltip({ label, children }) {
  return /* @__PURE__ */ jsxDEV("span", { className: "tip", children: [
    children,
    /* @__PURE__ */ jsxDEV("span", { className: "tip-box", children: label }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 141,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 139,
    columnNumber: 5
  }, this);
}
export {
  Badge,
  Card,
  Confidence,
  Empty,
  IconBtn,
  Legend,
  Meter,
  Pill,
  Progress,
  Section,
  SevTag,
  SkeletonLines,
  StatChip,
  Tooltip,
  cls
};
