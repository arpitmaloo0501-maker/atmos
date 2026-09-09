import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useEffect, Component } from "react";
import { createRoot } from "react-dom/client";
import { AppProvider, useApp } from "./store.js";
import { Sidebar, Topbar } from "./shell.js";
import {
  Overview,
  LiveMap,
  Reports,
  ReportDetail,
  Verification,
  Analytics,
  CitizenReport,
  Alerts,
  WeatherEvents,
  Settings,
  Help,
  Profile,
  CinematicIntro
} from "./pages.js";
function Router() {
  const { route } = useApp();
  if (route.startsWith("report/")) {
    return /* @__PURE__ */ jsxDEV(ReportDetail, { id: route.split("/")[1] }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 14,
      columnNumber: 12
    }, this);
  }
  switch (route) {
    case "intro":
      return /* @__PURE__ */ jsxDEV(CinematicIntro, {}, void 0, false, { fileName: "<stdin>", lineNumber: 100, columnNumber: 1 }, this);
    case "overview":
      return /* @__PURE__ */ jsxDEV(Overview, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 17,
        columnNumber: 29
      }, this);
    case "map":
      return /* @__PURE__ */ jsxDEV(LiveMap, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 18,
        columnNumber: 24
      }, this);
    case "reports":
      return /* @__PURE__ */ jsxDEV(Reports, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 19,
        columnNumber: 28
      }, this);
    case "verification":
      return /* @__PURE__ */ jsxDEV(Verification, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 20,
        columnNumber: 33
      }, this);
    case "analytics":
      return /* @__PURE__ */ jsxDEV(Analytics, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 21,
        columnNumber: 30
      }, this);
    case "citizen":
      return /* @__PURE__ */ jsxDEV(CitizenReport, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 22,
        columnNumber: 28
      }, this);
    case "alerts":
      return /* @__PURE__ */ jsxDEV(Alerts, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 27
      }, this);
    case "events":
      return /* @__PURE__ */ jsxDEV(WeatherEvents, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 24,
        columnNumber: 27
      }, this);
    case "settings":
      return /* @__PURE__ */ jsxDEV(Settings, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 25,
        columnNumber: 29
      }, this);
    case "help":
      return /* @__PURE__ */ jsxDEV(Help, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 26,
        columnNumber: 25
      }, this);
    case "profile":
      return /* @__PURE__ */ jsxDEV(Profile, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 27,
        columnNumber: 28
      }, this);
    default:
      return /* @__PURE__ */ jsxDEV(Overview, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 21
      }, this);
  }
}
function Shell() {
  const { theme, toggleTheme, route } = useApp();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, []);
  if (route === "intro") {
    return /* @__PURE__ */ jsxDEV(Router, {}, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 43,
      columnNumber: 12
    }, this);
  }
  return /* @__PURE__ */ jsxDEV("div", { className: "app", children: [
    /* @__PURE__ */ jsxDEV(Sidebar, {}, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 44,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "main", children: [
      /* @__PURE__ */ jsxDEV(Topbar, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 46,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("main", { className: "content", children: /* @__PURE__ */ jsxDEV(Router, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 48,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 47,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 45,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 43,
    columnNumber: 5
  }, this);
}
class Boundary extends Component {
  constructor(p) {
    super(p);
    this.state = { e: null };
  }
  static getDerivedStateFromError(e) {
    return { e };
  }
  componentDidCatch(e) {
    console.error("BOUNDARY:", e.message, e.stack);
  }
  render() {
    if (this.state.e) {
      return /* @__PURE__ */ jsxDEV("div", { style: { padding: 20, font: "12px monospace", whiteSpace: "pre-wrap" }, children: [
        "BOUNDARY: ",
        String(this.state.e && this.state.e.stack)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 61,
        columnNumber: 14
      }, this);
    }
    return this.props.children;
  }
}
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxDEV(AppProvider, { children: /* @__PURE__ */ jsxDEV(Boundary, { children: /* @__PURE__ */ jsxDEV(Shell, {}, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 70,
    columnNumber: 7
  }) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 69,
    columnNumber: 5
  }) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 68,
    columnNumber: 3
  })
);
