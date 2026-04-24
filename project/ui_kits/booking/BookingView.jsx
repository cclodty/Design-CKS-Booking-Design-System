// BookingView — modern, humane redesign (v3).
// Structure:
//   1. Hero greeting card (time-of-day greeting + stats)
//   2. Date rail (7 days of chips + date picker)
//   3. Room grid (2-column cards with availability dot)
//   4. Timeline slot board (morning / afternoon bands with axis)
//   5. Custom time row
//   6. Right-side booking sheet (2-step) + toast + more-rooms dialog

function BookingView({ store }) {
  const [selectedDate, setSelectedDate] = React.useState(todayISO());
  const [selectedRoomId, setSelectedRoomId] = React.useState("120");
  const [pendingSlot, setPendingSlot] = React.useState(null);
  const [showMoreRooms, setShowMoreRooms] = React.useState(false);
  const [customStart, setCustomStart] = React.useState("");
  const [customEnd, setCustomEnd] = React.useState("");
  const [bookerName, setBookerName] = React.useState("");
  const [bookerPurpose, setBookerPurpose] = React.useState("");
  const [bookingType, setBookingType] = React.useState("單次預約（僅限選擇的單日）");
  const [toast, setToast] = React.useState(null);

  const showToast = (msg, tone = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2600);
  };

  const selectedRoom = ROOMS.find(r => r.id === selectedRoomId) || ROOMS[0];
  const hasConflict = (time) =>
    store.records.some(r => r.date === selectedDate && r.roomId === selectedRoomId && r.time === time);
  const conflictBookerOf = (time) => {
    const hit = store.records.find(r => r.date === selectedDate && r.roomId === selectedRoomId && r.time === time);
    return hit?.booker;
  };

  // availability per room for current date (for dot + count)
  const roomStats = React.useMemo(() => {
    const out = {};
    ROOMS.forEach(r => {
      const occupied = store.records.filter(x => x.date === selectedDate && x.roomId === r.id).length;
      out[r.id] = { occupied, total: SLOTS.length, free: SLOTS.length - occupied };
    });
    return out;
  }, [store.records, selectedDate]);

  const submit = () => {
    if (!bookerName.trim() || !bookerPurpose.trim()) {
      showToast("請填寫姓名與用途", "warn"); return;
    }
    if (hasConflict(pendingSlot)) {
      showToast("該時段剛被別人預約，請選擇其他時段", "warn");
      setPendingSlot(null); return;
    }
    store.add({
      id: `b_${Date.now()}`,
      date: selectedDate, roomId: selectedRoomId, roomName: safeName(selectedRoom),
      time: pendingSlot, booker: bookerName.trim(), purpose: bookerPurpose.trim(),
      type: bookingType,
    });
    setPendingSlot(null); setBookerPurpose("");
    showToast(`已預約 ${safeName(selectedRoom)} · ${pendingSlot}`, "ok");
  };

  const tryCustom = () => {
    if (!customStart || !customEnd || customStart >= customEnd) {
      showToast("請輸入有效的開始與結束時間", "warn"); return;
    }
    setPendingSlot(`${customStart}–${customEnd}`);
  };

  return (
    <>
      <HeroGreeting
        date={selectedDate} room={selectedRoom}
        stats={roomStats[selectedRoomId]}
        totalToday={store.records.filter(r => r.date === selectedDate).length}
      />

      <DateRail value={selectedDate} onChange={setSelectedDate} />

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16, marginTop: 16, alignItems: "start" }}>
        <RoomSidebar
          rooms={ROOMS}
          selectedId={selectedRoomId}
          onSelect={setSelectedRoomId}
          stats={roomStats}
          onMore={() => setShowMoreRooms(true)}
        />
        <Panel>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#22314F" }}>
                {safeName(selectedRoom)} <span style={{ color: "#93A0B6", fontWeight: 500, fontSize: 14 }}>· {formatFriendlyDate(selectedDate)}</span>
              </h3>
              <div style={{ fontSize: 13, color: "#6F7E99", marginTop: 4 }}>點一下可預約的節次，右側會打開預約表單。</div>
            </div>
            <Legend />
          </div>

          <TimelineBoard
            slots={SLOTS}
            conflictOf={hasConflict}
            conflictBookerOf={conflictBookerOf}
            selectedSlot={pendingSlot}
            onPick={setPendingSlot}
            isAdmin={store.adminLoggedIn}
          />

          <CustomTimeRow
            start={customStart} end={customEnd}
            onStart={setCustomStart} onEnd={setCustomEnd}
            onSubmit={tryCustom}
            roomName={safeName(selectedRoom)} date={selectedDate}
          />
        </Panel>
      </div>

      {pendingSlot && (
        <BookingSheet
          date={selectedDate} slot={pendingSlot} room={safeName(selectedRoom)}
          name={bookerName} onName={setBookerName}
          purpose={bookerPurpose} onPurpose={setBookerPurpose}
          type={bookingType} onType={setBookingType}
          onClose={() => setPendingSlot(null)}
          onSubmit={submit}
        />
      )}

      {showMoreRooms && (
        <MoreRoomsDialog
          rooms={ROOMS} stats={roomStats}
          selectedId={selectedRoomId}
          onSelect={id => { setSelectedRoomId(id); setShowMoreRooms(false); }}
          onClose={() => setShowMoreRooms(false)}
        />
      )}

      {toast && <Toast {...toast} />}
    </>
  );
}

/* ---------- Hero greeting ---------- */
function HeroGreeting({ date, room, stats, totalToday }) {
  const hour = new Date().getHours();
  const greet = hour < 6 ? "夜深了" : hour < 12 ? "早安" : hour < 18 ? "午安" : "晚安";
  return (
    <div style={{
      background: "linear-gradient(135deg, #FFE4D6 0%, #F7F1EA 60%, #FBF6EF 100%)",
      border: "1px solid #E8DDCD", borderRadius: 18, padding: "24px 26px",
      display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", right: -30, top: -30, width: 180, height: 180,
        background: "radial-gradient(circle, rgb(232 106 76 / 18%), transparent 60%)",
        pointerEvents: "none",
      }}/>
      <div style={{ flex: "1 1 340px", position: "relative" }}>
        <div style={{ fontSize: 12.5, color: "#C24E32", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 6 }}>
          {greet} · {formatFriendlyDate(date)}
        </div>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#22314F", lineHeight: 1.3 }}>
          今天想預約哪一間？
        </h1>
        <p style={{ margin: "6px 0 0", color: "#4A5A7A", fontSize: 14, maxWidth: 520 }}>
          選擇日期 → 挑課室 → 點節次 → 填資訊。三十秒完成。
        </p>
      </div>
      <div style={{
        display: "flex", gap: 10, flexWrap: "wrap",
        position: "relative",
      }}>
        <StatCard label="本室剩餘節次" value={stats?.free ?? "—"} total={stats?.total} tone="coral"/>
        <StatCard label="今日全校預約" value={totalToday} tone="ink"/>
      </div>
    </div>
  );
}

function StatCard({ label, value, total, tone = "coral" }) {
  const tones = {
    coral: { bg: "#fff", border: "#E8DDCD", accent: "#E86A4C" },
    ink:   { bg: "#22314F", border: "#22314F", accent: "#FFE4D6" },
  };
  const t = tones[tone];
  const isInk = tone === "ink";
  return (
    <div style={{
      background: t.bg, border: `1px solid ${t.border}`, borderRadius: 14,
      padding: "12px 16px", minWidth: 140,
    }}>
      <div style={{ fontSize: 11, color: isInk ? "#93A0B6" : "#93A0B6", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 4 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: isInk ? "#fff" : t.accent, lineHeight: 1 }}>{value}</div>
        {total != null && <div style={{ fontSize: 12, color: isInk ? "#93A0B6" : "#6F7E99" }}>/ {total}</div>}
      </div>
    </div>
  );
}

/* ---------- Date rail ---------- */
function DateRail({ value, onChange }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().slice(0, 10),
      day: d.getDate(), wd: "日一二三四五六"[d.getDay()],
      isToday: i === 0, isTomorrow: i === 1,
    };
  });
  return (
    <div style={{
      marginTop: 14, display: "flex", alignItems: "center", gap: 8,
      padding: "10px 12px", background: "#fff",
      border: "1px solid #E8DDCD", borderRadius: 14,
    }}>
      <div style={{ fontSize: 12, color: "#6F7E99", padding: "0 6px", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>日期</div>
      <div style={{ display: "flex", gap: 6, flex: 1, overflowX: "auto" }}>
        {days.map(d => {
          const active = d.iso === value;
          return (
            <button key={d.iso} onClick={() => onChange(d.iso)} style={{
              border: active ? "1px solid #E86A4C" : "1px solid transparent",
              background: active ? "#FFE4D6" : "transparent",
              color: active ? "#C24E32" : "#22314F",
              borderRadius: 10, padding: "6px 10px", cursor: "pointer",
              fontFamily: "var(--cks-font-sans)", minWidth: 58,
              display: "grid", justifyItems: "center", gap: 1,
              transition: "all 150ms ease",
            }}>
              <span style={{ fontSize: 10.5, color: active ? "#C24E32" : "#6F7E99", fontWeight: 600 }}>週{d.wd}</span>
              <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{d.day}</span>
              {d.isToday && <span style={{ fontSize: 9, color: active ? "#C24E32" : "#93A0B6", fontWeight: 700 }}>今天</span>}
              {d.isTomorrow && !active && <span style={{ fontSize: 9, color: "#93A0B6", fontWeight: 700 }}>明天</span>}
              {d.isTomorrow && active && <span style={{ fontSize: 9, color: "#C24E32", fontWeight: 700 }}>明天</span>}
            </button>
          );
        })}
      </div>
      <div style={{ width: 150, borderLeft: "1px solid #EFE4D3", paddingLeft: 10 }}>
        <TextInput type="date" value={value} onChange={onChange} min={todayISO()} />
      </div>
    </div>
  );
}

/* ---------- Room sidebar (2-col grid of cards) ---------- */
function RoomSidebar({ rooms, selectedId, onSelect, stats, onMore }) {
  const top = rooms.slice(0, 4);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ fontSize: 12, color: "#6F7E99", padding: "0 6px", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>課室</div>
      {top.map(r => {
        const s = stats[r.id];
        const active = r.id === selectedId;
        const tone = s?.free === 0 ? "busy" : s?.free <= 2 ? "warn" : "ok";
        return (
          <button key={r.id} onClick={() => onSelect(r.id)} style={{
            textAlign: "left", background: active ? "#22314F" : "#fff",
            border: active ? "1px solid #22314F" : "1px solid #E8DDCD",
            borderRadius: 14, padding: "14px 16px", cursor: "pointer",
            display: "grid", gap: 8, position: "relative",
            color: active ? "#fff" : "#22314F",
            transition: "all 150ms ease",
            boxShadow: active ? "0 8px 24px rgb(34 49 79 / 15%)" : "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 10.5, color: active ? "#FFE4D6" : "#93A0B6", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
                {r.label}
              </div>
              <StatusDot tone={tone}/>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.15 }}>{safeName(r)}</div>
            <div style={{ fontSize: 12, color: active ? "#cfd9f5" : "#6F7E99" }}>
              {s?.free}/{s?.total} 節可預約
            </div>
          </button>
        );
      })}
      <button onClick={onMore} style={{
        border: "1px dashed #D8CCBA", background: "transparent",
        color: "#4A5A7A", padding: "12px", borderRadius: 12,
        fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "var(--cks-font-sans)",
      }}>＋ 更多課室 / 功能室</button>
    </div>
  );
}

/* ---------- Legend ---------- */
function Legend() {
  const item = (tone, label) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#6F7E99" }}>
      <StatusDot tone={tone}/>{label}
    </span>
  );
  return (
    <div style={{ display: "flex", gap: 14 }}>
      {item("ok", "可預約")}
      {item("busy", "已預約")}
    </div>
  );
}

/* ---------- Timeline board (morning / afternoon bands) ---------- */
function TimelineBoard({ slots, conflictOf, conflictBookerOf, selectedSlot, onPick, isAdmin }) {
  const morning = slots.slice(0, 5);
  const afternoon = slots.slice(5);
  return (
    <div style={{ display: "grid", gap: 14, marginTop: 4 }}>
      <SlotBand title="上午" subtitle="08:30 – 12:20" slots={morning}
        conflictOf={conflictOf} conflictBookerOf={conflictBookerOf}
        selectedSlot={selectedSlot} onPick={onPick} isAdmin={isAdmin} />
      <SlotBand title="下午" subtitle="14:00 – 16:15" slots={afternoon}
        conflictOf={conflictOf} conflictBookerOf={conflictBookerOf}
        selectedSlot={selectedSlot} onPick={onPick} isAdmin={isAdmin} />
    </div>
  );
}

function SlotBand({ title, subtitle, slots, conflictOf, conflictBookerOf, selectedSlot, onPick, isAdmin }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8, paddingLeft: 2 }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: "#22314F", letterSpacing: ".04em" }}>{title}</div>
        <div style={{ fontSize: 11, color: "#93A0B6", fontFamily: "var(--cks-font-mono)" }}>{subtitle}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${slots.length}, minmax(0,1fr))`, gap: 8 }}>
        {slots.map(s => {
          const t = `${s.key} ${s.value}`;
          const conflicted = conflictOf(t);
          const picked = selectedSlot === t;
          const bk = conflicted ? conflictBookerOf(t) : null;
          return (
            <SlotCardV3 key={s.key} slot={s} token={t}
              conflicted={conflicted} picked={picked}
              booker={bk} showBooker={isAdmin}
              onClick={() => onPick(t)}
            />
          );
        })}
      </div>
    </div>
  );
}

function SlotCardV3({ slot, token, conflicted, picked, booker, showBooker, onClick }) {
  const state = picked ? "picked" : conflicted ? "busy" : "free";
  const skin = {
    free:   { bg: "#fff", border: "#E8DDCD", fg: "#22314F", dot: "ok" },
    picked: { bg: "#FFE4D6", border: "#E86A4C", fg: "#C24E32", dot: "warn" },
    busy:   { bg: "#FDF4F2", border: "#F1D5CE", fg: "#93A0B6", dot: "busy" },
  }[state];
  return (
    <button disabled={conflicted} onClick={onClick} style={{
      background: skin.bg, border: `1px solid ${skin.border}`, color: skin.fg,
      borderRadius: 12, padding: "12px 10px 10px",
      cursor: conflicted ? "not-allowed" : "pointer",
      display: "grid", gap: 6, textAlign: "left",
      fontFamily: "var(--cks-font-sans)",
      transition: "all 150ms cubic-bezier(.2,.6,.2,1)",
      transform: picked ? "translateY(-2px)" : "none",
      boxShadow: picked ? "0 10px 24px rgb(232 106 76 / 22%)" : "none",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".02em" }}>{slot.key}</span>
        <StatusDot tone={skin.dot}/>
      </div>
      <div style={{ fontSize: 10.5, fontFamily: "var(--cks-font-mono)", color: conflicted ? "#c3a9a2" : "#6F7E99", letterSpacing: ".02em" }}>
        {slot.value}
      </div>
      {picked && (
        <div style={{ fontSize: 11, fontWeight: 700, color: "#C24E32", marginTop: 2 }}>✓ 已選 · 填資訊</div>
      )}
      {conflicted && !picked && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
          {showBooker && booker && <Avatar name={booker} size={18} tone="mist"/>}
          <span style={{ fontSize: 10.5, fontWeight: 600, color: "#B03529" }}>
            {showBooker && booker ? booker : "已預約"}
          </span>
        </div>
      )}
    </button>
  );
}

/* ---------- Custom time ---------- */
function CustomTimeRow({ start, end, onStart, onEnd, onSubmit, roomName, date }) {
  const preview = start && end && start < end
    ? `${formatFriendlyDate(date)}　·　${roomName}　${start} – ${end}`
    : "選擇開始與結束時間";
  return (
    <div style={{
      marginTop: 18, padding: "14px 16px", background: "#FBF6EF",
      border: "1px dashed #D8CCBA", borderRadius: 14,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#22314F" }}>🕘 跨節或自訂時間</div>
        <div style={{ fontSize: 11.5, color: "#93A0B6" }}>適合活動、會議、連堂補課</div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#4A5A7A" }}>從</span>
          <div style={{ width: 120 }}><TextInput type="time" value={start} onChange={onStart} /></div>
          <span style={{ fontSize: 13, color: "#4A5A7A" }}>到</span>
          <div style={{ width: 120 }}><TextInput type="time" value={end} onChange={onEnd} /></div>
        </div>
        <div style={{
          flex: 1, minWidth: 200, fontSize: 12, color: "#6F7E99",
          fontStyle: "italic", padding: "0 6px",
        }}>{preview}</div>
        <Button onClick={onSubmit}>📩 送出預約</Button>
      </div>
    </div>
  );
}

/* ---------- Right-side booking sheet ---------- */
function BookingSheet({ date, slot, room, name, onName, purpose, onPurpose, type, onType, onClose, onSubmit }) {
  const [step, setStep] = React.useState(1);
  const next = (e) => {
    e.preventDefault();
    if (step === 1) { if (!name.trim()) return; setStep(2); return; }
    onSubmit();
  };
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgb(34 49 79 / 45%)",
      zIndex: 100, display: "flex", justifyContent: "flex-end",
      animation: "cks-fade 150ms ease",
    }}>
      <form onClick={e => e.stopPropagation()} onSubmit={next} style={{
        width: "min(440px, 100vw)", background: "#fff", height: "100%",
        display: "flex", flexDirection: "column",
        boxShadow: "-20px 0 60px rgb(34 49 79 / 24%)",
        animation: "cks-slide 260ms cubic-bezier(.2,.6,.2,1)",
      }}>
        <header style={{ padding: "18px 22px 16px", borderBottom: "1px solid #E8DDCD" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, background: "#FFE4D6",
                display: "grid", placeItems: "center", fontSize: 16,
              }}>📩</div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#22314F" }}>送出預約</h3>
            </div>
            <button type="button" onClick={onClose} aria-label="關閉" style={{
              background: "transparent", border: 0, cursor: "pointer",
              fontSize: 16, color: "#6F7E99", padding: 6,
            }}>✕</button>
          </div>
          <StepBar step={step}/>
        </header>

        <div style={{ padding: 22, overflow: "auto", flex: 1, display: "grid", gap: 16 }}>
          <SummaryCard date={date} slot={slot} room={room}/>
          {step === 1 && (
            <>
              <Field label="您的姓名" hint="預約記錄會以此名稱儲存，用於查詢與取消。">
                <TextInput value={name} onChange={onName} placeholder="例如：王小明" required />
              </Field>
              <Field label="預約類型">
                <Select value={type} onChange={onType}>
                  <option>單次預約（僅限選擇的單日）</option>
                  <option>每週重複（至學期末）</option>
                  <option>指定多個日期</option>
                </Select>
              </Field>
            </>
          )}
          {step === 2 && (
            <>
              <Field label="用途 / 備註" hint="讓管理員了解此時段的使用情形。">
                <TextInput value={purpose} onChange={onPurpose} placeholder="例如：學會會議、補課、家長會" required />
              </Field>
              <div>
                <div style={{ fontSize: 11.5, color: "#93A0B6", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 8 }}>快速選取</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["學會會議", "補課", "家長會", "活動籌備", "社團排練"].map(p => (
                    <button key={p} type="button" onClick={() => onPurpose(p)} style={{
                      border: "1px solid #E8DDCD", background: "#fff",
                      borderRadius: 999, padding: "6px 12px", fontSize: 12.5, color: "#4A5A7A",
                      cursor: "pointer", fontFamily: "var(--cks-font-sans)", fontWeight: 500,
                    }}>{p}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <footer style={{ padding: "14px 22px", borderTop: "1px solid #E8DDCD", display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center", background: "#FBF6EF" }}>
          {step === 2
            ? <Button kind="link" type="button" onClick={() => setStep(1)}>← 上一步</Button>
            : <span style={{ fontSize: 12, color: "#93A0B6" }}>步驟 {step} / 2</span>}
          <Button type="submit" size="lg">{step === 1 ? "下一步 →" : "確認送出 ✓"}</Button>
        </footer>
      </form>
    </div>
  );
}

function StepBar({ step }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2].map(i => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 999,
          background: i <= step ? "#E86A4C" : "#EFE4D3",
          transition: "background 200ms ease",
        }}/>
      ))}
    </div>
  );
}

function SummaryCard({ date, slot, room }) {
  return (
    <div style={{
      background: "#FBF6EF", border: "1px solid #EFE4D3", borderRadius: 14,
      padding: "14px 16px", display: "grid", gap: 8, fontSize: 13.5,
    }}>
      <div style={{ fontSize: 11, color: "#C24E32", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>預約摘要</div>
      <SummaryRow k="日期" v={formatFriendlyDate(date)}/>
      <SummaryRow k="時段" v={slot}/>
      <SummaryRow k="課室" v={room}/>
    </div>
  );
}
function SummaryRow({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#6F7E99", fontSize: 12.5 }}>{k}</span>
      <strong style={{ color: "#22314F" }}>{v}</strong>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#22314F" }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 11.5, color: "#93A0B6", lineHeight: 1.5 }}>{hint}</span>}
    </label>
  );
}

/* ---------- More rooms dialog ---------- */
function MoreRoomsDialog({ rooms, stats, selectedId, onSelect, onClose }) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const list = rooms.filter(r => {
    const catOk = filter === "all" || r.category === filter;
    const q = query.toLowerCase();
    return catOk && `${r.id} ${safeName(r)}`.toLowerCase().includes(q);
  });
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgb(34 49 79 / 45%)",
      zIndex: 100, display: "grid", placeItems: "center", padding: 20,
      animation: "cks-fade 150ms ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "min(560px, 100%)", background: "#fff", borderRadius: 18,
        boxShadow: "0 30px 80px rgb(34 49 79 / 32%)", overflow: "hidden",
      }}>
        <header style={{ padding: "16px 22px", borderBottom: "1px solid #E8DDCD", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>選擇課室 / 功能室</h3>
          <button type="button" onClick={onClose} style={{ background: "transparent", border: 0, cursor: "pointer", fontSize: 18, color: "#6F7E99" }}>✕</button>
        </header>
        <div style={{ padding: 20, display: "grid", gap: 12 }}>
          <TextInput value={query} onChange={setQuery} placeholder="輸入名稱或室號搜尋..." icon="🔍"/>
          <SegGroup>
            <SegBtn active={filter === "all"} onClick={() => setFilter("all")}>全部 {rooms.length}</SegBtn>
            <SegBtn active={filter === "classroom"} onClick={() => setFilter("classroom")}>課室</SegBtn>
            <SegBtn active={filter === "special"} onClick={() => setFilter("special")}>功能室</SegBtn>
          </SegGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 360, overflow: "auto" }}>
            {list.map(r => {
              const s = stats[r.id];
              const active = r.id === selectedId;
              const tone = s?.free === 0 ? "busy" : s?.free <= 2 ? "warn" : "ok";
              return (
                <button key={r.id} onClick={() => onSelect(r.id)} style={{
                  border: active ? "1px solid #E86A4C" : "1px solid #E8DDCD",
                  background: active ? "#FFE4D6" : "#fff",
                  borderRadius: 12, padding: "12px 14px",
                  textAlign: "left", cursor: "pointer", display: "grid", gap: 4,
                  fontFamily: "var(--cks-font-sans)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: 14, color: "#22314F" }}>{safeName(r)}</strong>
                    <StatusDot tone={tone}/>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#6F7E99" }}>{r.label} · {s?.free}/{s?.total} 節可預約</div>
                </button>
              );
            })}
            {list.length === 0 && (
              <div style={{ gridColumn: "1 / -1", color: "#93A0B6", textAlign: "center", padding: 24, fontSize: 13 }}>沒有符合條件的課室</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Toast ---------- */
function Toast({ msg, tone }) {
  const bg = tone === "warn" ? "#FCEAE6" : "#22314F";
  const br = tone === "warn" ? "#EEB3A9" : "#22314F";
  const fg = tone === "warn" ? "#B03529" : "#fff";
  const icon = tone === "warn" ? "⚠" : "✓";
  return (
    <div style={{
      position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
      background: bg, border: `1px solid ${br}`, color: fg,
      padding: "11px 18px", borderRadius: 999, fontSize: 13.5, fontWeight: 600,
      boxShadow: "0 14px 40px rgb(34 49 79 / 28%)", zIndex: 200,
      fontFamily: "var(--cks-font-sans)",
      animation: "cks-toast 260ms cubic-bezier(.2,.6,.2,1)",
      display: "inline-flex", alignItems: "center", gap: 8,
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: 11,
        background: tone === "warn" ? "#B03529" : "#E86A4C",
        color: "#fff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 800,
      }}>{icon}</span>
      {msg}
    </div>
  );
}

function formatFriendlyDate(iso) {
  const d = new Date(iso);
  const today = todayISO();
  const tomorrow = (() => { const x = new Date(); x.setDate(x.getDate() + 1); return x.toISOString().slice(0, 10); })();
  const wd = "日一二三四五六"[d.getDay()];
  const m = d.getMonth() + 1, day = d.getDate();
  const prefix = iso === today ? "今天 · " : iso === tomorrow ? "明天 · " : "";
  return `${prefix}${m}月${day}日（週${wd}）`;
}

Object.assign(window, { BookingView, formatFriendlyDate });
