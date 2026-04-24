// Low-level UI primitives — modern, warm, humane.
// All style objects are component-scoped to avoid collisions.

/* -------- Panel (card) -------- */
function Panel({ children, style, className = "", bleed = false, tone = "default" }) {
  const tones = {
    default: { background: "#fff", border: "1px solid #E8DDCD" },
    cream:   { background: "#FBF6EF", border: "1px solid #EFE4D3" },
    ink:     { background: "#22314F", border: "1px solid #1a2640", color: "#fff" },
  };
  return (
    <article className={className} style={{
      ...tones[tone],
      borderRadius: 16, padding: bleed ? 0 : 20,
      boxShadow: "0 1px 0 rgb(34 49 79 / 3%)",
      ...style,
    }}>{children}</article>
  );
}

/* -------- Button -------- */
function Button({ kind = "primary", children, onClick, disabled, style, type = "button", size, iconOnly }) {
  const base = {
    border: 0, cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: 10,
    padding: iconOnly ? 8 : size === "sm" ? "6px 12px" : size === "lg" ? "12px 20px" : "9px 16px",
    fontWeight: 600, fontFamily: "var(--cks-font-sans)",
    fontSize: size === "sm" ? 13 : size === "lg" ? 15 : 14,
    whiteSpace: "nowrap",
    opacity: disabled ? 0.5 : 1,
    transition: "all 150ms cubic-bezier(.2,.6,.2,1)",
    display: "inline-flex", alignItems: "center", gap: 6,
  };
  const variants = {
    primary: { background: "#E86A4C", color: "#fff", boxShadow: "0 1px 0 #C24E32 inset, 0 4px 12px rgb(232 106 76 / 25%)" },
    dark:    { background: "#22314F", color: "#fff", boxShadow: "0 1px 0 #1a2640 inset" },
    green:   { background: "#2F9E5A", color: "#fff" },
    ghost:   { background: "transparent", color: "#fff", border: "1px solid rgb(255 255 255 / 35%)" },
    outline: { background: "#fff", color: "#22314F", border: "1px solid #E8DDCD" },
    "outline-light": { background: "transparent", color: "#fff", border: "1px solid rgb(255 255 255 / 35%)" },
    light:   { background: "#fff", color: "#22314F" },
    soft:    { background: "#FFE4D6", color: "#C24E32" },
    danger:  { background: "transparent", color: "#B03529", border: "1px solid #EEB3A9" },
    link:    { background: "transparent", color: "#E86A4C", padding: "4px 8px", fontWeight: 600 },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      style={{ ...base, ...variants[kind], ...style }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.filter = "brightness(1.04)")}
      onMouseLeave={e => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = "translateY(1px)")}
      onMouseUp={e => (e.currentTarget.style.transform = "")}
    >{children}</button>
  );
}

/* -------- SegBtn (segmented control pill) -------- */
function SegBtn({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      border: 0, padding: "7px 14px", borderRadius: 999, cursor: "pointer",
      background: active ? "#22314F" : "transparent",
      color: active ? "#fff" : "#4A5A7A",
      fontWeight: 600, fontSize: 13, fontFamily: "var(--cks-font-sans)",
      whiteSpace: "nowrap", transition: "all 150ms ease",
    }}>{children}</button>
  );
}

function SegGroup({ children }) {
  return (
    <div style={{
      display: "inline-flex", gap: 2, padding: 3,
      background: "#EFE4D3", borderRadius: 999, border: "1px solid #E8DDCD",
    }}>{children}</div>
  );
}

/* -------- Text input (with subtle focus ring) -------- */
function TextInput({ value, onChange, placeholder, type = "text", style, min, required, icon }) {
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{
          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
          fontSize: 14, color: "#93A0B6", pointerEvents: "none",
        }}>{icon}</span>
      )}
      <input type={type} value={value ?? ""} min={min} required={required}
        onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", border: "1px solid #D8CCBA", borderRadius: 10,
          padding: icon ? "11px 14px 11px 34px" : "11px 14px",
          background: "#fff", fontSize: 14, color: "#22314F",
          fontFamily: "var(--cks-font-sans)", outline: "none",
          transition: "all 150ms ease",
          ...style,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = "#E86A4C"; e.currentTarget.style.boxShadow = "0 0 0 4px #FFE4D6"; }}
        onBlur={e => { e.currentTarget.style.borderColor = "#D8CCBA"; e.currentTarget.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Select({ value, onChange, children, style }) {
  return (
    <select value={value} onChange={e => onChange?.(e.target.value)} style={{
      width: "100%", border: "1px solid #D8CCBA", borderRadius: 10, padding: "11px 14px",
      background: "#fff", fontSize: 14, color: "#22314F",
      fontFamily: "var(--cks-font-sans)", ...style,
    }}>{children}</select>
  );
}

/* -------- Misc atoms -------- */
function CountPill({ n, tone = "neutral" }) {
  const tones = {
    neutral: { bg: "#F1E6D8", fg: "#4A5A7A" },
    coral:   { bg: "#FFE4D6", fg: "#C24E32" },
    green:   { bg: "#DCF2E3", fg: "#1D6F3E" },
  };
  const t = tones[tone];
  return (
    <span style={{
      background: t.bg, color: t.fg, borderRadius: 999,
      padding: "2px 10px", fontSize: 11.5, fontWeight: 700,
      fontFamily: "var(--cks-font-sans)", minWidth: 22, textAlign: "center",
      display: "inline-block",
    }}>{n}</span>
  );
}

function EmptyState({ emoji, title, hint, action }) {
  return (
    <div style={{
      textAlign: "center", padding: "48px 20px",
      color: "#6F7E99",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 20, background: "#FFE4D6",
        display: "grid", placeItems: "center", fontSize: 30, margin: "0 auto 14px",
      }}>{emoji || "📭"}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: "#22314F", marginBottom: 4 }}>{title}</div>
      {hint && <div style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 320, margin: "0 auto 14px" }}>{hint}</div>}
      {action}
    </div>
  );
}

function EmptyRow({ cols, children, emoji = "📭" }) {
  return (
    <tr><td colSpan={cols} style={{ textAlign: "center", padding: "44px 0" }}>
      <div style={{ fontSize: 26, marginBottom: 6 }}>{emoji}</div>
      <div style={{ color: "#6F7E99", fontSize: 13 }}>{children}</div>
    </td></tr>
  );
}

/* -------- Logo mark (inline SVG — tiny) -------- */
function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="0" y="0" width="64" height="64" rx="16" fill="#FFE4D6"/>
      <path d="M16 16 L32 20 L48 16 L48 50 L32 54 L16 50 Z" fill="#fff" stroke="#22314F" strokeWidth="2.4" strokeLinejoin="round"/>
      <line x1="32" y1="20" x2="32" y2="54" stroke="#22314F" strokeWidth="2.4"/>
      <circle cx="50" cy="15" r="7.5" fill="#E86A4C" stroke="#fff" strokeWidth="2.2"/>
    </svg>
  );
}

/* -------- Avatar (name initial) -------- */
function Avatar({ name, size = 28, tone = "coral" }) {
  const initial = (name || "?").trim()[0]?.toUpperCase() || "?";
  const tones = {
    coral: { bg: "#FFE4D6", fg: "#C24E32" },
    ink:   { bg: "#22314F", fg: "#fff" },
    green: { bg: "#DCF2E3", fg: "#1D6F3E" },
    mist:  { bg: "#F1E6D8", fg: "#4A5A7A" },
  };
  const t = tones[tone];
  return (
    <span style={{
      width: size, height: size, borderRadius: size / 2.8,
      background: t.bg, color: t.fg, display: "inline-grid", placeItems: "center",
      fontWeight: 700, fontSize: Math.round(size * 0.46),
      fontFamily: "var(--cks-font-sans)", flexShrink: 0,
    }}>{initial}</span>
  );
}

function StatusDot({ tone = "ok" }) {
  const colors = { ok: "#2F9E5A", busy: "#D9443C", warn: "#D4A34A" };
  return <span style={{
    display: "inline-block", width: 8, height: 8, borderRadius: 4,
    background: colors[tone], boxShadow: `0 0 0 3px ${colors[tone]}22`,
  }}/>;
}

Object.assign(window, {
  Panel, Button, SegBtn, SegGroup, TextInput, Select,
  CountPill, EmptyState, EmptyRow, LogoMark, Avatar, StatusDot,
});
