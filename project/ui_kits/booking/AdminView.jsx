// AdminView — modern, with stat cards, filter bar, and clean table.

function AdminView({ store }) {
  const [tab, setTab] = React.useState("records");
  const [filterRoom, setFilterRoom] = React.useState("all");
  const [q, setQ] = React.useState("");
  const today = todayISO();

  const upcoming = store.records
    .filter(r => r.date >= today)
    .filter(r => filterRoom === "all" || r.roomId === filterRoom)
    .filter(r => !q || `${r.booker}${r.purpose}${r.roomName}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));

  const stats = {
    total: store.records.filter(r => r.date >= today).length,
    today: store.records.filter(r => r.date === today).length,
    rooms: new Set(store.records.filter(r => r.date >= today).map(r => r.roomId)).size,
    people: new Set(store.records.filter(r => r.date >= today).map(r => r.booker)).size,
  };

  const del = (id) => { if (confirm("確定刪除這筆預約？")) store.remove(id); };
  const exportCsv = () => {
    const header = ["日期", "時間", "課室", "預約人", "用途"];
    const csv = [header.join(","), ...upcoming.map(r => [r.date, r.time, r.roomName, r.booker, r.purpose].join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "booking_records.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #22314F 0%, #2d3f63 100%)",
        color: "#fff", borderRadius: 18, padding: "22px 26px",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: "rgb(255 255 255 / 12%)",
          display: "grid", placeItems: "center", fontSize: 24,
        }}>🛠</div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>管理後台</h1>
          <div style={{ fontSize: 13, color: "#c8d0e0", marginTop: 4 }}>管理未來的所有預約、帳戶與權限</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button kind="outline-light" onClick={() => store.refresh()}>⟳ 重新整理</Button>
          <Button kind="light" onClick={exportCsv}>⬇ 匯出 CSV</Button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 14 }}>
        <StatCard label="未來預約" value={stats.total} accent="#E86A4C" icon="📅"/>
        <StatCard label="今日預約" value={stats.today} accent="#2F9E5A" icon="🗓"/>
        <StatCard label="使用中課室" value={stats.rooms} accent="#22314F" icon="🚪"/>
        <StatCard label="預約人數" value={stats.people} accent="#4A5A7A" icon="👥"/>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginTop: 18, background: "#FBF6EF", padding: 4, borderRadius: 12, border: "1px solid #EFE4D3", width: "fit-content" }}>
        <AdminTab active={tab === "records"} onClick={() => setTab("records")}>📝 預約記錄</AdminTab>
        <AdminTab active={tab === "accounts"} onClick={() => setTab("accounts")}>👥 帳戶管理</AdminTab>
      </div>

      {tab === "records" && (
        <Panel style={{ marginTop: 12 }}>
          {/* Filter bar */}
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: "1 1 220px", minWidth: 200 }}>
              <TextInput value={q} onChange={setQ} placeholder="搜尋姓名、用途、課室..." icon="🔎"/>
            </div>
            <div style={{ flex: "0 0 200px" }}>
              <Select value={filterRoom} onChange={setFilterRoom}>
                <option value="all">所有課室</option>
                {ROOMS.map(r => <option key={r.id} value={r.id}>{safeName(r)}</option>)}
              </Select>
            </div>
            <CountPill n={upcoming.length} tone="coral"/>
          </div>

          {upcoming.length === 0 ? (
            <EmptyState emoji="📭" title="沒有未來預約" hint="切換篩選條件或等新的預約送出。"/>
          ) : (
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  {["日期", "時間", "課室 / 功能室", "預約人", "用途", ""].map((h, i) => (
                    <th key={i} style={{
                      textAlign: "left", padding: "10px 12px", fontSize: 11.5,
                      color: "#6F7E99", fontWeight: 700, letterSpacing: ".06em",
                      textTransform: "uppercase", borderBottom: "1px solid #E8DDCD",
                      background: "#FBF6EF",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcoming.map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #EFE4D3" }}>
                    <td style={tdS}>{r.date}</td>
                    <td style={tdS}>
                      <span style={{ fontSize: 11, padding: "2px 7px", background: "#F1E6D8", borderRadius: 6, color: "#4A5A7A", fontWeight: 700, marginRight: 6 }}>
                        {r.time.split(" ")[0]}
                      </span>
                      <span style={{ fontFamily: "var(--cks-font-mono)", fontSize: 12.5, color: "#6F7E99" }}>{r.time.split(" ").slice(1).join(" ")}</span>
                    </td>
                    <td style={tdS}><strong>{r.roomName}</strong></td>
                    <td style={tdS}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <Avatar name={r.booker} size={22} tone="coral"/>
                        {r.booker}
                      </span>
                    </td>
                    <td style={{ ...tdS, color: "#4A5A7A" }}>{r.purpose}</td>
                    <td style={tdS}><Button kind="danger" size="sm" onClick={() => del(r.id)}>刪除</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
      )}

      {tab === "accounts" && (
        <Panel style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 14 }}>
            <h2 className="cks-h2">帳戶管理</h2>
            <p style={{ color: "#6F7E99", fontSize: 13, margin: "4px 0 0" }}>後續可接 Firebase Authentication。</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 180px auto", gap: 10, marginBottom: 16 }}>
            <TextInput placeholder="輸入管理員帳號" icon="👤"/>
            <TextInput type="password" placeholder="密碼" icon="🔒"/>
            <Select value="一般管理員" onChange={() => {}}>
              <option>一般管理員</option><option>超級管理員</option>
            </Select>
            <Button>新增帳戶</Button>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              { name: "cc***n", role: "超級管理員", locked: true },
              { name: "jessi（您）", role: "一般管理員", locked: false },
              { name: "moses", role: "一般管理員", locked: true },
            ].map(u => (
              <div key={u.name} style={{
                display: "flex", alignItems: "center", gap: 12,
                border: "1px solid #E8DDCD", borderRadius: 12, padding: "10px 14px", background: "#fff",
              }}>
                <Avatar name={u.name} size={32} tone="ink"/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#22314F", fontSize: 14 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "#6F7E99" }}>{u.role}</div>
                </div>
                <Button kind="outline" size="sm" disabled={u.locked}>{u.locked ? "無權限修改" : "編輯"}</Button>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </>
  );
}

const tdS = { padding: "12px 12px", fontSize: 13.5, color: "#22314F", verticalAlign: "middle" };

function AdminTab({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      border: 0, background: active ? "#fff" : "transparent",
      color: active ? "#E86A4C" : "#4A5A7A",
      boxShadow: active ? "0 1px 2px rgb(34 49 79 / 8%)" : "none",
      padding: "8px 14px", borderRadius: 9, cursor: "pointer",
      fontWeight: 600, fontSize: 13.5, fontFamily: "var(--cks-font-sans)",
      whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function StatCard({ label, value, accent, icon }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E8DDCD", borderRadius: 14,
      padding: "14px 16px", display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: `${accent}18`,
        display: "grid", placeItems: "center", fontSize: 18,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 11.5, color: "#6F7E99", fontWeight: 600, letterSpacing: ".03em" }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1.1, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminView, AdminTab, StatCard });
