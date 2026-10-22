 import { useState, useEffect } from "react";

// ══════════════════════════════════════════════════════
//  定数・サンプルデータ
// ══════════════════════════════════════════════════════
const ADMIN_PASSWORD = "gyokyo2024";

// 旧暦・月齢計算（簡易）
function getLunarInfo(date) {
  // 基準：2000年1月6日 = 新月（朔）
  const base = new Date(2000, 0, 6);
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const cycle = 29.530588;
  const age = ((diff % cycle) + cycle) % cycle;
  const moonIcons = ["🌑","🌒","🌒","🌓","🌔","🌔","🌕","🌕","🌕","🌖","🌖","🌗","🌘","🌘","🌑"];
  const moonIcon = moonIcons[Math.floor(age / 2)];
  const moonName = age < 1 ? "新月" : age < 8 ? "上弦に向かう" : age < 10 ? "上弦" : age < 14 ? "ほぼ満月" : age < 16 ? "満月" : age < 22 ? "下弦に向かう" : age < 24 ? "下弦" : "新月に向かう";

  // 旧暦（簡易近似）
  const kyuMonth = ["睦月","如月","弥生","卯月","皐月","水無月","文月","葉月","長月","神無月","霜月","師走"];
  const lunDay = Math.floor(age) + 1;
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date - startOfYear) / 86400000);
  const approxMonth = Math.floor(((dayOfYear + 15) % 365) / 30.4) % 12;

  return {
    age: age.toFixed(1),
    icon: moonIcon,
    name: moonName,
    kyuMonth: kyuMonth[approxMonth],
    kyuDay: lunDay,
  };
}

const TODAY = new Date(2026, 5, 4); // 2026-06-04

const initialPosts = [
  { id: 1, category: "notice", urgent: false, title: "6月漁業調整委員会のお知らせ", body: "6月15日（日）午前10時より、組合会議室にて漁業調整委員会を開催します。出席をお願いします。", date: "2026-06-03", author: "事務局" },
  { id: 2, category: "fuel", urgent: false, title: "燃料価格改定のお知らせ（6月分）", body: "6月1日より軽油 ¥138/L、A重油 ¥121/L に改定されました。", date: "2026-06-01", author: "事務局" },
  { id: 3, category: "urgent", urgent: true, title: "【緊急】台風接近に伴う係留確認のお願い", body: "台風3号が接近中です。本日18時までに係留状態を確認し、必要な補強を行ってください。不明な点は事務局まで連絡を。", date: "2026-06-03", author: "組合長" },
];

const FUEL_PRICES = [
  { label: "軽油", price: 138, unit: "L", icon: "⛽", prev: 135 },
  { label: "A重油", price: 121, unit: "L", icon: "🛢️", prev: 119 },
];

const BAIT_PRICES = [
  { name: "アミエビ（冷凍）", icon: "🦐", price: 980, unit: "kg", prev: 950, note: "サビキ釣り用" },
  { name: "イワシ（生）", icon: "🐟", price: 320, unit: "kg", prev: 320, note: "泳がせ・コマセ用" },
  { name: "サンマ（冷凍）", icon: "🐟", price: 410, unit: "kg", prev: 430, note: "カツオ・マグロ用" },
  { name: "オキアミ（冷凍）", icon: "🦐", price: 760, unit: "kg", prev: 720, note: "万能エサ" },
  { name: "青イソメ", icon: "🪱", price: 1200, unit: "100g", prev: 1200, note: "投げ釣り・船釣り" },
  { name: "石ゴカイ", icon: "🪱", price: 950, unit: "100g", prev: 980, note: "キス・ハゼ用" },
  { name: "活きアジ", icon: "🐠", price: 180, unit: "匹", prev: 160, note: "泳がせ釣り" },
  { name: "イカ短冊（冷凍）", icon: "🦑", price: 640, unit: "kg", prev: 640, note: "底物・船釣り" },
  { name: "コーン（缶詰）", icon: "🌽", price: 220, unit: "缶", prev: 230, note: "ヘラブナ・コイ用" },
  { name: "練りエサ（集魚材）", icon: "🧪", price: 580, unit: "袋", prev: 560, note: "フカセ・ダンゴ釣り" },
];

const WEATHER_DATA = {
  today: { icon: "⛅", label: "くもり時々晴れ", high: 24, low: 18, wind: "北東 5m/s", wave: "1.0m", tide: "大潮" },
  forecast: [
    { day: "明日", icon: "🌤️", high: 26, low: 19, wind: "南 3m/s", wave: "0.5m" },
    { day: "明後日", icon: "🌧️", high: 21, low: 17, wind: "北 8m/s", wave: "2.0m" },
    { day: "3日後", icon: "⛈️", high: 19, low: 16, wind: "北北西 12m/s", wave: "3.5m" },
    { day: "4日後", icon: "🌤️", high: 23, low: 17, wind: "東 4m/s", wave: "1.0m" },
  ]
};

const TIDE_DATA = {
  date: "2026年6月4日（木）大潮",
  points: [
    { time: "00:00", height: 82 }, { time: "01:00", height: 65 }, { time: "02:00", height: 45 },
    { time: "03:00", height: 28 }, { time: "04:00", height: 20 }, { time: "05:00", height: 28 },
    { time: "06:00", height: 52 }, { time: "07:00", height: 88 }, { time: "08:00", height: 128 },
    { time: "09:00", height: 160 }, { time: "10:00", height: 178 }, { time: "11:00", height: 182 },
    { time: "12:00", height: 170 }, { time: "13:00", height: 148 }, { time: "14:00", height: 118 },
    { time: "15:00", height: 88 }, { time: "16:00", height: 62 }, { time: "17:00", height: 45 },
    { time: "18:00", height: 38 }, { time: "19:00", height: 42 }, { time: "20:00", height: 60 },
    { time: "21:00", height: 88 }, { time: "22:00", height: 118 }, { time: "23:00", height: 142 },
  ],
  highlights: [
    { label: "満潮", time: "11:24", height: 183, type: "high" },
    { label: "干潮", time: "04:51", height: 18, type: "low" },
    { label: "満潮", time: "23:42", height: 152, type: "high" },
    { label: "干潮", time: "17:38", height: 36, type: "low" },
  ]
};

// 台車利用状況
const initialDaisha = {
  rail:   [ // レール
    { id: "r1", boat: "第一漁丸", owner: "田中", from: "2026-06-02", to: "2026-06-07" },
    { id: "r2", boat: "海幸丸", owner: "山田", from: "2026-06-04", to: "2026-06-05" },
    { id: "r3", boat: "", owner: "", from: "", to: "" },
    { id: "r4", boat: "", owner: "", from: "", to: "" },
    { id: "r5", boat: "", owner: "", from: "", to: "" },
  ],
  center: [ // 真ん中
    { id: "c1", boat: "幸栄丸", owner: "佐藤", from: "2026-06-03", to: "2026-06-06" },
    { id: "c2", boat: "大漁丸", owner: "鈴木", from: "2026-06-04", to: "2026-06-10" },
    { id: "c3", boat: "第三清丸", owner: "伊藤", from: "2026-06-04", to: "2026-06-04" },
    { id: "c4", boat: "", owner: "", from: "", to: "" },
    { id: "c5", boat: "", owner: "", from: "", to: "" },
  ],
  west:   [ // 西側
    { id: "w1", boat: "福栄丸", owner: "渡辺", from: "2026-06-01", to: "2026-06-08" },
    { id: "w2", boat: "", owner: "", from: "", to: "" },
    { id: "w3", boat: "", owner: "", from: "", to: "" },
    { id: "w4", boat: "", owner: "", from: "", to: "" },
    { id: "w5", boat: "", owner: "", from: "", to: "" },
  ],
};

// 市況データ（複数日）
const MARKET_HISTORY = {
  "2026-06-04": {
    updateTime: "08:30",
    items: [
      { name: "マアジ", icon: "🐟", grade: "上", qty: "180kg", price: 420, change: 30, trend: "up" },
      { name: "マサバ", icon: "🐟", grade: "中", qty: "320kg", price: 185, change: -15, trend: "down" },
      { name: "イサキ", icon: "🐠", grade: "上", qty: "95kg", price: 680, change: 50, trend: "up" },
      { name: "タチウオ", icon: "🐡", grade: "特上", qty: "42kg", price: 1240, change: 0, trend: "flat" },
      { name: "シロギス", icon: "🐟", grade: "上", qty: "68kg", price: 560, change: -40, trend: "down" },
      { name: "カツオ", icon: "🐟", grade: "中", qty: "210kg", price: 340, change: 20, trend: "up" },
      { name: "ヒラメ", icon: "🐡", grade: "特上", qty: "28kg", price: 2100, change: 100, trend: "up" },
      { name: "スズキ", icon: "🐠", grade: "上", qty: "55kg", price: 780, change: 0, trend: "flat" },
      { name: "タコ", icon: "🐙", grade: "上", qty: "38kg", price: 920, change: -60, trend: "down" },
      { name: "シラス", icon: "🐟", grade: "生", qty: "145kg", price: 480, change: 30, trend: "up" },
      { name: "マダイ", icon: "🐠", grade: "特上", qty: "22kg", price: 1850, change: 150, trend: "up" },
      { name: "ブリ", icon: "🐟", grade: "中", qty: "88kg", price: 620, change: -30, trend: "down" },
    ]
  },
  "2026-06-03": {
    updateTime: "08:45",
    items: [
      { name: "マアジ", icon: "🐟", grade: "上", qty: "210kg", price: 390, change: -10, trend: "down" },
      { name: "マサバ", icon: "🐟", grade: "中", qty: "280kg", price: 200, change: 20, trend: "up" },
      { name: "イサキ", icon: "🐠", grade: "上", qty: "112kg", price: 630, change: 0, trend: "flat" },
      { name: "タチウオ", icon: "🐡", grade: "特上", qty: "36kg", price: 1240, change: 80, trend: "up" },
      { name: "カツオ", icon: "🐟", grade: "中", qty: "195kg", price: 320, change: -20, trend: "down" },
      { name: "ヒラメ", icon: "🐡", grade: "特上", qty: "19kg", price: 2000, change: 50, trend: "up" },
      { name: "スズキ", icon: "🐠", grade: "上", qty: "48kg", price: 780, change: 30, trend: "up" },
      { name: "タコ", icon: "🐙", grade: "上", qty: "52kg", price: 980, change: 0, trend: "flat" },
      { name: "シラス", icon: "🐟", grade: "生", qty: "98kg", price: 450, change: -20, trend: "down" },
      { name: "ブリ", icon: "🐟", grade: "中", qty: "120kg", price: 650, change: 40, trend: "up" },
    ]
  },
  "2026-06-02": {
    updateTime: "08:20",
    items: [
      { name: "マアジ", icon: "🐟", grade: "上", qty: "155kg", price: 400, change: 50, trend: "up" },
      { name: "マサバ", icon: "🐟", grade: "中", qty: "310kg", price: 180, change: -30, trend: "down" },
      { name: "イサキ", icon: "🐠", grade: "中", qty: "88kg", price: 580, change: -50, trend: "down" },
      { name: "カツオ", icon: "🐟", grade: "中", qty: "240kg", price: 340, change: 40, trend: "up" },
      { name: "シロギス", icon: "🐟", grade: "上", qty: "74kg", price: 600, change: 60, trend: "up" },
      { name: "タコ", icon: "🐙", grade: "上", qty: "44kg", price: 980, change: -40, trend: "down" },
      { name: "シラス", icon: "🐟", grade: "生", qty: "188kg", price: 470, change: 20, trend: "up" },
      { name: "ブリ", icon: "🐟", grade: "中", qty: "76kg", price: 610, change: 0, trend: "flat" },
    ]
  },
};

const MARKET_DATES = Object.keys(MARKET_HISTORY).sort((a, b) => b.localeCompare(a));

// ── タブ ────────────────────────────────────────────
const TABS = [
  { id: "home",    label: "ホーム",  icon: "🏠" },
  { id: "notice",  label: "掲示板",  icon: "📋" },
  { id: "weather", label: "天気",    icon: "🌤️" },
  { id: "daisha",  label: "台車",    icon: "🚢" },
  { id: "market",  label: "市況",    icon: "🐟" },
  { id: "prices",  label: "価格表",  icon: "💰" },
];

// ── 潮汐グラフ ────────────────────────────────────
function TideChart({ hour }) {
  const W = 320, H = 100, PAD = 28;
  const pts = TIDE_DATA.points;
  const xScale = (i) => PAD + (i / (pts.length - 1)) * (W - PAD * 2);
  const yScale = (h) => H - 12 - (h / 200) * (H - 24);
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(p.height).toFixed(1)}`).join(" ");
  const fillD = pathD + ` L${xScale(pts.length - 1)},${H} L${xScale(0)},${H} Z`;
  const nowX = xScale(hour);
  const nowH = pts[hour]?.height ?? 0;
  const nowY = yScale(nowH);
  return (
    <div style={{ background: CARD, borderRadius: 14, padding: "14px 12px", border: "1px solid #1e4a6a", marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: SUB, marginBottom: 8, fontWeight: 600 }}>📅 {TIDE_DATA.date}</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e90ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#1e90ff" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {[50, 100, 150].map(h => (
          <line key={h} x1={PAD} y1={yScale(h)} x2={W - PAD} y2={yScale(h)} stroke="#1e3a5a" strokeWidth="0.5" strokeDasharray="3,3" />
        ))}
        <path d={fillD} fill="url(#tg)" />
        <path d={pathD} fill="none" stroke="#1e90ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1={nowX} y1={8} x2={nowX} y2={H - 4} stroke="#ffd166" strokeWidth="1.5" strokeDasharray="3,3" />
        <circle cx={nowX} cy={nowY} r="4" fill="#ffd166" />
        {[0, 6, 12, 18, 23].map(i => (
          <text key={i} x={xScale(i)} y={H - 1} textAnchor="middle" fontSize="8" fill="#7bafd4">{pts[i].time.slice(0, 2)}時</text>
        ))}
        <text x={nowX + 5} y={nowY - 5} fontSize="8" fill="#ffd166">{nowH}cm</text>
      </svg>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
        {TIDE_DATA.highlights.map((h, i) => (
          <div key={i} style={{ background: h.type === "high" ? "#0a3560" : "#2a1a0a", borderRadius: 8, padding: "4px 10px", fontSize: 11 }}>
            <span style={{ color: h.type === "high" ? "#4ecdc4" : "#ffd166" }}>{h.label} {h.time}</span>
            <span style={{ color: SUB, marginLeft: 4 }}>{h.height}cm</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 台車スロット ────────────────────────────────────
function DaishaSection({ label, icon, slots, isAdmin, onEdit }) {
  const todayStr = "2026-06-04";
  const used = slots.filter(s => s.boat).length;
  return (
    <div style={{ background: CARD, borderRadius: 14, border: "1px solid #1e4a6a", marginBottom: 12, overflow: "hidden" }}>
      <div style={{ background: "#071e36", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{icon}</span>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{label}</span>
        </div>
        <span style={{ fontSize: 12, color: used >= 5 ? "#ff6b6b" : used >= 3 ? "#ffd166" : "#4ecdc4" }}>
          {used}/5 使用中
        </span>
      </div>
      {slots.map((slot, i) => {
        const isUsed = !!slot.boat;
        const isToday = isUsed && slot.from <= todayStr && slot.to >= todayStr;
        return (
          <div key={slot.id} style={{
            display: "flex", alignItems: "center", padding: "10px 14px",
            borderBottom: i < 4 ? "1px solid #1a3a5a" : "none",
            background: isUsed ? (isToday ? "#0d2a10" : "#0f2540") : "transparent"
          }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: isUsed ? (isToday ? "#2d7a35" : "#1a4a7a") : "#1a3a5a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", marginRight: 10, flexShrink: 0 }}>
              {i + 1}
            </div>
            {isUsed ? (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{slot.boat}
                    <span style={{ fontSize: 11, color: SUB, marginLeft: 6 }}>({slot.owner})</span>
                  </div>
                  <div style={{ fontSize: 11, color: isToday ? "#7dff9a" : SUB, marginTop: 2 }}>
                    📅 {slot.from} 〜 {slot.to}
                    {isToday && <span style={{ marginLeft: 6, background: "#1a5a22", borderRadius: 6, padding: "1px 6px", color: "#7dff9a" }}>利用中</span>}
                  </div>
                </div>
                {isAdmin && (
                  <button style={styles.slotBtn} onClick={() => onEdit(slot)}>編集</button>
                )}
              </>
            ) : (
              <>
                <span style={{ flex: 1, color: "#3a5a7a", fontSize: 13 }}>空き</span>
                {isAdmin && (
                  <button style={{ ...styles.slotBtn, background: "#1a4060", color: ACCENT }} onClick={() => onEdit(slot)}>予約</button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  メイン App
// ══════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("home");
  const [posts, setPosts] = useState(initialPosts);
  const [daisha, setDaisha] = useState(initialDaisha);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "notice", urgent: false, title: "", body: "" });
  const [detailId, setDetailId] = useState(null);
  const [now, setNow] = useState(new Date());
  const [marketDate, setMarketDate] = useState(MARKET_DATES[0]);
  const [marketSort, setMarketSort] = useState("default");
  const [editSlot, setEditSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ boat: "", owner: "", from: "", to: "" });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const lunar = getLunarInfo(TODAY);
  const currentHour = now.getHours();
  const urgentPosts = posts.filter(p => p.urgent);
  const noticePosts = posts.filter(p => p.category === "notice" || p.category === "urgent");
  const fuelPosts = posts.filter(p => p.category === "fuel");
  const detailPost = posts.find(p => p.id === detailId);
  const marketData = MARKET_HISTORY[marketDate];

  const timeStr = now.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" });

  function handleLogin() {
    if (pwInput === ADMIN_PASSWORD) { setIsAdmin(true); setShowLogin(false); setPwInput(""); setPwError(false); }
    else setPwError(true);
  }
  function handlePost() {
    if (!form.title.trim() || !form.body.trim()) return;
    setPosts(prev => [{ id: Date.now(), ...form, date: new Date().toISOString().split("T")[0], author: "事務局" }, ...prev]);
    setForm({ category: "notice", urgent: false, title: "", body: "" });
    setShowForm(false);
  }
  function handleDelete(id) { setPosts(prev => prev.filter(p => p.id !== id)); setDetailId(null); }

  function openSlotEdit(slot) {
    setEditSlot(slot);
    setSlotForm({ boat: slot.boat, owner: slot.owner, from: slot.from, to: slot.to });
  }
  function saveSlot() {
    const area = editSlot.id[0] === "r" ? "rail" : editSlot.id[0] === "c" ? "center" : "west";
    setDaisha(prev => ({
      ...prev,
      [area]: prev[area].map(s => s.id === editSlot.id ? { ...s, ...slotForm } : s)
    }));
    setEditSlot(null);
  }
  function clearSlot() {
    const area = editSlot.id[0] === "r" ? "rail" : editSlot.id[0] === "c" ? "center" : "west";
    setDaisha(prev => ({
      ...prev,
      [area]: prev[area].map(s => s.id === editSlot.id ? { ...s, boat: "", owner: "", from: "", to: "" } : s)
    }));
    setEditSlot(null);
  }

  const sortedMarket = marketData ? [...marketData.items].sort((a, b) => {
    if (marketSort === "price_desc") return b.price - a.price;
    if (marketSort === "price_asc") return a.price - b.price;
    if (marketSort === "up") return b.change - a.change;
    return 0;
  }) : [];

  // 台車空き数サマリ
  const daishaFree = {
    rail:   daisha.rail.filter(s => !s.boat).length,
    center: daisha.center.filter(s => !s.boat).length,
    west:   daisha.west.filter(s => !s.boat).length,
  };

  return (
    <div style={styles.root}>
      {/* ヘッダー */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>⚓</span>
          <div>
            <div style={styles.headerTitle}>漁協 組合員連絡板</div>
            <div style={styles.headerSub}>{dateStr}　{timeStr}</div>
          </div>
        </div>
        <button style={isAdmin ? styles.adminBadgeOn : styles.adminBadgeOff}
          onClick={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)}>
          {isAdmin ? "🔓 管理者" : "🔒 管理者"}
        </button>
      </header>

      {/* 緊急バナー */}
      {urgentPosts.length > 0 && (
        <div style={styles.urgentBanner} onClick={() => { setTab("notice"); setDetailId(urgentPosts[0].id); }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <span style={styles.urgentText}>緊急連絡: {urgentPosts[0].title}</span>
          <span style={{ color: "#ff6b6b" }}>▶</span>
        </div>
      )}

      <main style={styles.main}>
        {/* ── ログイン ── */}
        {showLogin && (
          <div style={styles.overlay} onClick={() => setShowLogin(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalTitle}>🔑 管理者ログイン</div>
              <input style={pwError ? { ...styles.input, borderColor: "#ff4444" } : styles.input}
                type="password" placeholder="パスワードを入力" value={pwInput}
                onChange={e => { setPwInput(e.target.value); setPwError(false); }}
                onKeyDown={e => e.key === "Enter" && handleLogin()} />
              {pwError && <div style={styles.errorMsg}>パスワードが違います</div>}
              <div style={styles.modalBtns}>
                <button style={styles.btnGray} onClick={() => { setShowLogin(false); setPwInput(""); setPwError(false); }}>キャンセル</button>
                <button style={styles.btnBlue} onClick={handleLogin}>ログイン</button>
              </div>
            </div>
          </div>
        )}

        {/* ── 投稿フォーム ── */}
        {showForm && isAdmin && (
          <div style={styles.overlay} onClick={() => setShowForm(false)}>
            <div style={{ ...styles.modal, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
              <div style={styles.modalTitle}>📝 新規投稿</div>
              <select style={styles.input} value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="notice">お知らせ</option>
                <option value="fuel">燃料価格</option>
                <option value="urgent">緊急連絡</option>
              </select>
              <label style={styles.checkLabel}>
                <input type="checkbox" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))} />
                　🚨 緊急フラグを立てる
              </label>
              <input style={styles.input} placeholder="タイトル" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
                placeholder="本文" value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
              <div style={styles.modalBtns}>
                <button style={styles.btnGray} onClick={() => setShowForm(false)}>キャンセル</button>
                <button style={styles.btnBlue} onClick={handlePost}>投稿する</button>
              </div>
            </div>
          </div>
        )}

        {/* ── 詳細 ── */}
        {detailPost && (
          <div style={styles.overlay} onClick={() => setDetailId(null)}>
            <div style={{ ...styles.modal, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
              {detailPost.urgent && <div style={styles.detailUrgent}>🚨 緊急連絡</div>}
              <div style={styles.detailTitle}>{detailPost.title}</div>
              <div style={styles.detailMeta}>{detailPost.date}　{detailPost.author}</div>
              <div style={styles.detailBody}>{detailPost.body}</div>
              {isAdmin && <button style={styles.btnRed} onClick={() => handleDelete(detailPost.id)}>🗑 削除</button>}
              <button style={{ ...styles.btnGray, marginTop: 8 }} onClick={() => setDetailId(null)}>閉じる</button>
            </div>
          </div>
        )}

        {/* ── 台車編集モーダル ── */}
        {editSlot && (
          <div style={styles.overlay} onClick={() => setEditSlot(null)}>
            <div style={{ ...styles.modal, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
              <div style={styles.modalTitle}>🚢 台車スロット編集</div>
              <input style={styles.input} placeholder="船名" value={slotForm.boat}
                onChange={e => setSlotForm(f => ({ ...f, boat: e.target.value }))} />
              <input style={styles.input} placeholder="船主名" value={slotForm.owner}
                onChange={e => setSlotForm(f => ({ ...f, owner: e.target.value }))} />
              <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>利用開始日</div>
              <input style={styles.input} type="date" value={slotForm.from}
                onChange={e => setSlotForm(f => ({ ...f, from: e.target.value }))} />
              <div style={{ fontSize: 12, color: SUB, marginBottom: 4 }}>利用終了日</div>
              <input style={styles.input} type="date" value={slotForm.to}
                onChange={e => setSlotForm(f => ({ ...f, to: e.target.value }))} />
              <div style={styles.modalBtns}>
                <button style={styles.btnGray} onClick={() => setEditSlot(null)}>キャンセル</button>
                <button style={styles.btnRed} onClick={clearSlot}>クリア</button>
                <button style={styles.btnBlue} onClick={saveSlot}>保存</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ ホーム ═══ */}
        {tab === "home" && (
          <div style={styles.tabContent}>
            {/* 天気 */}
            <div style={styles.sectionTitle}>本日の天気・海況</div>
            <div style={styles.weatherCard} onClick={() => setTab("weather")}>
              <div style={styles.weatherMain}>
                <span style={{ fontSize: 38 }}>{WEATHER_DATA.today.icon}</span>
                <div style={{ marginLeft: 12 }}>
                  <div style={styles.weatherLabel}>{WEATHER_DATA.today.label}</div>
                  <div style={styles.weatherTemp}>最高 <b>{WEATHER_DATA.today.high}°</b> / 最低 {WEATHER_DATA.today.low}°</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "center" }}>
                  <div style={{ fontSize: 24 }}>{lunar.icon}</div>
                  <div style={{ fontSize: 10, color: SUB }}>月齢{lunar.age}</div>
                </div>
              </div>
              <div style={styles.weatherChips}>
                <span style={styles.chip}>🌊 {WEATHER_DATA.today.wave}</span>
                <span style={styles.chip}>💨 {WEATHER_DATA.today.wind}</span>
                <span style={styles.chip}>🌙 {WEATHER_DATA.today.tide}</span>
                <span style={styles.chip}>📅 {lunar.kyuMonth}{lunar.kyuDay}日</span>
              </div>
            </div>

            {/* 台車サマリ */}
            <div style={styles.sectionTitle}>台車空き状況</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, cursor: "pointer" }} onClick={() => setTab("daisha")}>
              {[["🛤️","レール", daishaFree.rail], ["⬛","真ん中", daishaFree.center], ["🌊","西側", daishaFree.west]].map(([ic, lb, fr]) => (
                <div key={lb} style={{ flex: 1, background: CARD, borderRadius: 12, padding: "10px 8px", textAlign: "center", border: "1px solid #1e4a6a" }}>
                  <div style={{ fontSize: 20 }}>{ic}</div>
                  <div style={{ fontSize: 11, color: SUB, margin: "3px 0" }}>{lb}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: fr > 0 ? "#4ecdc4" : "#ff6b6b" }}>空{fr}隻</div>
                </div>
              ))}
            </div>

            {/* 市況TOP5 */}
            <div style={styles.sectionTitle}>本日のセリ TOP5</div>
            <div style={{ background: CARD, borderRadius: 14, border: "1px solid #1e4a6a", overflow: "hidden", marginBottom: 10 }} onClick={() => setTab("market")}>
              {(MARKET_HISTORY[MARKET_DATES[0]]?.items ?? []).slice(0, 5).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "9px 14px", borderBottom: i < 4 ? "1px solid #1a3a5a" : "none" }}>
                  <span style={{ fontSize: 18, marginRight: 8 }}>{item.icon}</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{item.name}</span>
                  <span style={{ fontSize: 11, color: SUB, marginRight: 8 }}>{item.grade}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#ffd166" }}>¥{item.price.toLocaleString()}</span>
                  <span style={{ fontSize: 11, marginLeft: 6, color: item.trend === "up" ? "#ff6b6b" : item.trend === "down" ? "#4ecdc4" : "#aaa" }}>
                    {item.trend === "up" ? `▲${item.change}` : item.trend === "down" ? `▼${Math.abs(item.change)}` : "→"}
                  </span>
                </div>
              ))}
              <div style={{ padding: "8px 14px", textAlign: "center", fontSize: 12, color: ACCENT }}>全件・過去データを見る →</div>
            </div>

            {/* お知らせ */}
            <div style={styles.sectionTitle}>最新のお知らせ</div>
            {posts.slice(0, 3).map(p => <PostCard key={p.id} post={p} onClick={() => setDetailId(p.id)} />)}
          </div>
        )}

        {/* ═══ 掲示板 ═══ */}
        {tab === "notice" && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>お知らせ一覧</div>
              {isAdmin && <button style={styles.btnAdd} onClick={() => setShowForm(true)}>＋ 投稿</button>}
            </div>
            {noticePosts.length === 0 && <div style={styles.empty}>お知らせはありません</div>}
            {noticePosts.map(p => <PostCard key={p.id} post={p} onClick={() => setDetailId(p.id)} />)}
          </div>
        )}

        {/* ═══ 天気・潮汐 ═══ */}
        {tab === "weather" && (
          <div style={styles.tabContent}>
            {/* 天気カード */}
            <div style={styles.sectionTitle}>本日の天気・海況</div>
            <div style={styles.weatherDetailCard}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 10 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 52 }}>{WEATHER_DATA.today.icon}</div>
                  <div style={styles.weatherBigLabel}>{WEATHER_DATA.today.label}</div>
                  <div style={styles.weatherBigTemp}>{WEATHER_DATA.today.high}° / {WEATHER_DATA.today.low}°</div>
                </div>
                {/* 月齢・旧暦 */}
                <div style={{ background: "#071e36", borderRadius: 14, padding: "12px 16px", textAlign: "center", minWidth: 110 }}>
                  <div style={{ fontSize: 36, marginBottom: 4 }}>{lunar.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{lunar.name}</div>
                  <div style={{ fontSize: 12, color: SUB }}>月齢 {lunar.age}日</div>
                  <div style={{ fontSize: 11, color: "#ffd166", marginTop: 4 }}>旧暦 {lunar.kyuMonth}</div>
                  <div style={{ fontSize: 11, color: "#ffd166" }}>{lunar.kyuDay}日</div>
                </div>
              </div>
              <div style={styles.weatherDetailGrid}>
                <div style={styles.weatherDetailItem}><span style={styles.wdLabel}>波高</span><span style={styles.wdVal}>{WEATHER_DATA.today.wave}</span></div>
                <div style={styles.weatherDetailItem}><span style={styles.wdLabel}>風</span><span style={styles.wdVal}>{WEATHER_DATA.today.wind}</span></div>
                <div style={styles.weatherDetailItem}><span style={styles.wdLabel}>潮汐</span><span style={styles.wdVal}>{WEATHER_DATA.today.tide}</span></div>
              </div>
            </div>

            {/* 潮汐グラフ */}
            <div style={styles.sectionTitle}>本日の潮汐グラフ</div>
            <TideChart hour={currentHour} />

            {/* 週間予報 */}
            <div style={styles.sectionTitle}>週間予報</div>
            <div style={styles.forecastList}>
              {WEATHER_DATA.forecast.map((f, i) => (
                <div key={i} style={styles.forecastItem}>
                  <div style={styles.forecastDay}>{f.day}</div>
                  <div style={{ fontSize: 28 }}>{f.icon}</div>
                  <div style={styles.forecastTemp}>{f.high}°/{f.low}°</div>
                  <div style={styles.forecastWave}>🌊{f.wave}</div>
                  <div style={styles.forecastWind}>💨{f.wind}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ 台車 ═══ */}
        {tab === "daisha" && (
          <div style={styles.tabContent}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>台車利用状況</div>
              {!isAdmin && <span style={{ fontSize: 11, color: SUB }}>管理者のみ編集可</span>}
            </div>
            <div style={{ fontSize: 12, color: SUB, marginBottom: 12 }}>📅 2026年6月4日現在　{isAdmin && "タップで編集"}</div>
            <DaishaSection label="レール" icon="🛤️" slots={daisha.rail}   isAdmin={isAdmin} onEdit={openSlotEdit} />
            <DaishaSection label="真ん中" icon="⬛" slots={daisha.center} isAdmin={isAdmin} onEdit={openSlotEdit} />
            <DaishaSection label="西側"   icon="🌊" slots={daisha.west}   isAdmin={isAdmin} onEdit={openSlotEdit} />
          </div>
        )}

        {/* ═══ 市況 ═══ */}
        {tab === "market" && (
          <div style={styles.tabContent}>
            <div style={styles.sectionTitle}>セリ情報</div>

            {/* 日付セレクタ */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 4 }}>
              {MARKET_DATES.map(d => (
                <button key={d} style={marketDate === d ? styles.sortBtnActive : styles.sortBtn}
                  onClick={() => setMarketDate(d)}>
                  {d === MARKET_DATES[0] ? "本日" : d.slice(5).replace("-", "/")}
                </button>
              ))}
            </div>

            {marketData && (
              <>
                <div style={{ fontSize: 12, color: SUB, marginBottom: 10 }}>
                  📅 {marketDate}　更新 {marketData.updateTime}
                  {marketDate === MARKET_DATES[0] && <span style={{ marginLeft: 8, background: "#1a4060", borderRadius: 6, padding: "2px 8px", color: ACCENT, fontSize: 11 }}>最新</span>}
                </div>

                {/* 並び替え */}
                <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                  {[["default","標準"],["price_desc","高値順"],["price_asc","安値順"],["up","値上がり順"]].map(([val, label]) => (
                    <button key={val} style={marketSort === val ? styles.sortBtnActive : styles.sortBtn}
                      onClick={() => setMarketSort(val)}>{label}</button>
                  ))}
                </div>

                {/* ヘッダー行 */}
                <div style={{ display: "flex", fontSize: 10, color: SUB, padding: "0 14px 6px", gap: 4 }}>
                  <span style={{ width: 26 }}></span>
                  <span style={{ flex: 1 }}>魚種</span>
                  <span style={{ width: 30, textAlign: "center" }}>等級</span>
                  <span style={{ width: 50, textAlign: "right" }}>数量</span>
                  <span style={{ width: 70, textAlign: "right" }}>単価/kg</span>
                  <span style={{ width: 40, textAlign: "right" }}>前日比</span>
                </div>
                <div style={{ background: CARD, borderRadius: 14, border: "1px solid #1e4a6a", overflow: "hidden" }}>
                  {sortedMarket.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: i < sortedMarket.length - 1 ? "1px solid #1a3a5a" : "none", gap: 4 }}>
                      <span style={{ fontSize: 20, width: 26 }}>{item.icon}</span>
                      <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{item.name}</span>
                      <span style={{ width: 30, fontSize: 10, textAlign: "center", background: item.grade === "特上" ? "#3a2000" : "#0a2f50", color: item.grade === "特上" ? "#ffb700" : "#7bafd4", borderRadius: 6, padding: "2px 4px" }}>{item.grade}</span>
                      <span style={{ width: 50, fontSize: 11, color: SUB, textAlign: "right" }}>{item.qty}</span>
                      <span style={{ width: 70, fontSize: 15, fontWeight: 700, color: "#ffd166", textAlign: "right" }}>¥{item.price.toLocaleString()}</span>
                      <span style={{ width: 40, fontSize: 11, textAlign: "right", color: item.trend === "up" ? "#ff6b6b" : item.trend === "down" ? "#4ecdc4" : "#aaa" }}>
                        {item.trend === "up" ? `▲${item.change}` : item.trend === "down" ? `▼${Math.abs(item.change)}` : "→"}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: SUB, marginTop: 10, textAlign: "right" }}>※ 価格はkg単価（税込）</div>
              </>
            )}
          </div>
        )}

        {/* ═══ 価格表 ═══ */}
        {tab === "prices" && (
          <div style={styles.tabContent}>
            {/* 燃料 */}
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}>燃料価格</div>
              {isAdmin && <button style={styles.btnAdd} onClick={() => { setForm(f => ({ ...f, category: "fuel" })); setShowForm(true); }}>＋ 更新</button>}
            </div>
            <div style={styles.updateDate}>更新日：2026年6月1日</div>
            {FUEL_PRICES.map(f => (
              <div key={f.label} style={styles.fuelCard}>
                <span style={{ fontSize: 32 }}>{f.icon}</span>
                <div style={{ flex: 1, marginLeft: 16 }}>
                  <div style={styles.fuelName}>{f.label}</div>
                  <div style={styles.fuelChange}>
                    {f.price > f.prev ? <span style={{ color: "#ff6b6b" }}>▲ {f.price - f.prev}円 値上がり</span>
                      : f.price < f.prev ? <span style={{ color: "#4ecdc4" }}>▼ {f.prev - f.price}円 値下がり</span>
                        : <span style={{ color: "#aaa" }}>→ 変動なし</span>}
                  </div>
                </div>
                <div style={styles.fuelPrice}>¥{f.price}<span style={styles.fuelUnit}>/{f.unit}</span></div>
              </div>
            ))}

            {/* 餌 */}
            <div style={{ ...styles.sectionHeader, marginTop: 6 }}>
              <div style={styles.sectionTitle}>餌価格表</div>
            </div>
            <div style={styles.updateDate}>更新日：2026年6月3日</div>
            <div style={{ background: CARD, borderRadius: 14, border: "1px solid #1e4a6a", overflow: "hidden", marginBottom: 10 }}>
              {BAIT_PRICES.map((b, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "11px 14px", borderBottom: i < BAIT_PRICES.length - 1 ? "1px solid #1a3a5a" : "none" }}>
                  <span style={{ fontSize: 22, width: 30 }}>{b.icon}</span>
                  <div style={{ flex: 1, marginLeft: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: SUB }}>{b.note} / {b.unit}あたり</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#ffd166" }}>¥{b.price.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: b.price > b.prev ? "#ff6b6b" : b.price < b.prev ? "#4ecdc4" : "#aaa" }}>
                      {b.price > b.prev ? `▲${b.price - b.prev}` : b.price < b.prev ? `▼${b.prev - b.price}` : "変動なし"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.sectionTitle}>過去の価格連絡</div>
            {fuelPosts.map(p => <PostCard key={p.id} post={p} onClick={() => setDetailId(p.id)} />)}
            {fuelPosts.length === 0 && <div style={styles.empty}>連絡はありません</div>}
          </div>
        )}
      </main>

      {/* ボトムナビ */}
      <nav style={styles.nav}>
        {TABS.map(t => (
          <button key={t.id} style={tab === t.id ? styles.navItemActive : styles.navItem} onClick={() => setTab(t.id)}>
            <span style={styles.navIcon}>{t.icon}</span>
            <span style={styles.navLabel}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function PostCard({ post, onClick }) {
  const catColors = { notice: "#1a6fd4", fuel: "#e07b00", urgent: "#d41a1a" };
  const catLabels = { notice: "お知らせ", fuel: "燃料", urgent: "緊急" };
  return (
    <div style={styles.postCard} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ ...styles.catBadge, background: catColors[post.category] || "#444" }}>
          {catLabels[post.category] || post.category}
        </span>
        {post.urgent && <span style={styles.urgentBadge}>🚨 緊急</span>}
        <span style={styles.postDate}>{post.date}</span>
      </div>
      <div style={styles.postTitle}>{post.title}</div>
      <div style={styles.postSnippet}>{post.body.slice(0, 60)}{post.body.length > 60 ? "…" : ""}</div>
    </div>
  );
}

// ── スタイル ────────────────────────────────────────
const SEA = "#0a2342";
const ACCENT = "#1e90ff";
const CARD = "#0f2d4a";
const TEXT = "#e8f4fd";
const SUB = "#7bafd4";

const styles = {
  root: { minHeight: "100dvh", background: SEA, color: TEXT, fontFamily: "'Hiragino Kaku Gothic ProN','Meiryo',sans-serif", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" },
  header: { background: "#061929", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1e4a6a", position: "sticky", top: 0, zIndex: 100 },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  headerIcon: { fontSize: 28 },
  headerTitle: { fontWeight: 700, fontSize: 16, letterSpacing: 1 },
  headerSub: { fontSize: 11, color: SUB, marginTop: 1 },
  adminBadgeOn: { background: "#1a5c1a", color: "#7dff7d", border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  adminBadgeOff: { background: "#2a2a2a", color: "#aaa", border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  urgentBanner: { background: "linear-gradient(90deg,#6b0000,#cc0000)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  urgentText: { flex: 1, fontSize: 13, fontWeight: 600 },
  main: { flex: 1, overflowY: "auto", paddingBottom: 80 },
  tabContent: { padding: "14px 14px 0" },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: SUB, letterSpacing: 2, margin: "14px 0 8px", borderLeft: `3px solid ${ACCENT}`, paddingLeft: 8 },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  weatherCard: { background: CARD, borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer", border: "1px solid #1e4a6a" },
  weatherMain: { display: "flex", alignItems: "center", marginBottom: 10 },
  weatherLabel: { fontSize: 16, fontWeight: 600 },
  weatherTemp: { fontSize: 13, color: SUB, marginTop: 3 },
  weatherChips: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: { background: "#0a2f50", borderRadius: 20, padding: "4px 10px", fontSize: 12, color: TEXT },
  weatherDetailCard: { background: CARD, borderRadius: 14, padding: 20, border: "1px solid #1e4a6a", marginBottom: 10 },
  weatherBigLabel: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  weatherBigTemp: { fontSize: 14, color: SUB, marginBottom: 6 },
  weatherDetailGrid: { display: "flex", justifyContent: "space-around", marginTop: 14 },
  weatherDetailItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  wdLabel: { fontSize: 11, color: SUB },
  wdVal: { fontSize: 15, fontWeight: 600 },
  forecastList: { display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 },
  forecastItem: { background: CARD, borderRadius: 12, padding: "12px 10px", minWidth: 90, textAlign: "center", border: "1px solid #1e4a6a", flexShrink: 0 },
  forecastDay: { fontSize: 12, color: SUB, marginBottom: 6, fontWeight: 600 },
  forecastTemp: { fontSize: 13, fontWeight: 600, margin: "4px 0" },
  forecastWave: { fontSize: 11, color: "#4ecdc4", margin: "2px 0" },
  forecastWind: { fontSize: 11, color: "#aac9e8", margin: "2px 0" },
  fuelCard: { background: CARD, borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", border: "1px solid #1e4a6a" },
  fuelName: { fontSize: 15, fontWeight: 600, marginBottom: 4 },
  fuelChange: { fontSize: 12 },
  fuelPrice: { fontSize: 24, fontWeight: 800, color: "#ffd166" },
  fuelUnit: { fontSize: 12, fontWeight: 400, color: SUB },
  updateDate: { fontSize: 12, color: SUB, marginBottom: 10 },
  sortBtn: { background: "#1a3a5a", color: SUB, border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" },
  sortBtnActive: { background: ACCENT, color: "#fff", border: "none", borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, whiteSpace: "nowrap" },
  postCard: { background: CARD, borderRadius: 12, padding: "12px 14px", marginBottom: 8, cursor: "pointer", border: "1px solid #1e4a6a" },
  catBadge: { fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, color: "#fff", letterSpacing: 1 },
  urgentBadge: { fontSize: 10, background: "#6b0000", borderRadius: 20, padding: "2px 8px", color: "#ffaaaa" },
  postDate: { fontSize: 11, color: SUB, marginLeft: "auto" },
  postTitle: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  postSnippet: { fontSize: 12, color: SUB, lineHeight: 1.5 },
  empty: { color: SUB, fontSize: 13, textAlign: "center", padding: 24 },
  nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#061929", borderTop: "1px solid #1e4a6a", display: "flex", zIndex: 100 },
  navItem: { flex: 1, background: "none", border: "none", color: SUB, padding: "7px 0 5px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, fontFamily: "inherit" },
  navItemActive: { flex: 1, background: "none", border: "none", color: ACCENT, padding: "7px 0 5px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, fontFamily: "inherit", borderTop: `2px solid ${ACCENT}` },
  navIcon: { fontSize: 17 },
  navLabel: { fontSize: 9, fontWeight: 600 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#0f2d4a", borderRadius: 16, padding: 20, width: "100%", maxWidth: 360, border: "1px solid #1e6a9a", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" },
  modalTitle: { fontSize: 17, fontWeight: 700, marginBottom: 14, color: TEXT },
  input: { width: "100%", background: "#061929", border: "1px solid #2a5a8a", borderRadius: 8, padding: "10px 12px", color: TEXT, fontSize: 14, fontFamily: "inherit", marginBottom: 10, boxSizing: "border-box" },
  checkLabel: { display: "flex", alignItems: "center", fontSize: 13, marginBottom: 10, color: TEXT, cursor: "pointer" },
  errorMsg: { color: "#ff6b6b", fontSize: 12, marginBottom: 8 },
  modalBtns: { display: "flex", gap: 8, marginTop: 4 },
  btnGray: { flex: 1, background: "#1a3a5a", color: TEXT, border: "none", borderRadius: 10, padding: "10px 0", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  btnBlue: { flex: 1, background: ACCENT, color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  btnRed: { flex: 1, background: "#6b0000", color: "#ffaaaa", border: "none", borderRadius: 10, padding: "10px 0", fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  btnAdd: { background: ACCENT, color: "#fff", border: "none", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  detailUrgent: { background: "#6b0000", color: "#ffaaaa", borderRadius: 8, padding: "6px 10px", fontSize: 12, marginBottom: 10, textAlign: "center" },
  detailTitle: { fontSize: 17, fontWeight: 700, marginBottom: 6 },
  detailMeta: { fontSize: 12, color: SUB, marginBottom: 12 },
  detailBody: { fontSize: 14, lineHeight: 1.7, color: TEXT },
  slotBtn: { background: "#1a3a5a", color: TEXT, border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
};