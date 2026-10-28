Tóm tắt: Đã phân tích mã nguồn và đề xuất hướng nâng cấp bàn học 3D cho trang Hành trình.

---

### 1. Bằng chứng kiểm tra mã nguồn hiện tại (Source Inspection Evidence)

* **Trang chủ hiện tại cần giữ nguyên 100%**: [`HomePage`](file:///f:/maiportfolio/src/HomePage.tsx#L28-L90) cùng [`ProjectShowcase`](file:///f:/maiportfolio/src/InteractiveStories.tsx#L74-L97) và [`AboutPlayground`](file:///f:/maiportfolio/src/InteractiveStories.tsx#L99-L139) đã hoàn thiện cấu trúc Photo Hero (`HeroPortrait` + dải ruy-băng cobalt), trình duyệt dự án tương tác và bộ ảnh cá nhân. Không đưa bàn 3D quay lại `#/`.
* **Vì sao [`Desk`](file:///f:/maiportfolio/src/Desk.tsx#L8-L60) hiện tại (chưa được import) trông "như đồ chơi, mờ và xa" (toy/simple, softness/distant)**:
  1. **Camera đặt quá xa và góc nhìn cao**: Tại [src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L15) (`camera.position.set(9,10,12)`) và trong `ResizeObserver` tại [src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L54) (`camera.position.set(7.1*distance, 8.4*distance, 10.1*distance)` với `fov = 35`), khoảng cách ~15–20 đơn vị làm mặt bàn `10.4 × 6.4` ([src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L26)) lọt thỏm giữa khung hình, khiến các vật thể trở nên nhỏ xíu.
  2. **Ánh sáng phẳng và bóng đổ quá nhòe**: `AmbientLight(0xe7efff, 1.9)` ([src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L17)) quá mạnh kết hợp `RoomEnvironment` blur `.08` ([src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L16)) và `sun.shadow.radius = 5` làm mất tương phản khối; hàm `mat()` ([src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L19)) dùng chung `roughness = .55, metalness = .04` cho hầu hết vật thể nên trông giống nhựa lì đồng chất.
  3. **Hình học cơ bản (primitive geometry) & điều hướng cũ**: `destinations` ([src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L7)) đang trỏ tới 4 trang (`journey`, `work`, `notes`, `hello`) thay vì 5 chương trong [`journeyStories`](file:///f:/maiportfolio/src/stories.ts#L8-L14). Chậu cây (7 khối cầu dẹt lặp vòng tròn tại [src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L48)), tập sách (3 hộp chữ nhật tại [src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L49)) và phong bì thiếu chi tiết cấu tạo đời thực.
* **Cấu trúc [`JourneyPage`](file:///f:/maiportfolio/src/Pages.tsx#L7-L20)**: Đang nhận `{chapter, paused, onChange}` từ [`App`](file:///f:/maiportfolio/src/App.tsx#L32) và hiển thị 5 `<article className="path-story">` theo [`journeyStories`](file:///f:/maiportfolio/src/stories.ts#L8-L14). Khôi phục `Desk` ngay phần mở đầu của `JourneyPage` sẽ biến bàn học 3D thành **bản đồ kỷ vật trực quan cho 5 chặng trưởng thành**, đồng bộ hai chiều với `active` chapter và danh sách bài viết cuộn dọc bên dưới.

---

### 2. Định hướng Nghệ thuật (Art Direction): "Người trẻ đang học hỏi và lớn lên"

* **Tinh thần chủ đạo**: Bàn học thật của một nữ sinh viên RMIT ngành Tài chính & Digital Marketing (dự kiến tốt nghiệp 2027) qua từng cột mốc thử sức — từ công tác sinh viên đến kỳ thực tập tại doanh nghiệp và tập đoàn công nghệ. Không gian ấm áp, gần gũi, có chất liệu giấy viết, bìa hồ sơ, thẻ đeo sự kiện, ảnh kỷ niệm thật và ghi chú tay đúng tinh thần *"Different chapters. Same curious me."* và *"Still learning. Always Day 1."*
* **Những thứ tuyệt đối tránh**:
  * Không làm bàn giám đốc bóng bẩy hay dashboard fintech/agency (không biểu đồ 3D phát sáng, không màn hình đen chữ neon, không số liệu telemetry giả tạo).
  * Không gắn chi chít nhãn chữ nhỏ li ti trên mặt bàn hay nhồi thêm một "bức tường chữ" (wall of text) đè lên cảnh 3D.
  * Không bịa thêm giải thưởng hay chức danh ngoài dữ liệu thật trong [src/stories.ts](file:///f:/maiportfolio/src/stories.ts) và [src/content.ts](file:///f:/maiportfolio/src/content.ts).

---

### 3. Ánh xạ 5 Chương Hành trình thành 5 Cụm Kỷ vật 3D Chi tiết (5-Chapter Artifact Mapping)

Mỗi cụm vật thể (`THREE.Group`) trên bàn đại diện cho đúng 1 phần tử trong [`journeyStories`](file:///f:/maiportfolio/src/stories.ts#L8-L14) (`userData.chapter = 0..4`), kết hợp hình học đa lớp và ảnh thật từ `/assets/...`:

| Chương (`journeyStories`) | Cụm kỷ vật 3D trên bàn & Vị trí gợi ý | Chi tiết hình học, chất liệu & Texture thật | Copy hiển thị trong Focus Panel (Ngắn gọn, chân thật) |
| :--- | :--- | :--- | :--- |
| **0. `2024 · Student Council`**<br>*(CFO & Sponsorship Coordinator)* | **Sổ tay Ngân sách mở hé + Thẻ đeo Ban chấp hành**<br>*(Góc trái tiền cảnh: `x: -2.4, z: 1.05`)* | Nâng cấp `notebook` ([src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L29-L33)): gáy lò xo kim loại (`metalness: 0.65, roughness: 0.22`), bìa vải xanh cobalt (`#204dff`, `roughness: 0.72`), ruột giấy kem dày có vạch trang, kẹp giấy bạc ghim tấm ảnh `/assets/council-portrait.webp` kèm dây đeo thẻ sinh viên có khóa cài. | **Tiêu đề**: *I thought the role was about budgets. It turned out to be about trust.*<br>**Đúc kết**: Làm việc với 45 câu lạc bộ qua 3 học kỳ giúp Mai hiểu rằng lắng nghe và đồng hành quan trọng không kém những bảng tính ngân sách. |
| **1. `2025 · CTM`**<br>*(Marketing & Sales Intern)* | **Bảng kẹp Hồ sơ Chiến dịch (Wooden Clipboard) + Thẻ lịch Webinar & Bút dạ quang**<br>*(Góc trái hậu cảnh: `x: -2.8, z: -0.95`)* | Bảng gỗ sồi ấm (`#d6c3a5`, `roughness: 0.62`) có kẹp kim loại uốn cong ở đỉnh; tờ giấy kế hoạch 4 kênh digital được đánh dấu bằng bút highlight vàng dịu, đính kèm khung ảnh sự kiện `/assets/ctm-event.webp` ở góc. | **Tiêu đề**: *A campaign doesn’t end at the post. Someone still needs a next step.*<br>**Đúc kết**: Kết nối nội dung quảng bá khóa học, webinar hàng tháng và chăm sóc khách hàng thành một trải nghiệm liền mạch. |
| **2. `2025 · RMIT Careers`**<br>*(Career Ready Assistant)* | **Khung ảnh đứng "Career Checkpoint" + Bộ 3 thẻ Workshop (Discover → Apply → Connect)**<br>*(Trung tâm bàn: `x: -0.25, z: -1.15`)* | Nâng cấp `portrait` ([src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L41)): Khung ảnh viền giấy mỹ thuật dày lồng ảnh `/assets/career-team.webp` (hoặc `/assets/checkpoint-workshop.webp`), đặt cạnh đế gỗ cắm 3 tấm thẻ màu xanh nhạt/kem/xanh đậm xếp lớp tượng trưng cho 3 buổi workshop thực hành và chiếc ghim cài nhỏ ghi dấu 4 lần kiên trì ứng tuyển. | **Tiêu đề**: *Four applications. One opportunity. A very different person at the end.*<br>**Đúc kết**: Từ sự rụt rè ban đầu đến việc chủ động lắng nghe sinh viên và đề xuất chuỗi 3 buổi workshop thực tế cho 160 bạn tham gia. |
| **3. `2026 · Michelin`**<br>*(Finance Project Management Intern)* | **Bìa Hồ sơ Dự án Green Finance + Mô hình Tấm Pin Mặt Trời thu nhỏ trên đế gỗ**<br>*(Trung tâm-phải tiền cảnh: `x: 0.55, z: 1.2`)* | Tập hồ sơ bìa cứng xanh navy (`#19325c`) viền gáy vàng nhẹ, mở trang bảng so sánh 15+ đề xuất nhà cung cấp; đặt đè lên góc là mô hình tấm pin mặt trời nghiêng nhẹ (`metalness: 0.5, roughness: 0.18`, mặt chia lưới cell bạc mảnh) và tấm ảnh `/assets/michelin-team.webp`. | **Tiêu đề**: *Different inputs. One shared decision. Clarity is something you build.*<br>**Đúc kết**: Phối hợp thông tin từ 12+ nhà cung cấp và 4+ phòng ban để biến dữ liệu rời rạc thành cơ sở quyết định rõ ràng. |
| **4. `Now · TikTok`**<br>*(AI Data Service & Operations Intern)* | **Laptop mở nghiêng + Thẻ đeo thực tập & Nhãn "Always Day 1"**<br>*(Góc phải bàn: `x: 2.35, z: -0.35`)* | Nâng cấp `laptop` ([src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L35-L39)): Vỏ nhôm bạc ấm (`#cdd5e0`, `metalness: 0.55, roughness: 0.26`), viền màn hình mỏng sắc nét hiển thị ảnh `/assets/tiktok-mai.webp` và thanh trạng thái *"AI DATA SERVICE & OPERATIONS · ALWAYS DAY 1"*. Cạnh máy là sổ tay nhỏ và chiếc máy bay giấy đang bay lên. | **Tiêu đề**: *A new environment. A beginner’s mindset. Always Day 1.*<br>**Đúc kết**: Giữ tinh thần ham học hỏi mỗi ngày khi tìm hiểu cách dữ liệu và quy trình vận hành hỗ trợ sản phẩm công nghệ toàn cầu. |

* **Đạo cụ phụ trợ tạo sức sống (Không nhận click chuyển chương)**:
  * Giữ lại **cốc gốm đựng bút** (`cup` ở góc phải sau, thêm 1 cây thước kẻ và bút chì gỗ có đầu tẩy hồng), **chậu cây nhỏ** (`plant` ở góc trái ngoài cùng, đổi chậu sang màu đất nung sáng `#dfb99b` với lá cong tự nhiên đa kích cỡ thay vì 7 khối cầu giống hệt nhau), và **chiếc máy bay giấy** (`airplane`) bay nhẹ phía trên chương TikTok.

---

### 4. Ánh sáng, Độ sắc nét, Camera & Vật liệu (Lighting, Sharpness & Camera)

Để xử lý triệt để hiện tượng mờ, bệt khối và xa xôi trong [src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L14-L27):

1. **Đưa Camera lại gần 35% & Giảm FOV để lấp đầy khung hình**:
   * Đổi `camera.fov` từ `35` xuống `28` (góc nhìn tương đương ống kính 55mm–60mm, giúp các vật thể trên bàn lớn, chắc khối và ít méo rìa).
   * Trong `ResizeObserver` ([src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L54)), thay công thức khoảng cách xa `(7.1*distance, 8.4*distance, 10.1*distance)` bằng vị trí gần và ấm cúng hơn:
     * `const distance = Math.max(0.92, Math.min(1.32, 1.02 / camera.aspect));`
     * `camera.position.set(4.5 * distance, 5.1 * distance, 6.4 * distance);`
     * `camera.lookAt(0, 0.25, 0.15);`
   * Mặt bàn sẽ chiếm **78%–86% chiều ngang viewport** thay vì nằm lọt thỏm ở giữa.
2. **Nâng cấp Độ phân giải Render & Canvas Texture**:
   * Đặt `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` thay cho giới hạn `1.6` tại [src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L14).
   * Với hàm `texture()` ([src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L22)), tăng kích thước canvas lên `1024×1365` (hoặc nhân hệ số `2x`), bật `t.generateMipmaps = true`, `t.minFilter = THREE.LinearMipmapLinearFilter` và gọi lại việc vẽ canvas sau khi `document.fonts.ready` hoàn tất để chữ trên bìa sổ/màn hình sắc nét tuyệt đối.
3. **Cân chỉnh Ánh sáng & Bóng đổ (Contact Shadows sắc nét)**:
   * Giảm `AmbientLight` từ `1.9` xuống `0.65` và thêm `new THREE.HemisphereLight(0xfffdf8, 0xdbe5f5, 0.75)` để mặt trên vật thể sáng ấm, mặt khuất có sắc xanh dịu tạo khối rõ rệt.
   * Đặt `sun = new THREE.DirectionalLight(0xfffaf0, 3.4)` tại `(-4.5, 8.5, 4.5)`. Thu hẹp vùng phủ bóng đổ (`sun.shadow.camera.left = -5.6; right = 5.6; top = 4.2; bottom = -4.2`) để map `2048×2048` có mật độ điểm ảnh bóng đổ cao gấp đôi; giảm `sun.shadow.radius` từ `5` xuống `2.0`.
   * Giảm độ nhòe `RoomEnvironment` tại [src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L16) từ `.08` xuống `.04` và đặt `scene.environmentIntensity = 0.48` để gáy lò xo, vỏ laptop, kẹp kim loại và mô hình pin mặt trời có điểm bắt sáng (specular highlight) chân thực.
   * Mặt bàn (`desk`): Dùng thiết kế 2 lớp gồm đế bàn màu gỗ sồi sáng ấm (`#e8dfd1`, `roughness: 0.65`) và tấm lót bàn (desk mat) màu giấy kem (`#f7f6f1`, `roughness: 0.85`) bo góc bên trên, tạo đường viền tương phản rõ với nền trang `#f4f4ef` ([src/motion-home.css](file:///f:/maiportfolio/src/motion-home.css#L2)).

---

### 5. Tương tác, Focusing/Story Panel, Cuộn trang, Mobile & Accessibility

1. **Bố cục kết hợp trên [`JourneyPage`](file:///f:/maiportfolio/src/Pages.tsx#L7-L20)**:
   * Đặt khu vực **Interactive Desk Stage** (`.journey-desk-stage`) ngay dưới phần mở đầu `.path-opening` và phía trên danh sách 5 bài viết `.path-story`.
   * Trên Desktop (`>= 960px`): Bố cục 2 cột không đối xứng (`grid-template-columns: 1.45fr 1fr`) gồm **Khung 3D Desk** bên trái và **Story Focus Panel** bên phải.
   * Khi người dùng nhấp chọn một vật thể 3D trên bàn (hoặc chọn nút chương), đồng bộ state `active` của `JourneyPage`:
     * **Trong cảnh 3D**: Vật thể được chọn nâng nhẹ lên (`+0.14` trục Y), đế lót dưới vật thể sáng viền xanh `#204dff`, và điểm nhìn của camera (`lookAtTarget`) dịch chuyển nhẹ (`lerp` 15%–20% về phía tọa độ vật thể đó) tạo hiệu ứng **Focusing** có chiều sâu.
     * **Trong Story Focus Panel**: Hiển thị thẻ tóm tắt chương đang chọn (Năm, Tổ chức, Vai trò `s.role`, Tiêu đề `s.title` + `s.turn`, 1 câu đúc kết `s.carry`), kèm nút chính **"Read chapter story ↓"** (cuộn xuống `<article data-chapter={active}>`) và liên kết phụ sang câu chuyện dự án tương ứng (`#/work/council`, `#/work/ctm`, `#/work/checkpoint`, `#/work/michelin`) nếu chương đó có case study.
2. **Nút thay thế chuẩn Accessibility (Keyboard & Screen Reader)**:
   * Thay 4 nút điều hướng cũ trong [src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L7) bằng **5 nút chọn chương trực tiếp**: `01 · 2024 Student Council`, `02 · 2025 CTM`, `03 · 2025 RMIT Careers`, `04 · 2026 Michelin`, `05 · Now TikTok`.
   * Các nút này là thẻ `<button type="button">` thật, có `aria-pressed={active === i}`, hỗ trợ điều hướng bằng `Tab` và phím mũi tên `ArrowLeft` / `ArrowRight`. Khi một nút nhận `focus`, cảnh 3D tự động focus vào vật thể của chương đó giống hệt khi dùng chuột.
   * Đặt `aria-live="polite"` và `aria-atomic="true"` trên Story Focus Panel để trình đọc màn hình đọc nội dung chương vừa chuyển.
3. **Cuộn dọc tự nhiên (Normal Scroll) & Trải nghiệm Mobile**:
   * Giữ `touch-action: pan-y` trên `.desk-render` và `<canvas>` để thao tác vuốt dọc trên điện thoại luôn cuộn trang mượt xuống phần tiểu sử chi tiết bên dưới, tuyệt đối không khóa cuộn (no scroll hijacking).
   * Trên màn hình hẹp (`< 700px`): Chiều cao vùng 3D thu gọn hợp lý (`320px–360px`), ẩn các nhãn đính nổi đè lên vật thể và chuyển thành thanh 5 nút chọn chương dạng pill ngang (`min-height: 44px`, cuộn ngang nhẹ) nằm ngay sát dưới canvas, tiếp theo là Story Focus Panel gọn gàng.
4. **Hỗ trợ Reduced Motion (`prefers-reduced-motion: reduce` & nút `paused` trên Header)**:
   * Truyền prop `paused` sẵn có của [`JourneyPage`](file:///f:/maiportfolio/src/Pages.tsx#L7) vào `Desk`.
   * Khi `paused === true`:
     * Không chạy chuyển động lơ lửng của máy bay giấy và không xoay bàn theo vị trí con trỏ chuột.
     * Mọi thay đổi góc nhìn camera hoặc độ nâng vật thể khi đổi chương diễn ra tức thì (không `lerp`), chỉ gọi `renderer.render(scene, camera)` đúng 1 frame khi `dirty === true` rồi nghỉ.
     * Thao tác bấm `"Read chapter story ↓"` dùng `scrollIntoView({ behavior: 'instant', block: 'start' })`.

---

### 6. Các bẫy cần tránh khi triển khai (Implementation Pitfalls)

1. **Bẫy tỉ lệ khung hình trong `ResizeObserver`**: Công thức cũ `const distance = Math.max(1, 1.1 / camera.aspect)` ([src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L54)) khiến trên khung hình hẹp hoặc vuông, camera bị đẩy lùi ra cực xa (`distance > 2.0`), làm bàn 3D bé bằng con tem. Cần kẹp trần `Math.min(1.32, ...)` và điều chỉnh nhẹ góc nhìn theo chiều ngang thay vì chỉ lùi xa.
2. **Bẫy vẽ `CanvasTexture` trước khi font tải xong**: [src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L31) vẽ chữ `Instrument Serif` và `DM Sans` ngay trong `useEffect` khởi tạo; nếu webfont chưa tải xong, canvas sẽ vẽ bằng font mặc định rồi giữ nguyên texture bị lỗi. Cần vẽ lại texture và đặt `texture.needsUpdate = true; dirty = true;` sau `document.fonts.ready`.
3. **Bẫy xung đột giữa kéo xoay bàn và click chọn vật thể**: Trong [src/Desk.tsx](file:///f:/maiportfolio/src/Desk.tsx#L52), ngưỡng `Math.abs(e.clientX - downX) > 5` trên màn hình cảm ứng rất dễ bị vượt qua khi người dùng chỉ muốn chạm (tap) vào vật thể. Nên nâng ngưỡng phân biệt drag/tap lên `8px–10px` và kiểm tra cả trục Y để không nuốt mất thao tác tap trên mobile.
4. **Bẫy lệch màu nền giữa CSS cũ và mới**: [src/styles.css](file:///f:/maiportfolio/src/styles.css#L1) dùng nền `#f8fbff`, trong khi [src/motion-home.css](file:///f:/maiportfolio/src/motion-home.css#L2-L6) đã chuyển toàn bộ `.portfolio-world` sang bảng màu giấy ấm `#f4f4ef`, chữ `#10151b` và xanh `#204dff`. Bàn 3D và Story Focus Panel cần dùng đúng bảng màu `#f4f4ef` / `#204dff` để ăn nhập hoàn toàn với phần còn lại của trang.
5. **Bẫy rò rỉ bộ nhớ WebGL khi chuyển route**: Khi người dùng chuyển qua lại giữa `#/`, `#/journey`, `#/work`, cần đảm bảo mọi `BufferGeometry`, `Material`, `Texture` (kể cả texture tải từ `TextureLoader` và `PMREMGenerator`) đều được đưa vào mảng `resources` để `dispose()` sạch sẽ khi unmount.

---

### 7. 8 Tiêu chí Nghiệm thu (8 Acceptance Checks)

1. **Bảo toàn Trang chủ (`#/`)**: Trang chủ giữ nguyên 100% bố cục hiện tại (`HeroPortrait`, `ProjectShowcase`, `AboutPlayground`), không bị thay thế hay xáo trộn bởi bàn 3D.
2. **Khôi phục đúng vị trí tại `JourneyPage` (`#/journey` & `#/journey/0..4`)**: Bàn học 3D xuất hiện tại phần mở đầu của trang `My path`, hoạt động bằng cảnh Three.js thật và có trạng thái dự phòng (fallback) an toàn nếu WebGL không khả dụng.
3. **Đầy đủ 5 cụm kỷ vật ứng với 5 chương thật**: Trên mặt bàn có đủ 5 cụm vật thể đại diện chính xác cho *RMIT Student Council (2024)*, *CTM (2025)*, *RMIT Careers (2025–2026)*, *Michelin (2026)* và *TikTok (Now)*, sử dụng chất liệu đa dạng và ảnh thật từ `/assets/...`.
4. **Khắc phục triệt để cảm giác xa/mờ/đồ chơi**: Camera gần và rõ (mặt bàn chiếm ~75–85% chiều ngang khung nhìn), pixel ratio đạt tới `2`, bóng đổ và ánh sáng có chiều sâu, bề mặt có đế bàn/tấm lót bàn và chi tiết hình học sắc nét.
5. **Đồng bộ tương tác 2 chiều với Story Focus Panel và bài viết**: Nhấp vào từng vật thể 3D (hoặc nút chương) sẽ làm nổi bật vật thể đó, hướng nhẹ góc nhìn tới vật thể, cập nhật nội dung chân thật không quá 3–4 dòng trong Story Focus Panel, và cho phép cuộn mượt xuống đúng bài viết `<article>` của chương tương ứng (và ngược lại khi truy cập `#/journey/0..4`).
6. **Chuẩn Accessibility & Điều khiển bàn phím**: Có đủ 5 nút chọn chương bằng HTML `<button>` chuẩn (`aria-pressed`, `focus-visible` rõ nét), dùng được hoàn toàn bằng bàn phím (`Tab`, `Enter`/`Space`, phím mũi tên) và có vùng `aria-live="polite"` thông báo chương đang chọn.
7. **Cuộn dọc tự nhiên & Thân thiện Mobile**: Không khóa cuộn dọc (`touch-action: pan-y` hoạt động mượt trên cả chuột lẫn cảm ứng); trên màn hình `<= 700px`, các nút chương và Story Focus Panel xếp gọn, kích thước chạm tối thiểu `44×44px`, không đè lấp vật thể 3D.
8. **Tôn trọng Reduced Motion & Nút Pause**: Khi bật `prefers-reduced-motion: reduce` hoặc nhấn nút tạm dừng chuyển động (`paused`) trên thanh header, toàn bộ chuyển động tự động/nội suy trong cảnh 3D dừng ngay lập tức, chỉ render khi có tương tác đổi trạng thái.
