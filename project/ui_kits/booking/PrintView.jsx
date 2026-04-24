// PrintView — live weekly grid preview (not just a placeholder).

function PrintView({ store }) {
  const [anchor, setAnchor] = React.useState(() => mondayOf(new Date()));
  const [checked, setChecked] = React.useState(new Set(ROOMS.slice(0, 3).map(r => r.id)));
  const [printRoomId, setPrintRoomId] = React.useState(null);

  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(anchor); d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const toggle = (id) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };
  const allRooms = () => setChecked(new Set(ROOMS.map(r => r.id)));
  const noRooms = () => setChecked(new Set());
  const shift = (off) => {
    const d = new Date(anchor); d.setDate(d.getDate() + off);
    setAnchor(d.toISOString().slice(0, 10));
  };

  const selectedRooms = ROOMS.filter(r => checked.has(r.id));
  const firstRoom = selectedRooms[0];
  const previewRoom = selectedRooms.find(r => r.id === printRoomId) || firstRoom;

  return (
    <>
      <div style={{
        background: "linear-gradient(135deg, #FBF6EF 0%, #F7F1EA 100%)",
        border: "1px solid #E8DDCD", borderRadius: 18, padding: "22px 26px",
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: "#FFE4D6",
          display: "grid", placeItems: "center", fontSize: 24,
        }}>🖨️</div>
        <div style={{ flex: "1 1 300px" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#22314F" }}>一週時間表列印</h1>
          <div style={{ fontSize: 13, color: "#6F7E99", marginTop: 4 }}>選一週 · 選課室 · 實時預覽 · 送出列印</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Button kind="outline" size="sm" onClick={() => shift(-7)}>← 上週</Button>
          <div style={{ textAlign: "center", padding: "6px 12px", background: "#fff", border: "1px solid #E8DDCD", borderRadius: 10, minWidth: 160 }}>
            <div style={{ fontSize: 10.5, color: "#93A0B6", fontWeight: 700, letterSpacing: ".06em" }}>WEEK OF</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#22314F" }}>{prettyRange(days)}</div>
          </div>
          <Button kind="outline" size="sm" onClick={() => shift(7)}>下週 →</Button>
          <Button onClick={() => window.print()}>🖨️ 列印</Button>
        </div>
      </div>

      {/* Room picker */}
      <Panel style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <h3 className="cks-h3">選擇要列印的課室</h3>
            <div style={{ fontSize: 12, color: "#6F7E99", marginTop: 2 }}>每間課室列印一頁。已選 {selectedRooms.length} 間。</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <Button kind="link" size="sm" onClick={allRooms}>全選</Button>
            <Button kind="link" size="sm" onClick={noRooms}>全不選</Button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ROOMS.map(r => {
            const on = checked.has(r.id);
            return (
              <label key={r.id} style={{
                border: on ? "1.5px solid #E86A4C" : "1px solid #E8DDCD",
                background: on ? "#FFE4D6" : "#fff",
                color: on ? "#C24E32" : "#4A5A7A",
                borderRadius: 10, padding: "8px 12px", fontSize: 13, fontWeight: 600,
                display: "inline-flex", gap: 6, alignItems: "center", cursor: "pointer",
                transition: "all 150ms ease",
              }}>
                <input type="checkbox" checked={on} onChange={() => toggle(r.id)} style={{ margin: 0 }}/>
                {safeName(r)}
              </label>
            );
          })}
        </div>
      </Panel>

      {/* Live preview */}
      <Panel style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 className="cks-h3">預覽</h3>
            <div style={{ fontSize: 12, color: "#6F7E99", marginTop: 2 }}>預覽當前選中的課室本週時間表</div>
          </div>
          {selectedRooms.length > 1 && (
            <div style={{ display: "flex", gap: 4, background: "#FBF6EF", padding: 3, borderRadius: 9, border: "1px solid #EFE4D3" }}>
              {selectedRooms.map(r => (
                <button key={r.id} onClick={() => setPrintRoomId(r.id)} style={{
                  border: 0, background: (previewRoom.id === r.id) ? "#fff" : "transparent",
                  color: (previewRoom.id === r.id) ? "#E86A4C" : "#4A5A7A",
                  boxShadow: (previewRoom.id === r.id) ? "0 1px 2px rgb(34 49 79 / 8%)" : "none",
                  padding: "5px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--cks-font-sans)",
                }}>{safeName(r)}</button>
              ))}
            </div>
          )}
        </div>

        {previewRoom ? (
          <WeekGrid room={previewRoom} days={days} records={store.records}/>
        ) : (
          <EmptyState emoji="📋" title="請至少選一間課室" hint="勾選上方的課室後即可預覽。"/>
        )}
      </Panel>
    </>
  );
}

function WeekGrid({ room, days, records }) {
  const relevant = records.filter(r => r.roomId === room.id && days.includes(r.date));
  const byDaySlot = {};
  for (const r of relevant) {
    const k = r.time.split(" ")[0]; // "第3節"
    byDaySlot[`${r.date}|${k}`] = r;
  }
  return (
    <div style={{
      border: "1px solid #E8DDCD", borderRadius: 12, overflow: "hidden",
      background: "#fff",
    }}>
      <div style={{
        background: "#22314F", color: "#fff", padding: "12px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#c8d0e0", letterSpacing: ".08em" }}>CKS ROOM BOOKING</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 1 }}>{safeName(room)} · 週時間表</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: "#c8d0e0" }}>
          {prettyRange(days)}
        </div>
      </div>
      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>
              <th style={gridH}>節次</th>
              {days.map(d => {
                const dt = new Date(d);
                const wd = "日一二三四五六"[dt.getDay()];
                return <th key={d} style={gridH}>週{wd}<div style={{ fontWeight: 400, fontSize: 10.5, color: "#93A0B6" }}>{d.slice(5)}</div></th>;
              })}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map(s => (
              <tr key={s.key}>
                <td style={{ ...gridC, background: "#FBF6EF", fontWeight: 700, color: "#22314F" }}>
                  {s.key}<div style={{ fontSize: 10.5, color: "#6F7E99", fontFamily: "var(--cks-font-mono)", fontWeight: 400 }}>{s.value}</div>
                </td>
                {days.map(d => {
                  const hit = byDaySlot[`${d}|${s.key}`];
                  return (
                    <td key={d} style={{
                      ...gridC, background: hit ? "#FFE4D6" : "#fff",
                      color: hit ? "#C24E32" : "#93A0B6",
                    }}>
                      {hit ? (
                        <>
                          <strong style={{ display: "block", fontSize: 12.5, color: "#22314F" }}>{hit.booker}</strong>
                          <span style={{ fontSize: 11 }}>{hit.purpose}</span>
                        </>
                      ) : <span style={{ fontSize: 11 }}>—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const gridH = { padding: "8px 10px", textAlign: "left", borderBottom: "1px solid #E8DDCD", background: "#FBF6EF", fontSize: 11.5, fontWeight: 700, color: "#22314F", letterSpacing: ".04em" };
const gridC = { padding: "10px 10px", borderBottom: "1px solid #EFE4D3", borderRight: "1px solid #EFE4D3", verticalAlign: "top", minHeight: 44 };

function mondayOf(d) {
  const x = new Date(d);
  const day = x.getDay();
  const off = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + off);
  return x.toISOString().slice(0, 10);
}
function prettyRange(days) {
  const a = new Date(days[0]), b = new Date(days[days.length - 1]);
  return `${a.getMonth()+1}/${a.getDate()} – ${b.getMonth()+1}/${b.getDate()}`;
}

Object.assign(window, { PrintView, WeekGrid });
