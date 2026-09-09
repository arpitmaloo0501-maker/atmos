import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React, { useState } from "react";
import {
  LayoutDashboard,
  Map as MapIcon,
  FileText,
  CloudLightning,
  ShieldCheck,
  BarChart3,
  Bell,
  Users,
  Settings,
  HelpCircle,
  User,
  Search,
  Sun,
  Moon,
  CloudSun
} from "lucide-react";
import { useApp } from "./store.js";
const MAIN_NAV = [
  { r: "overview", label: "Overview", icon: LayoutDashboard },
  { r: "map", label: "Live Weather Map", icon: MapIcon },
  { r: "reports", label: "Reports", icon: FileText },
  { r: "events", label: "Weather Events", icon: CloudLightning },
  { r: "verification", label: "AI Verification", icon: ShieldCheck },
  { r: "analytics", label: "Analytics", icon: BarChart3 },
  { r: "alerts", label: "Alerts", icon: Bell, badge: 8 },
  { r: "citizen", label: "Citizen Reports", icon: Users }
];
const BOTTOM_NAV = [
  { r: "settings", label: "Settings", icon: Settings },
  { r: "help", label: "Help", icon: HelpCircle },
  { r: "profile", label: "User Profile", icon: User }
];
function isActive(route, r) {
  return route === r;
}
function NavItem({ it, active, onClick, badge }) {
  const Icon = it.icon;
  return /* @__PURE__ */ jsxDEV("button", { className: `nav-item ${active ? "active" : ""}`, onClick, children: [
    /* @__PURE__ */ jsxDEV(Icon, { size: 18 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 34,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "grow", children: it.label }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 35,
      columnNumber: 7
    }, this),
    (badge || it.badge) && /* @__PURE__ */ jsxDEV("span", { className: "nav-badge", children: badge || it.badge }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 36,
      columnNumber: 31
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 33,
    columnNumber: 5
  }, this);
}
function Sidebar() {
  const { route, go, sbOpen, setSbOpen, alertsCount } = useApp();
  const close = () => setSbOpen(false);
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    sbOpen && /* @__PURE__ */ jsxDEV("div", { className: "backdrop", style: { position: "fixed", inset: 0, background: "rgba(2,8,23,.5)", zIndex: 35 }, onClick: close }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 46,
      columnNumber: 18
    }, this),
    /* @__PURE__ */ jsxDEV("aside", { className: `sidebar ${sbOpen ? "open" : ""}`, children: [
      /* @__PURE__ */ jsxDEV("div", { className: "brand", style: { cursor: "pointer" }, onClick: () => {
        go("overview");
        close();
      }, children: [
        /* @__PURE__ */ jsxDEV("div", { className: "brand-logo", children: /* @__PURE__ */ jsxDEV(CloudLogo, {}, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 49,
          columnNumber: 39
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 49,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("div", { className: "brand-name", children: "MausamNet" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 51,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "brand-sub", children: "AI-Powered National Weather Intelligence" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 52,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 50,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 48,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("nav", { className: "side-nav", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "nav-group", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "nav-label", children: "Intelligence" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 58,
            columnNumber: 13
          }, this),
          MAIN_NAV.map((it) => /* @__PURE__ */ jsxDEV(NavItem, { it, active: isActive(route, it.r), badge: it.r === "alerts" ? alertsCount : it.badge, onClick: () => {
            go(it.r);
            close();
          } }, it.r, false, {
            fileName: "<stdin>",
            lineNumber: 60,
            columnNumber: 15
          }, this))
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 57,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 56,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "side-foot", children: BOTTOM_NAV.map((n) => /* @__PURE__ */ jsxDEV(NavItem, { it: n, active: route === n.r, onClick: () => {
        go(n.r);
        close();
      } }, n.r, false, {
        fileName: "<stdin>",
        lineNumber: 72,
        columnNumber: 13
      }, this)) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 70,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 47,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 45,
    columnNumber: 5
  }, this);
}
function Topbar() {
  const { search, setSearch, now, toggleTheme, theme, toast, go, setSbOpen, sbOpen } = useApp();
  return /* @__PURE__ */ jsxDEV("header", { className: "topbar", children: [
    /* @__PURE__ */ jsxDEV("button", { className: "icbtn burger", onClick: () => setSbOpen(!sbOpen), children: /* @__PURE__ */ jsxDEV(Burger, {}, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 85,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 84,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "searchbox", children: [
      /* @__PURE__ */ jsxDEV(Search, { size: 16 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 88,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          placeholder: "Search reports, events, cities, states\u2026",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter" && search.trim()) go("reports");
          }
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 89,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 87,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "spacer" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 95,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "live-pill live top-clock-hide", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "ping" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 96,
        columnNumber: 55
      }, this),
      " LIVE"
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 96,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "top-clock top-clock-hide", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "t", children: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 98,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "d", children: now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 99,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 97,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("button", { className: "icbtn", title: "AI Weather Briefing", onClick: () => toast({ type: "info", title: "MausamNet AI Briefing", desc: "Rainfall across central India, heatwave intensifying over the north-west, monsoon surge over the western coast." }), children: /* @__PURE__ */ jsxDEV(CloudSun, { size: 18 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 102,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 101,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("button", { className: "icbtn", title: "Notifications", onClick: () => toast({ type: "info", title: "Notifications", desc: "8 new alerts \xB7 2 reports pending review" }), children: /* @__PURE__ */ jsxDEV("span", { style: { position: "relative", display: "grid", placeItems: "center" }, children: [
      /* @__PURE__ */ jsxDEV(Bell, { size: 18 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 105,
        columnNumber: 87
      }, this),
      /* @__PURE__ */ jsxDEV("i", { className: "dot" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 105,
        columnNumber: 105
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 105,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 104,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("button", { className: "icbtn", title: "Toggle theme", onClick: () => toggleTheme(), children: theme === "light" ? /* @__PURE__ */ jsxDEV(Moon, { size: 18 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 108,
      columnNumber: 30
    }, this) : /* @__PURE__ */ jsxDEV(Sun, { size: 18 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 108,
      columnNumber: 51
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 107,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("button", { className: "btn ghost sm", style: { height: "auto", border: "none", padding: 0 }, onClick: () => go("profile"), children: /* @__PURE__ */ jsxDEV("div", { className: "avatar", children: "NR" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 111,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 110,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 83,
    columnNumber: 5
  }, this);
}
const Burger = () => /* @__PURE__ */ jsxDEV("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", children: [
  /* @__PURE__ */ jsxDEV("line", { x1: "4", y1: "6", x2: "20", y2: "6" }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 119,
    columnNumber: 142
  }),
  /* @__PURE__ */ jsxDEV("line", { x1: "4", y1: "12", x2: "20", y2: "12" }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 119,
    columnNumber: 179
  }),
  /* @__PURE__ */ jsxDEV("line", { x1: "4", y1: "18", x2: "20", y2: "18" }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 119,
    columnNumber: 218
  })
] }, void 0, true, {
  fileName: "<stdin>",
  lineNumber: 119,
  columnNumber: 22
});
function CloudLogo() {
  return /* @__PURE__ */ jsxDEV("svg", { width: "22", height: "22", viewBox: "0 0 24 24", fill: "none", stroke: "white", strokeWidth: "1.8", strokeLinecap: "round", children: [
    /* @__PURE__ */ jsxDEV("circle", { cx: "12.5", cy: "6.5", r: "3.5", fill: "white", stroke: "none" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 124,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("path", { d: "M6 15c2.5 0 2.5-3 5-3s2.5 3 5 3c1.2 0 1.8.8 2 1.8" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 125,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("path", { d: "M18.5 16.5a1.5 1.5 0 0 1 0 3H5.5a1.5 1.5 0 0 1 0-3c.9 0 1-.8 1-1.5" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 126,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("path", { d: "M9 22l1.5-3M15 22l1.5-3" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 127,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 123,
    columnNumber: 5
  }, this);
}
export {
  Sidebar,
  Topbar
};
