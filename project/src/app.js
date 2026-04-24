/* =========================================================
   CKS Booking App — Part 1: Data, Store, Render helpers
   ========================================================= */

const ROOMS = [
  { id: "120",       name: null,      category: "classroom", label: "課室" },
  { id: "219",       name: null,      category: "classroom", label: "課室" },
  { id: "320",       name: null,      category: "classroom", label: "課室" },
  { id: "library-a", name: "圖書館A", category: "special",   label: "功能室" },
  { id: "library-b", name: "圖書館B", category: "special",   label: "功能室" },
  { id: "music",     name: "音樂室",  category: "special",   label: "功能室" },
  { id: "art",       name: "美術室",  category: "special",   label: "功能室" }
];

const SLOTS = [
  { key: "第1節", value: "08:30–09:10", band: "morning" },
  { key: "第2節", value: "09:20–10:00", band: "morning" },
  { key: "第3節", value: "10:05–10:45", band: "morning" },
  { key: "第4節", value: "10:50–11:35", band: "morning" },
  { key: "第5節", value: "11:40–12:20", band: "morning" },
  { key: "第6節", value: "14:00–14:40", band: "afternoon" },
  { key: "第7節", value: "14:45–15:30", band: "afternoon" },
  { key: "第8節", value: "15:35–16:15", band: "afternoon" }
];

const QUICK_PURPOSES = ["學會會議", "補課", "家長會", "社團活動", "教師備課", "學科競賽", "才藝訓練", "特別活動"];

const STORAGE_KEY = "cks_booking_mock_records_v2";
const today = new Date().toISOString().slice(0, 10);

// ===== STATE =====
const state = {
  selectedDate: today,
  selectedRoomId: "120",
  selectedSlot: null,
  adminLoggedIn: false,
  adminTab: "records",
  sheetStep: 1,
  printWeekStart: startOfWeek(new Date()),
  printPreviewRoom: null,
  dialogFilter: "all",
  dialogQuery: ""
};

function safeName(room) { return room.name || room.id; }

// ===== STORE (localStorage mock) =====
function getRecords() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function setRecords(r) { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)); }
function makeId() {
  return globalThis.crypto?.randomUUID?.() || `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const store = {
  listFuture() {
    return getRecords().filter(r => r.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  },
  listByName(name) {
    const kw = name.toLowerCase();
    return getRecords().filter(r => r.date >= today && r.booker.toLowerCase() === kw)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  },
  hasConflict(date, roomId, time) {
    return getRecords().some(r => r.date === date && r.roomId === roomId && r.time === time);
  },
  add(payload) { const r = getRecords(); r.push(payload); setRecords(r); },
  remove(id) { setRecords(getRecords().filter(r => r.id !== id)); }
};

// ===== UTILITIES =====
function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return d.toISOString().slice(0, 10);
}

function downloadCsv(filename, text) {
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8;" })),
    download: filename
  });
  a.click(); URL.revokeObjectURL(a.href);
}

// ===== TOAST =====
let _toastTimer = null;
function toast(msg, type = "") {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = `toast${type ? " " + type : ""}`;
  el.classList.remove("hidden");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.add("hidden"), 3200);
}

// ===== VIEW =====
function switchView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === id));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === id));
}

// ===== GREETING =====
function updateGreeting() {
  const h = new Date().getHours();
  const greet = h < 12 ? "早安" : h < 18 ? "午安" : "晚安";
  const fmt = new Intl.DateTimeFormat("zh-Hant", { month: "long", day: "numeric", weekday: "short" });
  document.getElementById("heroEyebrow").textContent = `${greet} · ${fmt.format(new Date())}`;
}

// ===== HERO STATS =====
function updateHeroStats() {
  const all = getRecords();
  document.getElementById("heroTotalBookings").textContent =
    all.filter(r => r.date === today).length;
  const dayRecs = all.filter(r => r.date === state.selectedDate && r.roomId === state.selectedRoomId);
  document.getElementById("heroFreeSlots").textContent = Math.max(0, SLOTS.length - dayRecs.length);
}

// ===== DATE CHIPS =====
function renderDateChips() {
  const labels = ["今天", "明天", "+2天", "+3天"];
  document.getElementById("dateChips").innerHTML = labels.map((label, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const val = d.toISOString().slice(0, 10);
    return `<button class="date-chip${val === state.selectedDate ? " active" : ""}" data-chip-date="${val}">${label}</button>`;
  }).join("");
}

function selectDate(date) {
  state.selectedDate = date;
  document.getElementById("selectedDate").value = date;
  renderDateChips();
  renderSlots();
  updateHeroStats();
}

// ===== ROOM CARDS (sidebar) =====
function renderRoomCards() {
  const visible = ROOMS.slice(0, 4);
  document.getElementById("roomCards").innerHTML = visible.map(r => {
    const active = r.id === state.selectedRoomId ? " active" : "";
    return `<button class="room-card${active}" data-room-id="${r.id}">
      <div class="room-card-id">${safeName(r)}</div>
      <div class="room-card-type">${r.label}</div>
    </button>`;
  }).join("");
}

function selectRoom(roomId) {
  state.selectedRoomId = roomId;
  const room = ROOMS.find(r => r.id === roomId);
  document.getElementById("selectedRoomTitle").textContent = safeName(room);
  renderRoomCards();
  renderDialogRooms();
  renderSlots();
  updateHeroStats();
}

// ===== SLOT GRID =====
function renderSlots() {
  const morning = document.getElementById("morningSlots");
  const afternoon = document.getElementById("afternoonSlots");
  morning.innerHTML = "";
  afternoon.innerHTML = "";

  SLOTS.forEach(slot => {
    const timeStr = `${slot.key} ${slot.value}`;
    const conflict = store.hasConflict(state.selectedDate, state.selectedRoomId, timeStr);
    const html = `<button class="slot-card${conflict ? " conflict" : ""}"
        data-slot-time="${timeStr}" ${conflict ? "disabled" : ""}>
      <div class="slot-key">${slot.key}</div>
      <div class="slot-time">${slot.value}</div>
      <div class="slot-status">${conflict ? "已預約" : "可預約"}</div>
    </button>`;
    (slot.band === "morning" ? morning : afternoon).insertAdjacentHTML("beforeend", html);
  });
}

// ===== CUSTOM TIME =====
function updateCustomPreview() {
  const s = document.getElementById("customStart").value;
  const e = document.getElementById("customEnd").value;
  const el = document.getElementById("customPreview");
  if (!s || !e) { el.textContent = "選擇開始與結束時間"; return; }
  if (s >= e) { el.textContent = "⚠ 結束時間需晚於開始時間"; return; }
  const mins = Math.round((new Date("1970-01-01T" + e) - new Date("1970-01-01T" + s)) / 60000);
  el.textContent = `將預約 ${s} – ${e}（共 ${mins} 分鐘）`;
}

// ===== DIALOG ROOMS =====
function renderDialogRooms() {
  const filtered = ROOMS.filter(r => {
    const catOk = state.dialogFilter === "all" || r.category === state.dialogFilter;
    const txtOk = `${r.id} ${safeName(r)}`.toLowerCase().includes(state.dialogQuery.toLowerCase());
    return catOk && txtOk;
  });
  document.getElementById("dialogRoomList").innerHTML = filtered.map(r => {
    const active = r.id === state.selectedRoomId ? " active" : "";
    return `<button class="dialog-room-btn${active}" data-room-id="${r.id}">
      <div class="dialog-room-name">${safeName(r)}</div>
      <div class="dialog-room-type">${r.label}</div>
    </button>`;
  }).join("");
}

function renderQuickPicks() {
  document.getElementById("quickPicks").innerHTML = QUICK_PURPOSES.map(p =>
    `<button type="button" class="quick-pick-btn" data-purpose="${p}">${p}</button>`
  ).join("");
}

/* =========================================================
   Part 2: Booking Sheet, My Bookings, Admin, Print
   ========================================================= */

// ===== BOOKING SHEET =====
function openSheet(slotTime) {
  state.selectedSlot = slotTime;
  state.sheetStep = 1;
  updateSheetSummary();
  updateSheetStep();
  document.getElementById("bookingSheet").classList.remove("hidden");
  document.getElementById("bookerName").focus();
}

function closeSheet() {
  document.getElementById("bookingSheet").classList.add("hidden");
  document.getElementById("bookingSheetForm").reset();
  state.selectedSlot = null;
}

function updateSheetSummary() {
  const room = ROOMS.find(r => r.id === state.selectedRoomId);
  document.getElementById("sheetSummary").innerHTML = `
    <div><span>日期</span><strong>${state.selectedDate}</strong></div>
    <div><span>時段</span><strong>${state.selectedSlot}</strong></div>
    <div><span>課室</span><strong>${safeName(room)}</strong></div>`;
}

function updateSheetStep() {
  const s = state.sheetStep;
  document.getElementById("sheetStep1").classList.toggle("hidden", s !== 1);
  document.getElementById("sheetStep2").classList.toggle("hidden", s !== 2);
  document.getElementById("sheetBackBtn").classList.toggle("hidden", s === 1);
  document.getElementById("sheetNextBtn").textContent = s === 1 ? "下一步 →" : "確認送出 ✓";
  document.getElementById("sheetStepLabel").textContent = `步驟 ${s} / 2`;
  document.getElementById("stepSeg1").classList.toggle("active", s >= 1);
  document.getElementById("stepSeg2").classList.toggle("active", s >= 2);
}

function submitBooking() {
  const booker = document.getElementById("bookerName").value.trim();
  const purpose = document.getElementById("bookerPurpose").value.trim();
  if (!purpose) { toast("請填寫預約用途", "err"); return; }

  const room = ROOMS.find(r => r.id === state.selectedRoomId);
  if (store.hasConflict(state.selectedDate, state.selectedRoomId, state.selectedSlot)) {
    toast("該時段已被預約，請選擇其他時段", "err");
    closeSheet(); renderSlots(); return;
  }

  const bookingType = document.getElementById("bookingType").value;
  const payloads = [];

  if (bookingType === "每週重複（至學期末）") {
    for (let w = 0; w < 16; w++) {
      const d = new Date(state.selectedDate);
      d.setDate(d.getDate() + w * 7);
      const dateStr = d.toISOString().slice(0, 10);
      if (!store.hasConflict(dateStr, state.selectedRoomId, state.selectedSlot)) {
        payloads.push({ id: makeId(), date: dateStr, roomId: state.selectedRoomId, roomName: safeName(room), time: state.selectedSlot, booker, purpose, type: bookingType });
      }
    }
  } else {
    payloads.push({ id: makeId(), date: state.selectedDate, roomId: state.selectedRoomId, roomName: safeName(room), time: state.selectedSlot, booker, purpose, type: bookingType });
  }

  payloads.forEach(p => store.add(p));
  closeSheet();
  renderSlots();
  updateHeroStats();
  renderAdminStats();
  renderAdminRecords();
  toast(payloads.length > 1 ? `已預約 ${payloads.length} 個時段 ✓` : "預約已送出 ✓", "ok");
}

// ===== MY BOOKINGS =====
function renderMyBookings(name) {
  const content = document.getElementById("myBookingsContent");
  if (!name) {
    content.innerHTML = `<div class="booking-empty">請在上方輸入姓名並點擊查詢</div>`;
    return;
  }
  const rows = store.listByName(name);
  if (!rows.length) {
    content.innerHTML = `<div class="booking-empty">找不到「${name}」的未來預約記錄</div>`;
    return;
  }
  content.innerHTML = rows.map(r => {
    const d = new Date(r.date + "T00:00:00");
    return `<div class="booking-card">
      <div class="booking-card-date">
        <div class="booking-date-day">${d.getDate()}</div>
        <div class="booking-date-mon">${d.toLocaleDateString("zh-Hant", { month: "short" })}</div>
      </div>
      <div class="booking-card-info">
        <div class="booking-room-name">${r.roomName}</div>
        <p class="booking-purpose">${r.purpose}</p>
      </div>
      <span class="booking-slot-pill">${r.time}</span>
      <button class="btn btn-danger" style="padding:5px 10px;font-size:12px"
        data-cancel-id="${r.id}" data-cancel-date="${r.date}">取消</button>
    </div>`;
  }).join("");
}

// ===== ADMIN =====
function renderAdminStats() {
  const all = getRecords();
  const future = all.filter(r => r.date >= today);
  const todayCount = all.filter(r => r.date === today).length;
  const roomCounts = {};
  all.forEach(r => { roomCounts[r.roomName] = (roomCounts[r.roomName] || 0) + 1; });
  const top = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0];

  document.getElementById("adminStats").innerHTML = `
    <div class="stat-card coral">
      <div class="stat-card-icon">📅</div>
      <div class="stat-card-value">${future.length}</div>
      <div class="stat-card-label">未來預約總計</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon">☀️</div>
      <div class="stat-card-value">${todayCount}</div>
      <div class="stat-card-label">今日預約</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon">📊</div>
      <div class="stat-card-value">${future.length ? Math.round(future.length / (7 * 5 * SLOTS.length) * 100) : 0}%</div>
      <div class="stat-card-label">課室使用率</div>
    </div>
    <div class="stat-card">
      <div class="stat-card-icon">🏆</div>
      <div class="stat-card-value" style="font-size:16px">${top ? top[0] : "—"}</div>
      <div class="stat-card-label">最熱門課室</div>
    </div>`;
}

function renderAdminRecords() {
  const search = document.getElementById("adminSearch").value.toLowerCase();
  const roomFilter = document.getElementById("adminRoomFilter").value;
  let rows = store.listFuture();
  if (search) rows = rows.filter(r => `${r.booker} ${r.purpose} ${r.roomName}`.toLowerCase().includes(search));
  if (roomFilter !== "all") rows = rows.filter(r => r.roomId === roomFilter);
  document.getElementById("adminCount").textContent = rows.length;
  document.getElementById("adminRows").innerHTML = rows.length
    ? rows.map(r => `<tr>
        <td>${r.date}</td><td>${r.time}</td><td>${r.roomName}</td>
        <td>${r.booker}</td><td>${r.purpose}</td>
        <td><button class="btn btn-danger" style="padding:4px 10px;font-size:12px" data-delete-id="${r.id}">刪除</button></td>
      </tr>`).join("")
    : `<tr><td colspan="6" class="empty-row">目前沒有符合條件的預約</td></tr>`;
}

function populateRoomFilter() {
  const sel = document.getElementById("adminRoomFilter");
  sel.innerHTML = `<option value="all">所有課室</option>` +
    ROOMS.map(r => `<option value="${r.id}">${safeName(r)}</option>`).join("");
}

// ===== PRINT =====
function weekLabel(start) {
  const d = new Date(start + "T00:00:00");
  const e = new Date(d); e.setDate(e.getDate() + 6);
  const fmt = x => x.toLocaleDateString("zh-Hant", { month: "numeric", day: "numeric" });
  return `${fmt(d)} – ${fmt(e)}`;
}

function renderPrintRoomChecks() {
  document.getElementById("printRoomChecks").innerHTML = ROOMS.map(r =>
    `<label class="print-check-label"><input type="checkbox" value="${r.id}"> ${safeName(r)}</label>`
  ).join("");
  updatePrintHint();
  if (!state.printPreviewRoom) state.printPreviewRoom = ROOMS[0].id;
  renderPreviewTabs();
  renderPrintPreview();
}

function updatePrintHint() {
  const n = document.querySelectorAll("#printRoomChecks input:checked").length;
  document.getElementById("printRoomHint").textContent = `每間課室列印一頁。已選 ${n} 間。`;
}

function renderPreviewTabs() {
  const checked = [...document.querySelectorAll("#printRoomChecks input:checked")].map(b => b.value);
  if (!checked.includes(state.printPreviewRoom) && checked.length) state.printPreviewRoom = checked[0];
  document.getElementById("previewRoomTabs").innerHTML = checked.map(id => {
    const r = ROOMS.find(x => x.id === id);
    return `<button class="preview-tab${id === state.printPreviewRoom ? " active" : ""}" data-preview-room="${id}">${safeName(r)}</button>`;
  }).join("");
}

function renderPrintPreview() {
  const el = document.getElementById("printPreview");
  const rid = state.printPreviewRoom;
  if (!rid) { el.innerHTML = `<div class="booking-empty">請至少勾選一個課室進行預覽</div>`; return; }

  const ws = state.printWeekStart;
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(ws + "T00:00:00"); d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
  const dayLabels = ["週一", "週二", "週三", "週四", "週五"];
  const recs = getRecords().filter(r => r.roomId === rid);

  const header = `<tr><th>節次</th>${days.map((d, i) => `<th>${dayLabels[i]}<br><small>${d.slice(5)}</small></th>`).join("")}</tr>`;
  const bodyRows = SLOTS.map(slot => {
    const cells = days.map(d => {
      const rec = recs.find(r => r.date === d && r.time === `${slot.key} ${slot.value}`);
      return rec
        ? `<td><div class="pgc-booked">${rec.booker}<br>${rec.purpose}</div></td>`
        : `<td><span class="pgc-free">—</span></td>`;
    }).join("");
    return `<tr><td class="slot-label">${slot.key}<br><small>${slot.value}</small></td>${cells}</tr>`;
  }).join("");

  el.innerHTML = `<div class="print-grid"><table class="print-week-grid"><thead>${header}</thead><tbody>${bodyRows}</tbody></table></div>`;
}

/* =========================================================
   Part 3: Event Listeners + initApp()
   ========================================================= */

function initApp() {
  // Initial renders
  document.getElementById("selectedDate").value = today;
  document.getElementById("selectedDate").min = today;
  document.getElementById("weekLabel").textContent = weekLabel(state.printWeekStart);

  updateGreeting();
  renderDateChips();
  renderRoomCards();
  renderQuickPicks();
  populateRoomFilter();
  renderPrintRoomChecks();
  renderSlots();
  updateHeroStats();
  renderAdminStats();
  renderAdminRecords();

  // ----- Nav -----
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("admin-only") && !state.adminLoggedIn) return;
      switchView(btn.dataset.view);
    });
  });

  // ----- Date chips -----
  document.getElementById("dateChips").addEventListener("click", e => {
    const chip = e.target.closest("[data-chip-date]");
    if (chip) selectDate(chip.dataset.chipDate);
  });
  document.getElementById("selectedDate").addEventListener("change", e => selectDate(e.target.value));

  // ----- Room sidebar -----
  document.getElementById("roomCards").addEventListener("click", e => {
    const card = e.target.closest("[data-room-id]");
    if (card) selectRoom(card.dataset.roomId);
  });

  // ----- More rooms overlay -----
  document.getElementById("moreRoomsBtn").addEventListener("click", () => {
    state.dialogQuery = ""; state.dialogFilter = "all";
    document.getElementById("roomSearch").value = "";
    document.querySelectorAll("#moreRoomsDialog .seg-btn").forEach(b =>
      b.classList.toggle("active", b.dataset.filter === "all"));
    renderDialogRooms();
    document.getElementById("moreRoomsOverlay").classList.remove("hidden");
  });
  document.getElementById("closeMoreRooms").addEventListener("click", () =>
    document.getElementById("moreRoomsOverlay").classList.add("hidden"));
  document.getElementById("moreRoomsOverlay").addEventListener("click", e => {
    if (e.target === e.currentTarget)
      document.getElementById("moreRoomsOverlay").classList.add("hidden");
  });
  document.getElementById("roomSearch").addEventListener("input", e => {
    state.dialogQuery = e.target.value; renderDialogRooms();
  });
  document.querySelectorAll("#moreRoomsDialog .seg-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.dialogFilter = btn.dataset.filter;
      document.querySelectorAll("#moreRoomsDialog .seg-btn").forEach(b =>
        b.classList.toggle("active", b === btn));
      renderDialogRooms();
    });
  });
  document.getElementById("dialogRoomList").addEventListener("click", e => {
    const btn = e.target.closest("[data-room-id]");
    if (btn) {
      selectRoom(btn.dataset.roomId);
      document.getElementById("moreRoomsOverlay").classList.add("hidden");
    }
  });

  // ----- Slot clicks -----
  document.getElementById("slotGrid").addEventListener("click", e => {
    const card = e.target.closest("[data-slot-time]");
    if (card && !card.disabled) openSheet(card.dataset.slotTime);
  });

  // ----- Custom time -----
  document.getElementById("customStart").addEventListener("input", updateCustomPreview);
  document.getElementById("customEnd").addEventListener("input", updateCustomPreview);
  document.getElementById("customBookBtn").addEventListener("click", () => {
    const s = document.getElementById("customStart").value;
    const e = document.getElementById("customEnd").value;
    if (!s || !e || s >= e) { toast("請輸入有效的開始與結束時間", "err"); return; }
    openSheet(`${s}–${e}`);
  });

  // ----- Booking sheet -----
  document.getElementById("closeSheet").addEventListener("click", closeSheet);
  document.getElementById("bookingSheet").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeSheet();
  });
  document.getElementById("sheetBackBtn").addEventListener("click", () => {
    state.sheetStep = 1; updateSheetStep();
  });
  document.getElementById("quickPicks").addEventListener("click", e => {
    const btn = e.target.closest("[data-purpose]");
    if (btn) document.getElementById("bookerPurpose").value = btn.dataset.purpose;
  });
  document.getElementById("bookingSheetForm").addEventListener("submit", e => {
    e.preventDefault();
    if (state.sheetStep === 1) {
      if (!document.getElementById("bookerName").value.trim()) {
        toast("請輸入您的姓名", "err"); return;
      }
      state.sheetStep = 2; updateSheetStep(); return;
    }
    submitBooking();
  });

  // ----- My Bookings -----
  document.getElementById("myBookingsForm").addEventListener("submit", e => {
    e.preventDefault();
    renderMyBookings(document.getElementById("myNameInput").value.trim());
  });
  document.getElementById("myBookingsContent").addEventListener("click", e => {
    const btn = e.target.closest("[data-cancel-id]");
    if (!btn) return;
    if (btn.dataset.cancelDate <= today) { toast("今日及已過期的預約無法取消", "err"); return; }
    store.remove(btn.dataset.cancelId);
    renderMyBookings(document.getElementById("myNameInput").value.trim());
    renderSlots(); updateHeroStats(); renderAdminStats(); renderAdminRecords();
    toast("預約已取消", "ok");
  });

  // ----- Admin auth -----
  document.getElementById("adminLoginBtn").addEventListener("click", () => {
    state.adminLoggedIn = true;
    document.querySelector(".admin-only")?.classList.remove("hidden");
    document.getElementById("adminLoginBtn").classList.add("hidden");
    document.getElementById("adminSession").classList.remove("hidden");
    switchView("admin");
  });
  document.getElementById("adminLogoutBtn").addEventListener("click", () => {
    state.adminLoggedIn = false;
    document.querySelector(".admin-only")?.classList.add("hidden");
    document.getElementById("adminLoginBtn").classList.remove("hidden");
    document.getElementById("adminSession").classList.add("hidden");
    switchView("booking");
  });

  // ----- Admin tabs -----
  document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      state.adminTab = tab.dataset.adminTab;
      document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById("adminRecordsPanel").classList.toggle("hidden", state.adminTab !== "records");
      document.getElementById("adminAccountsPanel").classList.toggle("hidden", state.adminTab !== "accounts");
    });
  });

  // ----- Admin controls -----
  document.getElementById("refreshAdmin").addEventListener("click", () => {
    renderAdminStats(); renderAdminRecords(); toast("已重新整理", "ok");
  });
  document.getElementById("adminSearch").addEventListener("input", renderAdminRecords);
  document.getElementById("adminRoomFilter").addEventListener("change", renderAdminRecords);
  document.getElementById("adminRows").addEventListener("click", e => {
    const btn = e.target.closest("[data-delete-id]");
    if (!btn) return;
    store.remove(btn.dataset.deleteId);
    renderAdminStats(); renderAdminRecords(); renderSlots(); updateHeroStats();
    toast("預約已刪除", "ok");
  });
  document.getElementById("exportCsv").addEventListener("click", () => {
    const rows = store.listFuture();
    const header = ["日期", "時間", "課室", "預約人", "用途"].join(",");
    const csv = [header, ...rows.map(r => [r.date, r.time, r.roomName, r.booker, r.purpose].join(","))].join("\n");
    downloadCsv("booking_records.csv", csv);
    toast("CSV 已下載 ✓", "ok");
  });

  // ----- Print -----
  document.getElementById("prevWeek").addEventListener("click", () => {
    const d = new Date(state.printWeekStart + "T00:00:00");
    d.setDate(d.getDate() - 7);
    state.printWeekStart = d.toISOString().slice(0, 10);
    document.getElementById("weekLabel").textContent = weekLabel(state.printWeekStart);
    renderPrintPreview();
  });
  document.getElementById("nextWeek").addEventListener("click", () => {
    const d = new Date(state.printWeekStart + "T00:00:00");
    d.setDate(d.getDate() + 7);
    state.printWeekStart = d.toISOString().slice(0, 10);
    document.getElementById("weekLabel").textContent = weekLabel(state.printWeekStart);
    renderPrintPreview();
  });
  document.getElementById("printBtn").addEventListener("click", () => window.print());
  document.getElementById("checkAllRooms").addEventListener("click", () => {
    document.querySelectorAll("#printRoomChecks input").forEach(b => b.checked = true);
    updatePrintHint(); renderPreviewTabs(); renderPrintPreview();
  });
  document.getElementById("uncheckAllRooms").addEventListener("click", () => {
    document.querySelectorAll("#printRoomChecks input").forEach(b => b.checked = false);
    updatePrintHint(); renderPreviewTabs(); renderPrintPreview();
  });
  document.getElementById("printRoomChecks").addEventListener("change", () => {
    updatePrintHint(); renderPreviewTabs(); renderPrintPreview();
  });
  document.getElementById("previewRoomTabs").addEventListener("click", e => {
    const btn = e.target.closest("[data-preview-room]");
    if (!btn) return;
    state.printPreviewRoom = btn.dataset.previewRoom;
    document.querySelectorAll(".preview-tab").forEach(t =>
      t.classList.toggle("active", t.dataset.previewRoom === state.printPreviewRoom));
    renderPrintPreview();
  });
}

initApp();
