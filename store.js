import { jsxDEV } from "react/jsx-dev-runtime";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { supabase } from "./supabase.js";
const AppCtx = createContext(null);
function AppProvider({ children }) {
  const [route, setRouteRaw] = useState(parseHash());
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState("light");
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(/* @__PURE__ */ new Date());
  const [sbOpen, setSbOpen] = useState(false);
  const [alertsCount, setAlertsCount] = useState(11);

  useEffect(() => {
    let active = true;
    const fetchAlertsCount = async () => {
      try {
        const { data } = await supabase.from('weather_reports').select('id, event_type, city, status');
        if (data && active) {
          const valid = data.filter(r => (r.status || '').toLowerCase() !== 'rejected');
          const groups = new Set(valid.map(r => `${(r.city || '').toLowerCase()}__${(r.event_type || '').toLowerCase()}`));
          // minimum 4 national baseline advisories for uncovered regions
          const count = Math.max(groups.size + 4, 8);
          setAlertsCount(count);
        }
      } catch (err) {
        // keep current count
      }
    };
    fetchAlertsCount();
    let ch = null;
    try {
      ch = supabase.channel('store-alerts-badge').on('postgres_changes', { event: '*', schema: 'public', table: 'weather_reports' }, fetchAlertsCount).subscribe();
    } catch (e) {}
    return () => {
      active = false;
      if (ch) supabase.removeChannel(ch);
    };
  }, []);

  useEffect(() => {
    const on = () => setNow(/* @__PURE__ */ new Date());
    const t = setInterval(on, 1e3);
    return () => clearInterval(t);
  }, []);
  const go = useCallback((r) => {
    window.location.hash = "#" + r;
    setRouteRaw(r);
    setSearch("");
  }, []);
  useEffect(() => {
    const h = () => setRouteRaw(parseHash());
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  const toast = useCallback((opts) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { ...opts, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const toggleTheme = useCallback((t) => {
    const next = t || (theme === "light" ? "dark" : "light");
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, [theme]);
  return /* @__PURE__ */ jsxDEV(AppCtx.Provider, { value: { route, go, toasts, toast, theme, toggleTheme, search, setSearch, now, sbOpen, setSbOpen, alertsCount, setAlertsCount }, children: [
    children,
    /* @__PURE__ */ jsxDEV(ToastStack, { toasts }, void 0, false, {
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
function useApp() {
  return useContext(AppCtx);
}
function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  const icon = {
    ok: /* @__PURE__ */ jsxDEV(CheckCircle2, { size: 16 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 59,
      columnNumber: 9
    }, this),
    err: /* @__PURE__ */ jsxDEV(AlertTriangle, { size: 16 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 60,
      columnNumber: 10
    }, this),
    info: /* @__PURE__ */ jsxDEV(Info, { size: 16 }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 61,
      columnNumber: 11
    }, this)
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "toasts", children: toasts.map((t) => /* @__PURE__ */ jsxDEV("div", { className: `toast ${t.type || "info"}`, children: [
    /* @__PURE__ */ jsxDEV("div", { className: "t-ic", children: icon[t.type || "info"] }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 67,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV("div", { children: [
      /* @__PURE__ */ jsxDEV("div", { className: "t-title", children: t.title }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 69,
        columnNumber: 13
      }, this),
      t.desc && /* @__PURE__ */ jsxDEV("div", { className: "t-desc", children: t.desc }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 70,
        columnNumber: 24
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 68,
      columnNumber: 11
    }, this)
  ] }, t.id, true, {
    fileName: "<stdin>",
    lineNumber: 66,
    columnNumber: 9
  }, this)) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 64,
    columnNumber: 5
  }, this);
}
function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, "");
  if (!h) return "overview";
  return h;
}
export {
  AppProvider,
  useApp
};
