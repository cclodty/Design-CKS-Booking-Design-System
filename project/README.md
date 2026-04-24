# CKS 課室預約系統 Design System

一套為 **學校課室及功能室預約系統** 設計的視覺與互動規範。目標是將現有的 Codex 底稿（前端 + Firebase/LocalStorage fallback）提升為一致、克制、專業的校園工具。

> 來源：`cclodty/CKS-Booking-system-Codex`（main 分支）— 已匯入 `index.html`, `src/app.js`, `src/styles.css`, `src/firebase.example.js`。

---

## 產品脈絡

**使用者**
- 教師 / 一般使用者：預約課室與功能室，查看自己的預約。
- 管理員（如 `jessi`）：管理所有預約記錄、帳戶權限、匯出 CSV。
- 行政人員：列印一週時間表。

**四個主要視圖（navigation tabs）**
1. `預約課室` — 選日期 → 挑課室 → 點節次卡或自訂連續時間段 → 確認彈窗
2. `我的預約` — 用姓名查詢未來預約
3. `時間表列印` — 選週、勾選課室、一鍵列印
4. `管理後台` — 預約記錄管理 + 帳戶管理（需管理員登入）

**課室資料**
- 一般課室：120、219、320
- 功能室：圖書館會議室 A/B、音樂室、美術室
- 八節次（第1節~第8節），早上 08:30 起，下午至 16:15

**技術**
- 純 HTML + vanilla JS (ESM)
- Firestore 為主，LocalStorage `cks_booking_mock_records_v2` fallback
- 語言：繁體中文（zh-Hant）

---

## 功能建議（Feature Proposals）

在套用新 UI 前，以下是建議優先加入的功能。每個都對應現有痛點：

### P0 — 必要改善
1. **重複預約（每週 / 多日）真實實作** — UI 已有但功能為 stub；應可選「學期末前每週重複」「指定幾個日期」。
2. **預約衝突即時檢查與等待清單** — 節次卡顯示佔用者姓名（管理員才看得到），一般使用者看到匿名「已預約」即可。
3. **取消 / 修改自己的預約** — 目前 `我的預約` 的「操作」欄是 `—`，需要「取消」按鈕 + 合理時效（如上課前 1 小時停止取消）。
4. **真實列印輸出** — `printPreview` 目前只印出文字，需要每一室一頁、一週七日的 grid 格式（現 UI 已經預留結構）。

### P1 — 體驗提升
5. **身份識別（教師 ID / 姓名自動填入）** — 避免姓名大小寫不一致導致查不到；可配合學校 SSO 或記住瀏覽器。
6. **快速預約「下一堂」** — 今日視圖，一鍵預約「下一節我要上的課室」。
7. **衝突建議** — 所選節次已被預約時，自動推薦同類型鄰近可用課室。
8. **訊息通知** — 預約成功 / 被取消 email 或 LINE Notify。
9. **我的常用課室** — 收藏，置頂顯示。

### P2 — 管理強化
10. **使用率統計** — 管理後台加「本週使用率 / 熱門課室 / 高峰時段」卡片。
11. **黑名單 / 限額** — 防止某老師壟斷某課室。
12. **公告 / 關閉時段** — 管理員可設「此週三下午全校關閉」。
13. **審計日誌** — 誰刪了誰的預約。

### P3 — 未來
14. **行動版優化** — 目前 mobile layout 可用但稍擠。
15. **多語 (EN)**。
16. **iCal / Google Calendar export**。

---

## 檔案索引（Manifest）

| 檔案 | 用途 |
| --- | --- |
| `README.md` | 本檔；產品脈絡 + 內容 + 視覺規範 |
| `SKILL.md` | Claude Agent Skill 入口（可與 Claude Code 共用） |
| `colors_and_type.css` | 顏色 + 字型 CSS 變數 |
| `fonts/` | Noto Sans TC（webfont 來源與後備） |
| `assets/` | Logo、icon、placeholder 圖 |
| `preview/` | Design System tab 卡片 HTML |
| `ui_kits/booking/` | 預約系統的 React/JSX UI kit + 互動 demo |
| （匯入的原始碼）`index.html`, `src/app.js`, `src/styles.css`, `src/firebase.example.js` | 原始 Codex 底稿參考 |

---

## CONTENT FUNDAMENTALS

### 語言 / 語氣
- **全繁體中文**，但 code 與 API 保持英文。
- **正式但親切**：像學校行政同事的 E-mail — 不裝熟，也不公文腔。
- **使用「您」** 對使用者；指令動詞用「請」開頭（「請輸入您的真實姓名」）。
- **Emoji 作為功能 icon**：每個主要 action / section 前綴一個表意 emoji（📅 選擇日期、🕘 自訂時間、🖨️ 執行列印、📩 送出預約、🔎 查詢、⟳ 重新整理、⬇ 匯出、👤 使用者）。不用於裝飾，只用於標示。
- **動作按鈕短且動詞開頭**：`執行列印`、`確認送出預約`、`匯出 CSV`。

### 具體措辭範例
- 空狀態：「請在上方輸入姓名並點擊查詢」、「目前沒有未來預約資料」、「找不到符合條件的預約記錄」。
- 錯誤：「請輸入有效的開始與結束時間」、「該時段已被預約，請選擇其他時段」。
- 成功：「預約已送出」（簡短 alert，不用誇張）。
- 標籤：`預約人姓名 *`、`預約用途 / 備註 *`、`開始`、`結束`。
- 權限：`無權限修改` 當不能操作；`超級管理員` / `一般管理員` 作為角色。

### 大小寫 / 標點
- 中文內的英數字用半形；中文之間不加半形空格。
- 全形括號「（）」用於中文說明，半形「()」用於英文。
- 分隔用「、」或「/」（例：`預約人 / 用途`、`課室 / 功能室`）。
- 破折號 `—` 用於副標與說明之間。

### Vibe
Calm、orderly、校園行政。不是 SaaS startup，也不是 consumer app — 而是一個你會放心把整個學期排程交出去的工具。

---

## VISUAL FOUNDATIONS

### Colors
- **主藍 `--brand` `#2a53d3`**：topbar、primary action、active state；向下有 `--brand-dark #1f3f9f`。
- **背景 `--bg #eceef2`**：淡冷灰，比 `#f5f5f5` 更偏藍，使主藍更明亮。
- **卡面 `--white #fff`** + **邊線 `--line #d8dde6`**：所有 panel 的邊框。
- **文字 `--text #0f2242`**（深藍黑）+ **次級 `--muted #667893`**。
- **狀態色**：`--green #10a957`（可預約、匯出、成功）、`--danger #e14f61`（刪除、衝突）。
- **軟色調對**：綠色狀態 `#92dca8 / #f8fef9 / #15893d / #d9f7e1`；紅色狀態 `#efb8bd / #fff7f8 / #c24857`。

用法原則：背景灰、面板白、動作藍、狀態用綠/紅。**不使用紫色漸層、不使用霓虹色、不用全黑**。

### Typography
- **主字**：`"Noto Sans TC"`，fallback `"Microsoft JhengHei", system-ui, sans-serif`。
- **重量**：regular (400) 內文 / medium (500) 次標 / semibold (600) 按鈕 / extrabold (800) brand。
- **尺寸階層（rem-based）**：
  - `h1` 22px / 28 lh / 700
  - `h2` 18px / 26 lh / 700
  - `h3` 16px / 24 lh / 700
  - `body` 14px / 22 lh / 400
  - `small / caption` 12px / 18 lh / 400
- **中文特性**：行高偏大（22/26 相對偏鬆），讓中文密度下不擁擠。
- **不用** serif、不用手寫風、不用裝飾 display。

### Spacing
- 4px grid；常用 step：`4 · 8 · 10 · 12 · 14 · 18 · 20 · 30`。
- `app-width: min(990px, calc(100vw - 30px))` — **內容寬度封頂 990**；窄螢幕留 15px gutter。
- Panel padding：`18px`。
- Grid gap：`8 / 10 / 12 / 14`。
- Section vertical rhythm：panel 間 14，view 上 20 下 30。

### Radii
- `10px` 次要元件（room item、slot card、選框）
- `8px` input / button / nav pill
- `12px` 主要 panel、dialog
- `6px` 小標籤（status pill `span`）
- **無超大圓角**（不 pill shape，不 `border-radius: 999`）；也**不用直角**。

### Shadows / Elevation
- Topbar：`0 2px 10px rgb(24 43 102 / 30%)` — 品牌藍染色的 shadow。
- Cards / panels：**不用 shadow**，靠 `1px solid --line` 分層。
- Dialog backdrop：`rgb(25 33 54 / 45%)`。
- 避免大陰影、發光、neumorphism。

### Borders
- Panel / input：`1px solid #d8dde6` 或 `#c8d0dc`。
- Active selection（如 active room item）：`background: #2f61dc; color: #fff; border-color: #2f61dc`（實心 fill，不用 outline）。
- Status card：彩色 1px border + 淺底（`#92dca8` + `#f8fef9`）— 雙色分層。

### Backgrounds
- 純色為主：`#eceef2` canvas、`#fff` card、`#f5f8fc` secondary panel。
- **不用**漸層、材質、photo、illustration 作背景。
- Dashed border `1px dashed #ccd6e7` 用於空狀態 / 預覽佔位。

### Corners & Cards
- 所有卡片：`1px solid #d8dde6` + `border-radius: 12px` + white bg，無 shadow。
- Hover：微微加深 border（`#c8d0dc`）或底色（`#f5f8fc`）。
- 選中：整塊翻藍（`bg: #2f61dc, color: #fff`）。

### Buttons
- `primary` 藍 `#2f61dd` / `dark` 深藍 `#23344d` / `green` `#1faa57` / `danger` (`.danger`) 淡紅底 + 紅字 / `ghost-btn` topbar 透藍 / `link-btn` 無背景藍字。
- Radius 8，padding `8 14`，font-weight 600。
- Hover：`filter: brightness(1.05)` 或加深 5%。
- Press：`transform: translateY(1px)`；無 ripple。
- Disabled：`opacity: .5; cursor: not-allowed`。

### Interaction & Motion
- 過場：`150ms ease` 顏色/背景；**無彈跳、無 spring、無大位移**。
- View 切換：`display: none → block`，不做淡入（為了列印與穩定）。
- Dialog：瀏覽器原生 `<dialog>` fade — 不自訂。
- 排版上的 motion 克制到最少；這是工具，不是 showcase。

### Transparency / Blur
- 幾乎不用。唯一例外：`.slot-card span` 的狀態 pill 微透底；dialog backdrop 的半透遮罩。
- **不用 backdrop-filter blur**。

### Iconography
- **Emoji 系統**（內建 in OS）作為功能 icon — 見 Content Fundamentals。
- **不畫自製 SVG icon**；若需要線條 icon，使用 Lucide（via CDN），風格：stroke-width 1.75，lucide default。
- Logo：📘 emoji + 系統全名 `課室及功能室預約系統`（文字為 logo）。

### Layout Rules
- 固定：Topbar 永遠置頂（目前非 sticky，提議加 `position: sticky`）。
- 兩欄模板：`booking-layout` 左 250px 課室清單 + 右 flex slot grid。
- Admin：`admin-layout` 左 205px tab + 右內容。
- Mobile < 900px：單欄堆疊；nav 換行置中；slot 變 2 欄。

### Protection Gradients / Capsules
- 不用。Topbar 是純色 flat，不需要文字保護漂浮層。

### Imagery / Photography
- 原生系統不用照片。如需示意圖，使用淡灰 placeholder rect + 校徽 emoji。

---

## 版本 / 貢獻
此 design system 為首版（v1）。如需 TTF、實體 logo、或校徽 SVG，請補充提供。
