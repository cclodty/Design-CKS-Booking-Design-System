// MyBookingsView — humane card list, personalised by current user if logged-in.

function MyBookingsView({ store }) {
  const [name, setName] = React.useState(store.currentUser || "");
  const [results, setResults] = React.useState(null);
  const [toast, setToast] = React.useState(null);
  const today = todayISO();

  const search = (q) => {
    const v = (q ?? name).trim().toLowerCase();
    if (!v) { setResults(null); return; }
    const rows = store.records
      .filter(r => r.date >= today && r.booker.toLowerCase() === v)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
    setResults({ q: v, rows });
  };

  const cancel = (r) => {
    if (!confirm(`確定取消「${r.date} ${r.time} · ${r.roomName}」這筆預約？`)) return;
    store.remove(r.id);
    setToast({ msg: "已取消預約", tone: "ok" });
    setTimeout(() => setToast(null), 2400);
    search();
  };

  return (
    <>
      <div style={{
        background: "linear-gradient(135deg, #FBF6EF 0%, #F7F1EA 100%)",
        border: "1px solid #E8DDCD", borderRadius: 18, padding: "22px 26px",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: "#FFE4D6",
          display: "grid", placeItems: "center", fontSize: 24, flexShrink: 0,
        }}>🕘</div>
        <div style={{ flex: "1 1 280px" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#22314F" }}>我的預約</h1>
          <div style={{ fontSize: 13, color: "#6F7E99", marginTop: 4 }}>輸入您預約時填寫的姓名，查看未來的預約。</div>
        </div>
        <form onSubmit={e => { e.preventDefault(); search(); }} style={{ display: "flex", gap: 8, flex: "0 0 auto" }}>
          <div style={{ width: 220 }}>
            <TextInput value={name} onChange={setName} placeholder="輸入預約人姓名" icon="👤"/>
          </div>
          <Button type="submit">🔎 查詢</Button>
        </form>
      </div>

      <div style={{ marginTop: 16 }}>
        {results === null && (
          <Panel>
            <EmptyState
              emoji="🔎"
              title="還沒開始查詢"
              hint="請在上方輸入您預約時填寫的姓名，再點擊查詢。"
            />
          </Panel>
        )}
        {results?.rows.length === 0 && (
          <Panel>
            <EmptyState
              emoji="📭"
              title="沒有未來預約"
              hint={`找不到「${results.q}」名下今天或之後的預約。確認姓名拼法是否正確？`}
            />
          </Panel>
        )}
        {results?.rows.length > 0 && (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 4px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#22314F" }}>{results.q} 的預約</span>
              <CountPill n={results.rows.length} tone="coral"/>
            </div>
            {results.rows.map(r => <BookingRow key={r.id} r={r} onCancel={() => cancel(r)}/>)}
          </div>
        )}
      </div>

      {toast && <FloatingToast {...toast}/>}
    </>
  );
}

function BookingRow({ r, onCancel }) {
  const d = new Date(r.date);
  const m = d.getMonth() + 1, day = d.getDate();
  const wd = "日一二三四五六"[d.getDay()];
  const isToday = r.date === todayISO();

  // cancel cutoff: can't cancel if date < today (but we filter that already). stub: always allow.
  return (
    <div style={{
      background: "#fff", border: "1px solid #E8DDCD", borderRadius: 14,
      padding: "14px 18px", display: "flex", alignItems: "center", gap: 18,
    }}>
      <div style={{ textAlign: "center", minWidth: 60, padding: "4px 0", borderRight: "1px solid #EFE4D3", paddingRight: 18 }}>
        <div style={{ fontSize: 10.5, color: isToday ? "#C24E32" : "#93A0B6", fontWeight: 700, letterSpacing: ".06em" }}>
          {isToday ? "今天" : `週${wd}`}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#22314F", lineHeight: 1 }}>{day}</div>
        <div style={{ fontSize: 11, color: "#6F7E99" }}>{m} 月</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
          <strong style={{ fontSize: 15, color: "#22314F" }}>{r.roomName}</strong>
          <span style={{ fontSize: 10.5, background: "#F1E6D8", color: "#4A5A7A", padding: "2px 8px", borderRadius: 999, fontWeight: 700 }}>
            {r.time.split(" ")[0]}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: "#6F7E99", fontFamily: "var(--cks-font-mono)" }}>{r.time.split(" ").slice(1).join(" ") || r.time}</div>
        <div style={{ fontSize: 13, color: "#4A5A7A", marginTop: 4 }}>用途：<span style={{ color: "#22314F" }}>{r.purpose}</span></div>
      </div>
      <div style={{ flex: "0 0 auto" }}>
        <Button kind="danger" size="sm" onClick={onCancel}>取消預約</Button>
      </div>
    </div>
  );
}

function FloatingToast({ msg, tone }) {
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: "#22314F", color: "#fff",
      padding: "10px 18px", borderRadius: 999, fontSize: 13.5, fontWeight: 600,
      boxShadow: "0 14px 40px rgb(34 49 79 / 28%)", zIndex: 200,
      fontFamily: "var(--cks-font-sans)",
      animation: "cks-toast 260ms cubic-bezier(.2,.6,.2,1)",
    }}>{tone === "warn" ? "⚠ " : "✓ "}{msg}</div>
  );
}

Object.assign(window, { MyBookingsView });
