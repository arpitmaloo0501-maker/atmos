import { supabase } from './supabase.js';
import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  CloudLightning,
  Users,
  Database,
  Activity,
  Settings,
  Check,
  X,
  Flag,
  Eye,
  Server,
  Radio,
  Gauge,
  ShieldCheck,
  HardDrive,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { useApp } from "./store.js";
import { Badge, Card, StatChip } from "./ui.js";
import { LineChart, Ring } from "./charts.js";
import { VERIFICATION_QUEUE, SOURCE_MONITOR } from "./data.js";
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const VERDICT = { verified: "green", pending: "yellow", suspicious: "red", rejected: "gray", unverified: "gray" };
const ADMIN_NAV = [
  { r: "admin", label: "Dashboard", icon: LayoutDashboard },
  { r: "reports", label: "Reports", icon: FileText },
  { r: "admin-verification", label: "Verification Queue", icon: ClipboardList },
  { r: "events", label: "Weather Events", icon: CloudLightning },
  { r: "sources", label: "Data Sources", icon: Server },
  { r: "health", label: "System Health", icon: Activity },
  { r: "profile", label: "Users", icon: Users },
  { r: "analytics", label: "AI Monitoring", icon: Gauge },
  { r: "settings", label: "Settings", icon: Settings }
];
function AdminLayout({ children }) {
  const { route, go } = useApp();
  return /* @__PURE__ */ jsxDEV("div", { className: "stack", children: /* @__PURE__ */ jsxDEV("div", { className: "admin-layout", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "card admin-subnav", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "nav-label", style: { padding: "12px 12px 6px" }, children: "Admin" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 34,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { padding: "0 8px 10px" }, children: ADMIN_NAV.map((it) => /* @__PURE__ */ jsxDEV(
        "button",
        {
          className: `nav-item ${route === it.r || it.r === "admin-verification" && route === "admin-verification" ? "active" : ""}`,
          onClick: () => go(it.r),
          children: [
            /* @__PURE__ */ jsxDEV(it.icon, { size: 17 }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 39,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "grow", children: it.label }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 40,
              columnNumber: 17
            }, this)
          ]
        },
        it.r,
        true,
        {
          fileName: "<stdin>",
          lineNumber: 37,
          columnNumber: 15
        },
        this
      )) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 35,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 33,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { flex: 1, minWidth: 0 }, children }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 45,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 32,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 30,
    columnNumber: 5
  }, this);
}
function AdminDashboard() {
  const { toast, go } = useApp();
  const [status, setStatus] = useState({});
  const metrics = [
    { n: "4,521", l: "Total reports", c: "var(--blue)" },
    { n: "415", l: "Pending verification", c: "var(--warn)" },
    { n: "3,892", l: "Verified", c: "var(--ok)" },
    { n: "214", l: "Suspicious", c: "var(--danger)" },
    { n: "120", l: "Rejected", c: "var(--ink-3)" },
    { n: "99.98%", l: "System uptime", c: "var(--ok)" }
  ];
  const act = (id, kind) => {
    setStatus((s) => ({ ...s, [id]: kind }));
    const msg = { verify: ["ok", "Verified", "Verified"], reject: ["err", "Rejected", "Rejected"], flag: ["info", "Flagged", "Flagged for review"] }[kind];
    toast({ type: msg[0], title: `Report ${msg[1]}`, desc: `MN-${id} ${msg[2]}.` });
  };
  const rows = VERIFICATION_QUEUE.slice(0, 8);
  return /* @__PURE__ */ jsxDEV("div", { className: "stack", children: [
    /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }, children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "section-title", style: { margin: "4px 0 0" }, children: "Admin Panel" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 71,
          columnNumber: 14
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "cell-sub", children: "National operations & verification command centre" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 71,
          columnNumber: 90
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 71,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Badge, { s: "green", dot: true, children: "All systems operational" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 72,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 70,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "kpi-grid", style: { gridTemplateColumns: "repeat(3, 1fr)" }, children: metrics.map((m) => /* @__PURE__ */ jsxDEV(StatChip, { n: m.n, l: m.l, tone: m.c }, m.l, false, {
      fileName: "<stdin>",
      lineNumber: 75,
      columnNumber: 29
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 74,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "grid-2", style: { alignItems: "stretch" }, children: [
      /* @__PURE__ */ jsxDEV(Card, { title: "Data Ingestion", sub: "Reports per minute across all sources", children: /* @__PURE__ */ jsxDEV(LineChart, { labels: ["00", "03", "06", "09", "12", "15", "18", "21"], datasets: [{ label: "rpm", data: [38, 55, 42, 74, 88, 66, 50, 42], color: "#1a5fd0", fill: true }], height: 170 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 79,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 78,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Card, { title: "Ingestion Rate", sub: "Pipeline throughput", children: [
        /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-around", textAlign: "center" }, children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: 26, fontWeight: 800, fontFamily: "var(--mono)", color: "var(--ok)" }, children: "1,240" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 83,
              columnNumber: 18
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "cell-sub", children: "reports / min" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 83,
              columnNumber: 123
            }, this)
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 83,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(Ring, { value: 92, color: "#1a5fd0", children: /* @__PURE__ */ jsxDEV("text", { x: "50%", y: "52%", textAnchor: "middle", fontSize: "16", fontWeight: "700", fill: "var(--ink)", fontFamily: "JetBrains Mono", children: "92%" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 84,
            columnNumber: 46
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 84,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 82,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxDEV(StatChip, { n: "128 ms", l: "processing latency", tone: "var(--ok)" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 87,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(StatChip, { n: "1,842", l: "API reports", tone: "var(--blue)" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 88,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(StatChip, { n: "643", l: "citizen reports", tone: "var(--warn)" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 89,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 86,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 81,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 77,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Card, { title: "Verification Queue", sub: "Awaits operator review", pad: { b: 0 }, children: /* @__PURE__ */ jsxDEV("div", { className: "tb-wrap", children: /* @__PURE__ */ jsxDEV("table", { className: "data", children: [
      /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { children: [
        /* @__PURE__ */ jsxDEV("th", { children: "Report" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 96,
          columnNumber: 24
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Location" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 96,
          columnNumber: 39
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Event" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 96,
          columnNumber: 56
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Source" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 96,
          columnNumber: 70
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "AI Conf" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 96,
          columnNumber: 85
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Trust" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 96,
          columnNumber: 101
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Submitted" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 96,
          columnNumber: 115
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Status" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 96,
          columnNumber: 133
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Actions" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 96,
          columnNumber: 148
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 96,
        columnNumber: 20
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 96,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("tbody", { children: rows.map((r) => /* @__PURE__ */ jsxDEV("tr", { children: [
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV("span", { className: "cell-mono", children: r.id }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 100,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 100,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV("div", { className: "loco", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "c", children: r.city }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 101,
            columnNumber: 45
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "s", children: r.state }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 101,
            columnNumber: 80
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 101,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 101,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { children: r.event }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 102,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV(Badge, { s: "blue", children: r.source.short }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 103,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 103,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "mono", children: [
          r.conf,
          "%"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 104,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "mono", children: [
          r.trust,
          "%"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 105,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "cell-sub", children: [
          r.time,
          " IST"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 106,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV(StatusBadge, { st: status[r.id] || r.verdict }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 107,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 107,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV("span", { className: "btn-row", style: { display: "inline-flex", gap: 6 }, children: [
          /* @__PURE__ */ jsxDEV("button", { className: "btn icon-only sm", title: "View", onClick: () => go("report/" + r.id), children: /* @__PURE__ */ jsxDEV(Eye, { size: 14 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 110,
            columnNumber: 110
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 110,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "btn ok sm", title: "Verify", onClick: () => act(r.id, "verify"), children: /* @__PURE__ */ jsxDEV(Check, { size: 14 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 111,
            columnNumber: 104
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 111,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "btn danger sm", title: "Reject", onClick: () => act(r.id, "reject"), children: /* @__PURE__ */ jsxDEV(X, { size: 14 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 112,
            columnNumber: 108
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 112,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "btn sm", title: "Flag", onClick: () => act(r.id, "flag"), children: /* @__PURE__ */ jsxDEV(Flag, { size: 14 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 113,
            columnNumber: 97
          }, this) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 113,
            columnNumber: 23
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 109,
          columnNumber: 21
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 108,
          columnNumber: 19
        }, this)
      ] }, r.id, true, {
        fileName: "<stdin>",
        lineNumber: 99,
        columnNumber: 17
      }, this)) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 97,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 95,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 94,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 93,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 69,
    columnNumber: 5
  }, this);
}
function StatusBadge({ st }) {
  if (st === "verified") return /* @__PURE__ */ jsxDEV(Badge, { s: "green", dot: true, children: "Verified" }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 127,
    columnNumber: 33
  }, this);
  if (st === "rejected") return /* @__PURE__ */ jsxDEV(Badge, { s: "gray", dot: true, children: "Rejected" }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 128,
    columnNumber: 33
  }, this);
  if (st === "flagged") return /* @__PURE__ */ jsxDEV(Badge, { s: "purple", dot: true, children: "Flagged" }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 129,
    columnNumber: 32
  }, this);
  return /* @__PURE__ */ jsxDEV(Badge, { s: VERDICT[st], dot: true, children: cap(st) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 130,
    columnNumber: 10
  }, this);
}
function AdminVerification() {
  const { toast, go } = useApp();
  const [st, setSt] = useState({});
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQueue = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('weather_reports')
        .select('*')
        .order('id', { ascending: false });
      if (!error && data && data.length > 0) {
        setReports(data);
        if (manual) {
          toast({ type: "ok", title: "Live Admin Queue Synced", desc: `Loaded ${data.length} reports directly from database.` });
        }
      } else {
        setReports(VERIFICATION_QUEUE);
      }
    } catch (err) {
      console.warn("Failed to fetch admin verification queue:", err);
      setReports(VERIFICATION_QUEUE);
    } finally {
      setLoading(false);
      if (manual) setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(() => fetchQueue(false), 8000);
    let channel = null;
    try {
      channel = supabase
        .channel('admin-verification-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'weather_reports' }, () => {
          fetchQueue(false);
        })
        .subscribe();
    } catch (e) {
      console.warn("Channel error:", e);
    }

    return () => {
      clearInterval(interval);
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchQueue]);

  const act = async (item, kind) => {
    const rawId = item.id;
    setSt((s) => ({ ...s, [rawId]: kind }));
    const [t, msg] = { verify: ["ok", "Verified"], reject: ["err", "Rejected"], flag: ["info", "Flagged"] }[kind];
    toast({ type: t, title: `${msg} report`, desc: `Report #${rawId} updated in live database.` });

    try {
      let updatePayload = {};
      if (kind === 'verify') {
        updatePayload = { status: 'Verified', trust_score: 95 };
      } else if (kind === 'reject') {
        updatePayload = { status: 'Suspicious', trust_score: 20 };
      } else if (kind === 'flag') {
        updatePayload = { status: 'Pending', trust_score: 50 };
      }
      const { error } = await supabase
        .from('weather_reports')
        .update(updatePayload)
        .eq('id', rawId);

      if (!error) {
        fetchQueue(false);
      }
    } catch (e) {
      console.warn("Update error in admin queue:", e);
    }
  };

  const queueList = reports.length > 0 ? reports.map((r) => {
    if (r.event_type !== undefined) {
      const createdAt = r.created_at ? new Date(r.created_at) : new Date();
      const timeStr = createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const currentVerdict = st[r.id] ? (st[r.id] === 'verify' ? 'verified' : st[r.id] === 'reject' ? 'suspicious' : 'pending') : (r.status || 'Pending').toLowerCase();
      const trust = r.trust_score || 50;
      const conf = Math.min(99, Math.max(50, Math.round(trust * 1.05)));
      const isCitizen = !r.description || (!r.description.includes("Twitter") && !r.description.includes("News"));
      return {
        id: r.id,
        code: `REP-${String(r.id).padStart(4, '0')}`,
        city: r.city || 'Unknown',
        state: r.state || (r.area || 'India'),
        event: r.event_type || 'Weather Event',
        source: { short: isCitizen ? 'Citizen' : 'Radar', name: isCitizen ? 'Citizen Report' : 'Automated Feed' },
        conf,
        trust,
        dup: 0,
        time: timeStr,
        verdict: currentVerdict,
        isReal: true
      };
    }
    return {
      id: r.id,
      code: r.id,
      city: r.city,
      state: r.state,
      event: r.event,
      source: r.source || { short: 'IMD', name: 'IMD AWS' },
      conf: r.conf,
      trust: r.trust,
      dup: r.dup || 0,
      time: r.time,
      verdict: st[r.id] || (r.verdict || 'pending').toLowerCase(),
      isReal: false
    };
  }) : [];

  const verifiedCount = queueList.filter((q) => q.verdict === 'verified').length;
  const pendingCount = queueList.filter((q) => q.verdict === 'pending' || q.verdict === 'unverified').length;
  const suspiciousCount = queueList.filter((q) => q.verdict === 'suspicious' || q.verdict === 'rejected').length;

  return /* @__PURE__ */ jsxDEV("div", { className: "stack", children: [
    /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }, children: [
      /* @__PURE__ */ jsxDEV(SectionHead, {
        title: "Verification Queue",
        sub: `Awaiting operator decision — ${queueList.length} live reports synced with Supabase`
      }, void 0, false, { fileName: "<stdin>", lineNumber: 143, columnNumber: 7 }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
        /* @__PURE__ */ jsxDEV("button", {
          className: "btn ghost sm",
          onClick: () => fetchQueue(true),
          disabled: refreshing,
          style: { display: "inline-flex", alignItems: "center", gap: 6 },
          children: [
            /* @__PURE__ */ jsxDEV(RefreshCw, { size: 13, className: refreshing ? "spin" : "" }, void 0, false, { fileName: "<stdin>", lineNumber: 144, columnNumber: 20 }, this),
            refreshing ? "Syncing..." : "Sync Live"
          ]
        }, void 0, true, { fileName: "<stdin>", lineNumber: 144, columnNumber: 11 }, this),
        /* @__PURE__ */ jsxDEV(Badge, { s: "yellow", children: `${pendingCount} Pending` }, void 0, false, { fileName: "<stdin>", lineNumber: 145, columnNumber: 11 }, this),
        /* @__PURE__ */ jsxDEV(Badge, { s: "green", children: `${verifiedCount} Verified` }, void 0, false, { fileName: "<stdin>", lineNumber: 146, columnNumber: 11 }, this),
        /* @__PURE__ */ jsxDEV(Badge, { s: "red", children: `${suspiciousCount} Suspicious` }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 11 }, this)
      ] }, void 0, true, { fileName: "<stdin>", lineNumber: 144, columnNumber: 9 }, this)
    ] }, void 0, true, { fileName: "<stdin>", lineNumber: 142, columnNumber: 5 }, this),
    /* @__PURE__ */ jsxDEV(Card, { pad: { b: 0 }, children: /* @__PURE__ */ jsxDEV("div", { className: "tb-wrap", children: /* @__PURE__ */ jsxDEV("table", { className: "data", children: [
      /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { children: [
        /* @__PURE__ */ jsxDEV("th", { children: "Report" }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 24 }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Location" }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 39 }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Event" }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 56 }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Source" }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 70 }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Conf" }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 85 }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Trust" }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 98 }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Dup" }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 112 }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Submitted" }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 124 }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Status" }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 142 }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Actions" }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 157 }, this)
      ] }, void 0, true, { fileName: "<stdin>", lineNumber: 147, columnNumber: 20 }, this) }, void 0, false, { fileName: "<stdin>", lineNumber: 147, columnNumber: 13 }, this),
      /* @__PURE__ */ jsxDEV("tbody", { children: queueList.map((r) => /* @__PURE__ */ jsxDEV("tr", { children: [
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV("span", { className: "cell-mono", children: r.code }, void 0, false, { fileName: "<stdin>", lineNumber: 151, columnNumber: 23 }, this) }, void 0, false, { fileName: "<stdin>", lineNumber: 151, columnNumber: 19 }, this),
        /* @__PURE__ */ jsxDEV("td", { children: [
          /* @__PURE__ */ jsxDEV("strong", { children: r.city }, void 0, false, { fileName: "<stdin>", lineNumber: 152, columnNumber: 23 }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "cell-sub", children: r.state }, void 0, false, { fileName: "<stdin>", lineNumber: 152, columnNumber: 48 }, this)
        ] }, void 0, true, { fileName: "<stdin>", lineNumber: 152, columnNumber: 19 }, this),
        /* @__PURE__ */ jsxDEV("td", { children: r.event }, void 0, false, { fileName: "<stdin>", lineNumber: 153, columnNumber: 19 }, this),
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV(Badge, { s: r.source.short === "Citizen" ? "blue" : "purple", children: r.source.short }, void 0, false, { fileName: "<stdin>", lineNumber: 154, columnNumber: 23 }, this) }, void 0, false, { fileName: "<stdin>", lineNumber: 154, columnNumber: 19 }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "mono", children: [r.conf, "%"] }, void 0, true, { fileName: "<stdin>", lineNumber: 155, columnNumber: 19 }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "mono", children: [r.trust, "%"] }, void 0, true, { fileName: "<stdin>", lineNumber: 156, columnNumber: 19 }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "mono", style: { color: r.dup > 60 ? "var(--danger)" : "var(--ink-3)" }, children: [r.dup, "%"] }, void 0, true, { fileName: "<stdin>", lineNumber: 157, columnNumber: 19 }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "cell-sub", children: [r.time, " IST"] }, void 0, true, { fileName: "<stdin>", lineNumber: 158, columnNumber: 19 }, this),
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV(Badge, { s: VERDICT[r.verdict] || "yellow", dot: true, children: cap(r.verdict) }, void 0, false, { fileName: "<stdin>", lineNumber: 159, columnNumber: 23 }, this) }, void 0, false, { fileName: "<stdin>", lineNumber: 159, columnNumber: 19 }, this),
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV("span", { style: { display: "inline-flex", gap: 6 }, children: [
          /* @__PURE__ */ jsxDEV("button", { className: "btn sm", onClick: () => go("report/" + r.id), children: [
            /* @__PURE__ */ jsxDEV(Eye, { size: 13 }, void 0, false, { fileName: "<stdin>", lineNumber: 162, columnNumber: 87 }, this),
            " View"
          ] }, void 0, true, { fileName: "<stdin>", lineNumber: 162, columnNumber: 23 }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "btn ok sm", onClick: () => act(r, "verify"), children: [
            /* @__PURE__ */ jsxDEV(Check, { size: 13 }, void 0, false, { fileName: "<stdin>", lineNumber: 163, columnNumber: 89 }, this),
            " Verify"
          ] }, void 0, true, { fileName: "<stdin>", lineNumber: 163, columnNumber: 23 }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "btn danger sm", onClick: () => act(r, "reject"), children: [
            /* @__PURE__ */ jsxDEV(X, { size: 13 }, void 0, false, { fileName: "<stdin>", lineNumber: 164, columnNumber: 93 }, this),
            " Reject"
          ] }, void 0, true, { fileName: "<stdin>", lineNumber: 164, columnNumber: 23 }, this),
          /* @__PURE__ */ jsxDEV("button", { className: "btn sm", onClick: () => act(r, "flag"), children: [
            /* @__PURE__ */ jsxDEV(Flag, { size: 13 }, void 0, false, { fileName: "<stdin>", lineNumber: 165, columnNumber: 84 }, this),
            " Flag"
          ] }, void 0, true, { fileName: "<stdin>", lineNumber: 165, columnNumber: 23 }, this)
        ] }, void 0, true, { fileName: "<stdin>", lineNumber: 161, columnNumber: 21 }, this) }, void 0, false, { fileName: "<stdin>", lineNumber: 160, columnNumber: 19 }, this)
      ] }, r.id, true, { fileName: "<stdin>", lineNumber: 150, columnNumber: 17 }, this)) }, void 0, false, { fileName: "<stdin>", lineNumber: 148, columnNumber: 13 }, this)
    ] }, void 0, true, { fileName: "<stdin>", lineNumber: 146, columnNumber: 11 }, this) }, void 0, false, { fileName: "<stdin>", lineNumber: 145, columnNumber: 9 }, this) }, void 0, false, { fileName: "<stdin>", lineNumber: 144, columnNumber: 7 }, this)
  ] }, void 0, true, { fileName: "<stdin>", lineNumber: 142, columnNumber: 5 }, this);
}
function SourceManagement() {
  const { toast } = useApp();
  const [slist, setSlist] = useState(SOURCE_MONITOR);
  const typeColors = { API: "blue", Dataset: "purple", News: "gray", Social: "yellow", Citizen: "green" };
  return /* @__PURE__ */ jsxDEV("div", { className: "stack", children: [
    /* @__PURE__ */ jsxDEV(SectionHead, { title: "Source Management", sub: "Monitor and manage all data ingestion channels" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 184,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Card, { pad: { b: 0 }, children: /* @__PURE__ */ jsxDEV("div", { className: "tb-wrap", children: /* @__PURE__ */ jsxDEV("table", { className: "data", children: [
      /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { children: [
        /* @__PURE__ */ jsxDEV("th", { children: "Source" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 188,
          columnNumber: 24
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Type" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 188,
          columnNumber: 39
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Status" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 188,
          columnNumber: 52
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Last Sync" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 188,
          columnNumber: 67
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Reports" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 188,
          columnNumber: 85
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Reliability" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 188,
          columnNumber: 101
        }, this),
        /* @__PURE__ */ jsxDEV("th", { children: "Action" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 188,
          columnNumber: 121
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 188,
        columnNumber: 20
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 188,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("tbody", { children: slist.map((s) => /* @__PURE__ */ jsxDEV("tr", { children: [
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV("strong", { children: s.name }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 192,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 192,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV(Badge, { s: typeColors[s.type], children: s.type }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 193,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 193,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV(StatusDot, { st: s.status }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 194,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 194,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "cell-sub", children: s.lastSync }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 195,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { className: "mono", children: s.reports.toLocaleString() }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 196,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV(ReliabilityBar, { v: s.rel }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 197,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 197,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("td", { children: /* @__PURE__ */ jsxDEV("button", { className: "btn sm", onClick: () => toast({ type: "info", title: "Resync requested", desc: `${s.name} re-pull queued.` }), children: "Sync" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 198,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 198,
          columnNumber: 19
        }, this)
      ] }, s.name, true, {
        fileName: "<stdin>",
        lineNumber: 191,
        columnNumber: 17
      }, this)) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 189,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 187,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 186,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 185,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 183,
    columnNumber: 5
  }, this);
}
function ReliabilityBar({ v }) {
  const c = v >= 95 ? "#16a34a" : v >= 80 ? "#1a5fd0" : v >= 70 ? "#d97706" : "#dc2626";
  return /* @__PURE__ */ jsxDEV("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 }, children: [
    /* @__PURE__ */ jsxDEV("span", { className: "bar", style: { width: 60 }, children: /* @__PURE__ */ jsxDEV("span", { style: { width: `${v}%`, background: c } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 210,
      columnNumber: 125
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 210,
      columnNumber: 81
    }, this),
    /* @__PURE__ */ jsxDEV("span", { className: "mono", style: { fontSize: 12 }, children: [
      v,
      "%"
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 210,
      columnNumber: 182
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 210,
    columnNumber: 10
  }, this);
}
function StatusDot({ st }) {
  const tone = st === "online" ? "green" : st === "warn" ? "yellow" : "gray";
  const label = st === "online" ? "Online" : st === "warn" ? "Warning" : "Offline";
  return /* @__PURE__ */ jsxDEV(Badge, { s: tone, dot: true, children: label }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 215,
    columnNumber: 10
  }, this);
}
function SystemHealth() {
  const { toast } = useApp();
  const services = [
    { name: "Data Ingestion", icon: Radio, st: "online", meta: "1,240 / min" },
    { name: "Weather API Gateway", icon: Server, st: "online", meta: "98% uptime" },
    { name: "Processing Engine", icon: Gauge, st: "online", meta: "128 ms latency" },
    { name: "AI / ML Models", icon: ShieldCheck, st: "online", meta: "v3.2.1 \xB7 5 models" },
    { name: "PostgreSQL + PostGIS", icon: Database, st: "online", meta: "12 ms query" },
    { name: "Real-time Stream (Kafka)", icon: Waves, st: "warn", meta: "high lag \xB7 2.1 s" },
    { name: "Blob Storage", icon: HardDrive, st: "online", meta: "92% healthy" }
  ];
  return /* @__PURE__ */ jsxDEV("div", { className: "stack", children: [
    /* @__PURE__ */ jsxDEV(SectionHead, { title: "System Health", sub: "National platform infrastructure status" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 232,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "grid-4", style: { gridTemplateColumns: "repeat(4,1fr)" }, children: [["reports/min", "1,240", "var(--ok)"], ["processed", "4,52,100", "var(--blue)"], ["latency", "128 ms", "var(--warn)"], ["uptime", "99.98%", "var(--ok)"]].map(([l, v, c]) => /* @__PURE__ */ jsxDEV(Card, { pad: { t: 16, b: 16 }, children: /* @__PURE__ */ jsxDEV(StatChip, { n: v, l, tone: c }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 235,
      columnNumber: 48
    }, this) }, l, false, {
      fileName: "<stdin>",
      lineNumber: 235,
      columnNumber: 11
    }, this)) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 233,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "grid-2", style: { alignItems: "stretch" }, children: [
      /* @__PURE__ */ jsxDEV(Card, { title: "Service Status", sub: "Infrastructure components", children: /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", flexDirection: "column" }, children: services.map((sv) => /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px dashed var(--line)" }, children: [
        /* @__PURE__ */ jsxDEV("span", { className: "k-ic2", style: { width: 34, height: 34, borderRadius: 9, background: "var(--primary-soft)", color: "var(--primary)", display: "grid", placeItems: "center" }, children: /* @__PURE__ */ jsxDEV(sv.icon, { size: 16 }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 243,
          columnNumber: 191
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 243,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 600, fontSize: 13.5 }, children: sv.name }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 244,
            columnNumber: 42
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "cell-sub", children: sv.meta }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 244,
            columnNumber: 106
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 244,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV(Badge, { s: sv.tone === "online" ? "green" : "yellow", dot: true, children: sv.tone === "online" ? "Online" : sv.tone === "warn" ? "Warning" : "Offline" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 245,
          columnNumber: 17
        }, this)
      ] }, sv.name, true, {
        fileName: "<stdin>",
        lineNumber: 242,
        columnNumber: 15
      }, this)) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 240,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 239,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Card, { title: "Real-time Ingestion", sub: "Reports per minute \xB7 last 24 h", children: [
        /* @__PURE__ */ jsxDEV(LineChart, { labels: ["00", "06", "12", "18", "now"], datasets: [{ label: "rpm", data: [80, 62, 95, 88, 74], color: "#0ea5e9", fill: true }], height: 210 }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 251,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 12 }, children: [
          /* @__PURE__ */ jsxDEV(StatChip, { n: "1,240", l: "avg / min", tone: "var(--ok)" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 253,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(StatChip, { n: "4.2 s", l: "processing latency", tone: "var(--blue)" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 254,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(StatChip, { n: "2.1 s", l: "stream lag", tone: "var(--warn)" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 255,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 252,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("button", { className: "btn sm", style: { marginTop: 10 }, onClick: () => toast({ type: "info", title: "Health check", desc: "All critical services reachable." }), children: [
          /* @__PURE__ */ jsxDEV(Activity, { size: 14 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 257,
            columnNumber: 169
          }, this),
          " Run diagnostics"
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 257,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 250,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 238,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 231,
    columnNumber: 5
  }, this);
}
const Waves = ({ size }) => /* @__PURE__ */ jsxDEV("svg", { width: size || 16, height: size || 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
  /* @__PURE__ */ jsxDEV("path", { d: "M2 6c6 0 6 4 12 4s6-4 12-4" }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 263,
    columnNumber: 143
  }),
  /* @__PURE__ */ jsxDEV("path", { d: "M2 12c6 0 6 4 12 4s6-4 12-4" }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 263,
    columnNumber: 181
  }),
  /* @__PURE__ */ jsxDEV("path", { d: "M2 18c6 0 6 4 12 4s6-4 12-4" }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 263,
    columnNumber: 220
  })
] }, void 0, true, {
  fileName: "<stdin>",
  lineNumber: 263,
  columnNumber: 29
});
function SectionHead({ title, sub }) {
  return /* @__PURE__ */ jsxDEV("div", { children: [
    /* @__PURE__ */ jsxDEV("h2", { className: "section-title", style: { margin: "0 0 4px" }, children: title }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 266,
      columnNumber: 15
    }, this),
    /* @__PURE__ */ jsxDEV("p", { className: "cell-sub", children: sub }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 266,
      columnNumber: 87
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 266,
    columnNumber: 10
  }, this);
}
export {
  AdminDashboard,
  AdminLayout,
  AdminVerification,
  SourceManagement,
  SystemHealth
};
