function App() {
  const [view, setView] = React.useState("booking");
  const [adminLoggedIn, setAdminLoggedIn] = React.useState(false);
  const [records, setRecords] = React.useState(() => seedRecords());
  const [currentUser, setCurrentUser] = React.useState("");
  const [, force] = React.useReducer(x => x + 1, 0);

  const store = {
    records, adminLoggedIn, currentUser,
    add:    (r) => setRecords(prev => [...prev, r]),
    remove: (id) => setRecords(prev => prev.filter(r => r.id !== id)),
    refresh: () => force(),
  };

  const login = () => { setAdminLoggedIn(true); setCurrentUser("jessi"); setView("admin"); };
  const logout = () => { setAdminLoggedIn(false); setCurrentUser(""); setView("booking"); };

  const navItems = [
    { id: "booking",    label: "預約",      icon: "📅" },
    { id: "myBookings", label: "我的預約",  icon: "🕘" },
    { id: "print",      label: "列印",      icon: "🖨️" },
    ...(adminLoggedIn ? [{ id: "admin", label: "管理", icon: "🛠" }] : []),
  ];

  return (
    <div className="cks-root" style={{ minHeight: "100vh" }}>
      <Topbar
        view={view} onView={setView}
        navItems={navItems}
        adminLoggedIn={adminLoggedIn}
        currentUser={currentUser}
        onLogin={login} onLogout={logout}
      />
      <main style={{ width: "var(--cks-app-width)", margin: "0 auto", padding: "24px 0 40px" }}>
        {view === "booking"    && <BookingView store={store} />}
        {view === "myBookings" && <MyBookingsView store={store} />}
        {view === "print"      && <PrintView store={store} />}
        {view === "admin"      && adminLoggedIn && <AdminView store={store} />}
      </main>
    </div>
  );
}

function Topbar({ view, onView, navItems, adminLoggedIn, currentUser, onLogin, onLogout }) {
  return (
    <header style={{
      background: "#fff", borderBottom: "1px solid #E8DDCD",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <div style={{
        width: "var(--cks-app-width)", margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, padding: "14px 0", flexWrap: "wrap",
      }}>
        {/* Logo lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "0 0 auto" }}>
          <LogoMark size={36} />
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#22314F", letterSpacing: "0.2px" }}>課室預約</div>
            <div style={{ fontSize: 10.5, color: "#93A0B6", letterSpacing: "2px", textTransform: "uppercase", marginTop: 1 }}>CKS Room Booking</div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ display: "flex", gap: 4, background: "#FBF6EF", padding: 4, borderRadius: 12, border: "1px solid #EFE4D3" }}>
          {navItems.map(n => {
            const active = view === n.id;
            return (
              <button key={n.id} onClick={() => onView(n.id)} style={{
                border: 0, background: active ? "#fff" : "transparent",
                color: active ? "#E86A4C" : "#4A5A7A",
                boxShadow: active ? "0 1px 2px rgb(34 49 79 / 8%)" : "none",
                padding: "8px 14px", borderRadius: 9, cursor: "pointer",
                fontWeight: 600, fontSize: 13.5, fontFamily: "var(--cks-font-sans)",
                display: "inline-flex", alignItems: "center", gap: 6,
                transition: "all 150ms ease",
              }}>
                <span style={{ fontSize: 14 }}>{n.icon}</span>
                {n.label}
              </button>
            );
          })}
        </nav>
        {/* Right: user */}
        <div style={{ flex: "0 0 auto" }}>
          {adminLoggedIn ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F1E6D8", padding: "6px 10px 6px 6px", borderRadius: 999 }}>
              <Avatar name={currentUser} size={26} tone="ink"/>
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#22314F" }}>{currentUser}</div>
                <div style={{ fontSize: 10.5, color: "#6F7E99" }}>管理員</div>
              </div>
              <button onClick={onLogout} style={{
                border: 0, background: "transparent", color: "#6F7E99",
                cursor: "pointer", fontSize: 12, padding: "4px 8px", fontFamily: "var(--cks-font-sans)",
              }}>登出</button>
            </div>
          ) : (
            <Button kind="outline" size="sm" onClick={onLogin}>👥 管理員登入</Button>
          )}
        </div>
      </div>
    </header>
  );
}

window.App = App;
