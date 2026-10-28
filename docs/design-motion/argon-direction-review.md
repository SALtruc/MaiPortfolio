Tóm tắt: Đã phê bình bản thiết kế hiện tại và đề xuất hướng nghệ thuật điện ảnh 4 phân cảnh cùng GSAP cho trang chủ.

---

### 1. Báo cáo phạm vi truy cập & Phân định nguồn xác thực (Verified Sources vs. Unverified Ideas)

* **Giới hạn môi trường (Environment Limitations):** Phiên chạy ở chế độ headless chỉ đọc (read-only), mọi lệnh shell đều bị chặn và không có công cụ trình duyệt tương tác trực tiếp (interactive DOM browser) để chụp ảnh màn hình trực tiếp 8 trang tham khảo. Tuy nhiên, công cụ đọc file nội bộ (`read_file` trong `f:/maiportfolio`) và công cụ truy vấn chỉ mục web (`search_web`) hoạt động bình thường.
* **Nguồn đã kiểm chứng thực tế (Verified Sources):**
  1. **Mã nguồn & tài sản thực trong workspace:** Đã đọc trực tiếp [package.json](file:///f:/maiportfolio/package.json), [index.html](file:///f:/maiportfolio/index.html), [App.tsx](file:///f:/maiportfolio/src/App.tsx), [HomePage.tsx](file:///f:/maiportfolio/src/HomePage.tsx), [Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx), [ScrollMotion.tsx](file:///f:/maiportfolio/src/ScrollMotion.tsx), [stories.ts](file:///f:/maiportfolio/src/stories.ts), [workVisuals.ts](file:///f:/maiportfolio/src/workVisuals.ts), [content.ts](file:///f:/maiportfolio/src/content.ts), [Pages.tsx](file:///f:/maiportfolio/src/Pages.tsx), [WorkPage.tsx](file:///f:/maiportfolio/src/WorkPage.tsx), [WorkReel.tsx](file:///f:/maiportfolio/src/WorkReel.tsx), [styles.css](file:///f:/maiportfolio/src/styles.css), và [refinement.css](file:///f:/maiportfolio/src/refinement.css).
  2. **8 nguồn tham khảo công khai (đã tra cứu cấu trúc & định vị qua `search_web`, không render DOM trực tiếp):**
     * `scrolltide.co/components`: Thư viện thành phần cuộn điện ảnh (2.5D scroll-driven sections, liquid carousels, GPU aurora/metal shaders).
     * `threeui.com/browse?sort=recent`: Thư viện React + Three.js của Meng To với GLSL shaders, 3D primitives và hero WebGL có bảng điều khiển tham số.
     * `details.so/inspo/category/carousel`: Bộ sưu tập mẫu micro-interaction và bố cục carousel/slider thực tế cho web hiện đại.
     * `inspora.design` & `land-book.com`: Kho lưu trữ bố cục UI/UX, branding và landing page chuyển đổi cao theo lưới biên tập sắc nét.
     * `sceneai.art`: Thư viện định hướng bố cục hero, ánh sáng nền và chuyển động thị giác độ tương phản cao.
     * `createwithswift.com`: Tài liệu chuyên sâu về chuyển động vật lý mượt, gesture và đồ họa Metal/SwiftUI chuẩn xác kiểu Apple.
     * `kitbitz.art`: Thư viện minh họa vector CC0 vẽ tay (chúng ta **chủ chủ động loại bỏ** phong cách sticker/minh họa rời rạc kiểu này để tránh làm trang chủ giống đồ chơi).
* **Ý tưởng đề xuất mới (Proposed Art Direction):** Toàn bộ kiến trúc bố cục 4 phân cảnh, hệ màu Cobalt/Abyssal Ink và kịch bản GSAP ScrollTrigger dưới đây là thiết kế đề xuất mới (chưa ghi vào mã nguồn theo đúng yêu cầu read-only).

---

### 2. Phê bình độc lập bản thiết kế hiện tại (Actionable Critique)

Qua kiểm tra trực tiếp [HomePage.tsx](file:///f:/maiportfolio/src/HomePage.tsx) và [refinement.css](file:///f:/maiportfolio/src/refinement.css), giao diện hiện tại thất bại về mặt ấn tượng thị giác vì **4 căn bệnh thiết kế an toàn quá mức**:

1. **Bố cục Hero chia đôi cũ kỹ & "Hộp lồng hộp" làm giảm giá trị cảnh 3D ([HomePage.tsx](file:///f:/maiportfolio/src/HomePage.tsx#L48-L51), [refinement.css](file:///f:/maiportfolio/src/refinement.css#L19-L46)):**
   * `.home-hero` chia cột `.94fr 1.1fr` công thức. Bên trái ép tiêu đề serif chữ nghiêng hẹp (`A head for numbers. / A feel for people.`).
   * Bên phải nhốt toàn bộ cảnh Three.js ([`Desk`](file:///f:/maiportfolio/src/Desk.tsx#L8-L60)) vào khung `.world-viewport` cao vỏn vẹn `430px` (`border-radius: 17px`), bọc trong `.world-shell` (`background: #eaf0f8`, `rotate(-1.5deg)`), đè lên `.world-offset-frame` (`rotate(3deg)`) và dán thêm nhãn `.world-note` (`rotate(4deg)`). Cảnh 3D đáng lẽ phải tạo choáng ngợp không gian lại biến thành một "bàn đồ chơi thu nhỏ" (miniature toy widget) nhút nhát.
2. **Dải công ty `.experience-ribbon` nhạt nhòa ([HomePage.tsx](file:///f:/maiportfolio/src/HomePage.tsx#L52), [refinement.css](file:///f:/maiportfolio/src/refinement.css#L47-L50)):**
   * Những bảo chứng nặng ký nhất của Mai (**TikTok / ByteDance**, **Michelin Vietnam**, **RMIT Student Council CFO**) chỉ được xếp thành một dòng chữ xám-xanh tĩnh (`#405e8c`), thiếu hẳn trọng lượng của một hồ sơ kinh doanh – vận hành.
3. **Lạm dụng thủ pháp "Polaroid nghiêng & Thẻ pastel chồng thẻ" ([HomePage.tsx](file:///f:/maiportfolio/src/HomePage.tsx#L26-L42), [refinement.css](file:///f:/maiportfolio/src/refinement.css#L54-L76)):**
   * Cả khu vực dự án (`.featured-stack` với 3 lớp `.stack-page` xoay `+8deg`, `-6deg`, `-2deg`) lẫn khu vực chân dung (`.portrait-shell` xoay `-4deg` kèm `.recognition-note` xoay `+4deg`) đều lặp lại một kiểu khung ảnh viền trắng nghiêng như sổ lưu niệm học sinh. Người xem phải bấm mũi tên thủ công mới xem được từng dự án, làm đứt mạch cảm xúc.
4. **Đơn điệu về nhịp điệu chữ & màu sắc ([styles.css](file:///f:/maiportfolio/src/styles.css#L1-L2), [refinement.css](file:///f:/maiportfolio/src/refinement.css#L1-L3)):**
   * Toàn trang phủ một màu xanh phấn nhạt (`#fafcfe`, `#edf3fc`, `#eaf0f8`), không có điểm neo tương phản sâu. Mọi tiêu đề (`h1`, `h2`, `h3`) đều lặp lại công thức *"Một câu đứng. / Một câu in nghiêng màu xanh."* bằng `Instrument Serif`, gây cảm giác đều đều, thiếu quyết đoán.

---

### 3. Luận đề thị giác mới (Visual Thesis): "THE ARCHITECTURAL LEDGER & KINETIC STAGE"

* **Tinh thần chủ đạo:** **Sổ Cái Kiến Trúc & Sân Khấu Vận Hành Điện Ảnh** — Kết hợp sự chuẩn xác của báo cáo tài chính/dữ liệu cấp điều hành (Swiss FinTech / Architectural Grid) với chuyển động không gian 3D & cuộn phim GSAP (Cinematic Scroll Choreography).
* **Hệ màu (White / Cobalt chủ đạo + Tương phản Ink / Navy sâu):**
  * **Daylight Alabaster (`#F8FAFC` & `#FFFFFF`):** Nền sáng sắc nét như giấy hồ sơ cao cấp cho phần phân tích năng lực.
  * **Signal Cobalt (`#1D4ED8` & `#2563EB`) + Electric Ice (`#93C5FD`):** Màu nhận diện thương hiệu xanh cobalt cường độ cao, thay thế hoàn toàn màu xanh pastel nhợt nhạt hiện tại.
  * **Abyssal Ink / Deep Navy (`#060C18` & `#0B1528`):** Nền tối sâu điện ảnh cho **Section 01 (Hero Stage)** và **Section 02 (Pinned Case Reel)** nhằm tạo độ tương phản thị giác mạnh, tôn vinh ảnh dự án thực tế và ánh sáng WebGL.
  * **Lưới kiến trúc lộ thiên (Exposed Hairlines):** Dùng đường kẻ `1px solid rgba(37, 99, 235, 0.16)` (trên nền sáng) và `1px solid rgba(147, 197, 253, 0.14)` (trên nền Navy) với tọa độ chỉ mục (`[01]`, `[FIN/OPS]`), **cấm tuyệt đối** thẻ bo tròn lồng nhau (`border-radius: 25px–29px`) và khung xoay nghiêng (`rotate(±2–8deg)`).

---

### 4. Hệ thống Typography cụ thể

* **Display & Structural Headlines (`h1`, `h2`):** **`Plus Jakarta Sans`** hoặc **`Syne`** (`font-weight: 700–800`, `letter-spacing: -0.04em`, `line-height: 0.96`). Mang lại vẻ hiện đại, sắc sảo, đáng tin cậy của một chuyên viên Finance & Tech Operations.
* **Editorial Accent (Chỉ dùng điểm xuyết <15%):** Giữ **`Instrument Serif` Italic** (`index.html`) nhưng **chỉ** dùng cho 1–2 từ khóa chuyển ý hoặc trích dẫn chiêm nghiệm cá nhân, xóa bỏ kiểu gãy dòng 2 câu serif lặp đi lặp lại.
* **Body Copy (Kích thước lớn, dễ đọc chuẩn doanh nghiệp):** **`DM Sans`** (`font-weight: 450–500`), cỡ chữ **`20px–22px` (`1.25rem–1.375rem`)** trên desktop (`18px–19px` trên mobile), `line-height: 1.65`, độ rộng dòng tối đa `60ch–65ch`, màu `#1E293B` (trên nền trắng) và `#E2E8F0` (trên nền Navy).
* **Metric & Telemetry Numerals:** **`JetBrains Mono`** hoặc `DM Sans` bật `font-variant-numeric: tabular-nums`, cỡ lớn `clamp(3.25rem, 5.5vw, 5.25rem)` cho các con số thực chứng (`500M+ VND`, `12+`, `15+`, `2,500+`, `160`, `15%+`).

---

### 5. Cấu trúc 4 Phân cảnh Trang chủ & Kịch bản GSAP Pinned/Scroll

Giữ nguyên toàn bộ định tuyến trong [`App.tsx`](file:///f:/maiportfolio/src/App.tsx#L5-L36) (`#/`, `#/journey`, `#/work`, `#/work/:id`, `#/notes`, `#/hello`) và giữ trung thực 100% dữ liệu trong [`content.ts`](file:///f:/maiportfolio/src/content.ts) & [`stories.ts`](file:///f:/maiportfolio/src/stories.ts).

#### SECTION 01 — OPENING COMPOSITION: "THE COMMAND HORIZON" (Full-Bleed 100vw × 100dvh + Pinned GSAP Camera Pass)
* **Hình học Hero (Hero Geometry):**
  * Xóa bỏ hoàn toàn bố cục chia đôi `.home-hero` và khung `.world-shell`.
  * Toàn màn hình (`100vw × 100dvh`) là một **Sân khấu Không gian Đêm Navy & Cobalt (`#060C18` → `#0F244A`)** chia theo lưới kiến trúc 12 cột có đường kẻ `1px` xuyên suốt:
    1. **Thanh Telemetry Đỉnh (Top Status Ledger):**
       * Trái: `NGOC MAI NGUYEN · RMIT B.BUS (FINANCE MAJOR / DIGITAL MARKETING MINOR · EXP. 2027)`
       * Phải (Trạng thái thời gian thực): Chấm tín hiệu xanh + `CURRENTLY AT TIKTOK (BYTEDANCE) — AI DATA SERVICE & OPERATIONS INTERN · ALWAYS DAY 1` *(chỉ nêu đúng vai trò thực tập hiện tại, tuyệt đối không bịa số liệu kết quả tại TikTok)*.
    2. **Cảnh WebGL Three.js Toàn Khung (Refactored [`Desk.tsx`](file:///f:/maiportfolio/src/Desk.tsx)):**
       * Mở rộng canvas Three.js tràn `100vw × 100dvh` làm lớp không gian chủ đạo. Thay vì mặt bàn giấy trắng nhỏ nhắn, đặt 4 khối kiến trúc tương tác (Monolithic Glass/Cobalt Artifacts đại diện cho 4 định tuyến `#/journey`, `#/work`, `#/notes`, `#/hello`) trên mặt phẳng lưới tọa độ tối màu với ánh sáng viền Cobalt (`DirectionalLight` `#3B82F6` + `#DBEAFE`), hiển thị trực tiếp texture ảnh thật `/assets/mai-portrait.webp` và `/assets/checkpoint-workshop.webp` sắc nét.
    3. **Khối Tiêu đề Kiến trúc Cỡ lớn (Monumental Typographic Lockup):**
       * Đặt lệch trục theo lưới cột 1–10:
         **FINANCIAL CLARITY.**
         **OPERATIONAL *FOLLOW-THROUGH.***
       * Đoạn dẫn (`22px`): *"I’m Ngoc Mai Nguyen. I structure complex vendor, budget, and campaign inputs so teams can make confident decisions and execute together."*
    4. **Dải Chỉ số Thực chứng Đáy (4-Cell Live Proof Bar — thay cho `.experience-ribbon`):**
       * Ô 01 — **MICHELIN VIETNAM**: `12+ Vendors · 15+ Proposals · 4+ Depts` (Finance Project Management Intern)
       * Ô 02 — **RMIT STUDENT COUNCIL**: `500M+ VND Budget · 43 Clubs · 2,500+ Attendees` (CFO & Club Day Supervisor)
       * Ô 03 — **RMIT CAREERS**: `160 Students · 3 Workshops · 300+ Booth Chats` (Career Ready Assistant)
       * Ô 04 — **CTM CONSULTING**: `15%+ Monthly Revenue Contribution Share · 5+ Webinars/Mo` (Marketing & Sales Intern)
* **Chuyển động GSAP Section 01:**
  * Ghim nhẹ (`pin: true`, `end: "+=120%"`, `scrub: 0.6`): Khi người dùng bắt đầu cuộn, camera Three.js trong `Desk.tsx` hạ góc nhìn và tiến xuyên qua 4 vật thể (`camera.position.z` từ `11` xuống `7.2`, xoay nhẹ trục `y`), đồng thời 4 ô số liệu ở đáy chạy hiệu ứng đếm số (`tabular-nums` counter) và lớp nền chuyển mượt sang Section 02.

#### SECTION 02 — PINNED CASE ARCHIVE: "EXECUTION IN EVIDENCE" (GSAP ScrollTrigger Pin `360vh`)
* **Hình học & Bố cục (Thay thế hoàn toàn `.featured-stack` polaroid):**
  * Toàn bộ Section 02 được ghim (`pin: true`, `scrub: 0.75`, `end: "+=320%"`) trên nền **Deep Ink `#0B1528`** với khung viền sắc cạnh (`border-radius: 4px`, `1px solid rgba(147,197,253,0.18)`).
  * **Cột trái (4 cột — Locked Telemetry Spine):** Hiển thị bộ đếm `01 / 05` → `05 / 05`, thanh tiến trình dọc bằng tia Cobalt, tên tổ chức, vai trò, và 3 chỉ số kết quả cỡ lớn (`72px tabular-nums`) lấy trực tiếp từ [`studies`](file:///f:/maiportfolio/src/stories.ts#L20-L46).
  * **Cột phải (8 cột — Full-Height Cinema Viewport `80dvh`):** Khung ảnh hoành tráng chiếm trọn chiều cao, hiển thị tuần tự 5 dự án khi cuộn:
    1. **Michelin Vietnam — Green Finance** (`/assets/michelin-team.webp` | `12+` vendors, `15+` proposals, `4+` internal departments, hỗ trợ rà soát `500+` tài liệu kiểm toán thuế 8 năm -> `#/work/michelin`).
    2. **RMIT Student Council — CFO & Club Day** (`/assets/clubday-team.webp` & `/assets/council-meeting.webp` | Ngân sách năm `500M+ VND`, `43` câu lạc bộ, `2,500+` người tham gia tại Beyond the R-CADE, `20+` nhà tài trợ, `30+` bên liên quan -> `#/work/council`).
    3. **RMIT Career Ready Hub — Career Checkpoint** (`/assets/checkpoint-workshop.webp` & `/assets/checkpoint-activity.webp` | `160` sinh viên, `3` workshop *Discover → Apply → Connect*, `88%` tự tin áp dụng công cụ -> `#/work/checkpoint`).
    4. **RMIT Careers — Careers Fair Booth** (`/assets/careers-fair.webp` | Trực tiếp hỗ trợ `300+` sinh viên tại sự kiện quy mô `53` doanh nghiệp & `2,136` người tham dự -> `#/work/careers-fair`).
    5. **CTM Translation & Consulting — Customer Engagement** (`/assets/ctm-event.webp` | Đóng góp `15%+` tỷ trọng doanh thu tháng, `5+` webinar/tháng, phối hợp `4` kênh số Facebook, TikTok, LinkedIn, Website -> `#/work/ctm`).
* **Chuyển động GSAP Section 02:**
  * Mỗi mốc `20%` tiến trình cuộn mở khóa một màn ảnh dự án mới bằng hiệu ứng màn trập dọc (`clipPath: "inset(100% 0% 0% 0%)"` → `"inset(0% 0% 0% 0%)"`), ảnh bên trong thu phóng tinh tế (`scale: 1.1` → `1.0`), trong khi số liệu cột trái trượt dọc (`yPercent: 100` → `0`). Có nút chọn nhanh `01–05` hỗ trợ bàn phím (`ArrowLeft`/`ArrowRight`) để nhảy trực tiếp đến mốc cuộn tương ứng.

#### SECTION 03 — DUAL-TRACK DOSSIER: "FINANCE × DIGITAL MARKETING & HUMAN LEADERSHIP" (Alabaster Daylight Contrast)
* **Hình học & Bố cục (Thay thế `.home-perspective` polaroid nghiêng):**
  * Chuyển sang nền **Trắng Alabaster (`#F8FAFC`)** với hệ khung kẻ chỉ xanh Cobalt `#1D4ED8` sắc nét — tạo cú đảo chiều ánh sáng (light-mode reveal) đầy ấn tượng sau 2 phân cảnh tối.
  * **Cột trái (5 cột — Sticky Architectural Portrait Diptych):**
    * Khung đứng thẳng tuyệt đối (`0deg` rotation), ghép đôi bức chân dung `/assets/mai-portrait.webp` và ảnh nhận giải `/assets/award-portrait.webp` (**RMIT Impactful Leaders Award 2026** — 1 trong 14 sinh viên được vinh danh tại Student Leadership Recognition Awards).
    * Bảng thông số học thuật & công cụ xác thực bên dưới:
      * **Học vấn:** RMIT University Vietnam — Bachelor of Business (Expected 2027) · **Finance Major · Digital Marketing Minor**.
      * **Công cụ:** Excel, Google Workspace, RStudio, Canva, Premiere Pro, CapCut.
      * **Ngôn ngữ:** Tiếng Việt (Bản ngữ) · Tiếng Anh (Thành thạo) · Tiếng Đức (Trung cấp).
  * **Cột phải (7 cột — 3 Trụ cột Thực thi & Dòng thời gian 5 Chương):**
    * Ba khối năng lực từ [`approaches`](file:///f:/maiportfolio/src/content.ts#L19-L23) (*01 Clarity — Make sense of the numbers*, *02 Connection — Bring the right people together*, *03 Ownership — Follow things through*) mở rộng theo cuộn cùng đường dẫn trực tiếp sang 5 chương hành trình (`2024 Student Council` → `2025 CTM` → `2025 RMIT Careers` → `2026 Michelin` → `Now TikTok`) tại `#/journey` và `#/notes`.
* **Chuyển động GSAP Section 03:**
  * Khi cuộn qua 3 trụ cột bên phải, đường kẻ chỉ mục Cobalt vẽ dọc theo trục Y (`scaleY: 0` → `1`), đồng thời khung ảnh bên trái chuyển lớp mặt nạ mượt mà giữa `/assets/mai-portrait.webp`, `/assets/mai-networking.webp` và `/assets/award-portrait.webp`.

#### SECTION 04 — EXECUTIVE DISPATCH: "THE CONVERSATION TERMINAL" (Parallax Curtain Reveal)
* **Hình học & Bố cục (Thay thế `.home-contact` bo tròn màu phấn):**
  * Thiết kế dạng **Architectural Footer Curtain** nền **Cobalt đậm chuyển Navy (`#0B1528` → `#1D4ED8`)** mở lộ dần từ bên dưới Section 03 khi cuộn đến cuối trang.
  * Tiêu đề lớn: **READY FOR THE NEXT OPERATIONAL CHALLENGE.**
  * Cụm hành động trực tiếp, rõ ràng cho nhà tuyển dụng & đối tác:
    * Nút chính cỡ lớn: `ngocmaimia056@gmail.com ↗` kèm nút `Copy Email` phản hồi tức thì.
    * Nút hồ sơ: `Download CV (/ngoc-mai-cv.pdf) ↗` và `LinkedIn Profile ↗`.
    * Bảng điều hướng đầy đủ 4 nhánh: `My path (#/journey)` · `Project stories (#/work)` · `About Mai (#/notes)` · `Say hello (#/hello)`.

---

### 6. Kế hoạch Mobile & Reduced-Motion (`prefers-reduced-motion` / Nút Pause `paused`)

1. **Tương thích nút Pause có sẵn trong [`App.tsx`](file:///f:/maiportfolio/src/App.tsx#L9-L25) (`document.documentElement.dataset.motion = 'off'` & `prefers-reduced-motion: reduce`):**
   * Khi `paused === true` hoặc hệ điều hành bật `prefers-reduced-motion: reduce`, gọi `ScrollTrigger.getAll().forEach(t => t.disable())` (hoặc dùng `gsap.matchMedia()`).
   * **Section 01:** Tắt camera dolly theo cuộn; giữ cảnh Three.js ở khung hình tĩnh đã render chuẩn xác (như cơ chế `dirty` trong [`Desk.tsx`](file:///f:/maiportfolio/src/Desk.tsx#L56)), hiển thị ngay lập tức toàn bộ 4 ô số liệu mà không chờ hiệu ứng đếm.
   * **Section 02:** Hủy ghim (`pin: false`); chuyển 5 dự án thành danh sách 5 thẻ kiến trúc xếp dọc rõ ràng hoặc tab chuyển tức thì (`duration: 0`) bằng bàn phím/click, đảm bảo đọc toàn bộ 5 dự án mà không cần cuộn `360vh`.
2. **Tối ưu trên thiết bị di động (`< 850px`):**
   * Dùng `gsap.matchMedia()` để **không ghim cứng (`pin: false`)** toàn màn hình trên điện thoại nhằm tránh hiện tượng kẹt thanh địa chỉ trình duyệt di động (`100dvh` jitter).
   * **Section 01 Mobile:** Đặt khối tiêu đề + trạng thái TikTok lên trên, cảnh 3D (`height: 360px`, full-bleed ngang) ở giữa với 4 nút điều hướng `min-height: 48px` bên dưới, tiếp theo là lưới 2×2 cho 4 ô số liệu thực chứng.
   * **Section 02 Mobile:** Chuyển thành chuỗi thẻ Full-Bleed dọc có hiệu ứng ghim tiêu đề nhẹ (`position: sticky; top: 72px`) và thanh vuốt ngang có điểm dừng (`scroll-snap-type: x mandatory`) cho phép lướt mượt qua 5 dự án bằng một ngón tay.

---

### 7. Tám Tiêu chí Nghiệm thu Thị giác Cứng (8 Hard Visual Acceptance Criteria)

1. **AC-01 (Xóa bỏ khung nghiêng & polaroid):** Tuyệt đối không còn bất kỳ phần tử nào trên trang chủ dùng `transform: rotate(...)` kiểu scrapbook/polaroid (`.world-offset-frame`, `.world-shell`, `.stack-page`, `.portrait-shell`, `.recognition-note` đều phải ở góc `0deg` sắc nét).
2. **AC-02 (Hero Toàn Cảnh — Không chia đôi đóng hộp):** Section 01 phải mở rộng `100vw × 100dvh` trên desktop; cảnh Three.js [`Desk.tsx`](file:///f:/maiportfolio/src/Desk.tsx) không được nhốt trong khung bo tròn `.world-viewport` `430px` mà phải hòa vào sân khấu kiến trúc kèm bảng 4 chỉ số thực chứng ngay trong màn hình đầu tiên.
3. **AC-03 (Độ tương phản White / Cobalt / Deep Navy):** Phải có sự phân tách độ tương phản cao giữa sân khấu **Deep Navy (`#060C18` / `#0B1528`)**, điểm nhấn **Signal Cobalt (`#1D4ED8` / `#2563EB`)** và nền **Alabaster (`#F8FAFC`)**, đạt chuẩn tương phản chữ tối thiểu WCAG AA (`≥ 4.5:1` cho body copy, `≥ 7:1` cho số liệu chính).
4. **AC-04 (Quy chuẩn Typography & Cỡ chữ Body):** Tiêu đề chính dùng sans-serif kiến trúc (`Plus Jakarta Sans` / `Syne`), giới hạn `Instrument Serif` dưới 15% tổng lượng chữ hiển thị; cỡ chữ body copy đạt `20px–22px` trên desktop và `≥ 18px` trên mobile, số liệu bắt buộc bật `tabular-nums`.
5. **AC-05 (Kịch bản GSAP Pinned Case Reel hoạt động mượt):** Section 02 phải ghim viewport trên desktop (`≥ 900px`) và chuyển mượt qua đúng 5 dự án thực (`michelin`, `council`, `checkpoint`, `careers-fair`, `ctm`) bằng màn trập `clip-path` đồng bộ với thanh chỉ mục `01–05`, hỗ trợ cả cuộn chuột lẫn phím mũi tên.
6. **AC-06 (Bảo toàn 100% tính xác thực dữ liệu):** Mọi con số (`500M+ VND`, `43 clubs`, `2,500+ participants`, `12+ vendors`, `15+ proposals`, `4+ departments`, `160 students`, `3 workshops`, `300+ students`, `15%+ monthly revenue contribution share`) và vai trò hiện tại tại **TikTok (AI Data Service & Operations Intern)** phải khớp tuyệt đối với [`content.ts`](file:///f:/maiportfolio/src/content.ts) và [`stories.ts`](file:///f:/maiportfolio/src/stories.ts); không thêm bất kỳ lời khen, khách hàng hay kết quả TikTok giả định nào.
7. **AC-07 (Sử dụng đúng tài sản ảnh thực trong `public/assets`):** Trang chủ chỉ sử dụng ảnh thật hiện có (`/assets/mai-portrait.webp`, `/assets/award-portrait.webp`, `/assets/michelin-team.webp`, `/assets/checkpoint-workshop.webp`, `/assets/clubday-team.webp`, `/assets/careers-fair.webp`, `/assets/ctm-event.webp`), không dùng ảnh stock hay hình minh họa vector rời rạc.
8. **AC-08 (Bảo toàn Định tuyến & Chế độ Giảm Chuyển động):** Toàn bộ liên kết `#/journey`, `#/work`, `#/work/:id`, `#/notes`, `#/hello`, `mailto:ngocmaimia056@gmail.com`, `/ngoc-mai-cv.pdf` và nút bật/tắt chuyển động (`.motion-switch` / `prefers-reduced-motion: reduce`) phải hoạt động tức thì mà không làm mất nội dung hay gây kẹt cuộn.
