// Shared data for the UI kit — ROOMS and SLOTS mirror the Codex app.
const ROOMS = [
  { id: "120", category: "special", label: "功能室" },
  { id: "219", category: "classroom", label: "課室" },
  { id: "320", category: "classroom", label: "課室" },
  { id: "library-a", category: "special", name: "圖書館會議室", label: "功能室 — A" },
  { id: "library-b", category: "special", name: "圖書館會議室", label: "功能室 — B" },
  { id: "music", category: "special", name: "音樂室", label: "功能室" },
  { id: "art", category: "special", name: "美術室", label: "功能室" },
];

const SLOTS = [
  { key: "第1節", value: "8:30-9:10" },
  { key: "第2節", value: "9:20-10:00" },
  { key: "第3節", value: "10:05-10:45" },
  { key: "第4節", value: "10:50-11:35" },
  { key: "第5節", value: "11:40-12:20" },
  { key: "第6節", value: "14:00-14:40" },
  { key: "第7節", value: "14:45-15:30" },
  { key: "第8節", value: "15:35-16:15" },
];

function safeName(room) { return room.name || room.id; }

const todayISO = () => new Date().toISOString().slice(0, 10);

// Seed a few mock records so the admin / my-booking views have content.
function seedRecords() {
  const t = todayISO();
  const d = (off) => {
    const x = new Date();
    x.setDate(x.getDate() + off);
    return x.toISOString().slice(0, 10);
  };
  return [
    { id: "s1", date: d(1), roomId: "120", roomName: "120", time: "第3節 10:05-10:45", booker: "jessi", purpose: "學會會議", type: "單次預約" },
    { id: "s2", date: d(2), roomId: "music", roomName: "音樂室", time: "第5節 11:40-12:20", booker: "moses", purpose: "合唱練習", type: "單次預約" },
    { id: "s3", date: t,    roomId: "library-a", roomName: "圖書館會議室", time: "第2節 9:20-10:00", booker: "jessi", purpose: "家長會準備", type: "單次預約" },
    { id: "s4", date: d(3), roomId: "art",  roomName: "美術室", time: "第7節 14:45-15:30", booker: "amy",   purpose: "美術社課", type: "單次預約" },
  ];
}

Object.assign(window, { ROOMS, SLOTS, safeName, todayISO, seedRecords });
