# Gemini 4 Argon High: design review

### 1. Luận điểm tương tác cốt lõi (Primary Interaction Thesis)

**Cuộn tự nhiên dẫn dắt mạch truyện; sân khấu thị giác cố định đóng vai trò "bàn biên tập bằng chứng" đối chiếu tức thì giữa lời kể, số liệu đã kiểm chứng và tư liệu ảnh gốc — không dùng khung hộp trang trí, không cưỡng ép thao tác cuộn, và mọi chuyển động chỉ phục vụ việc định vị ngữ cảnh của người đọc.**

---

### 2. Đánh giá tổng thể: Tính mạch lạc, độ sinh động và những gì còn mang tính công thức

#### Điểm đã đạt được sự mạch lạc và sinh động thực chất
* **Thoát khỏi bẫy "AI collage" và cấu trúc 3 thẻ cào bằng:** Việc chuyển trang tổng quan sang bố cục hai cột bất đối xứng (`0.78fr / 1.22fr`) với luồng đọc dọc tự nhiên bên trái và sân khấu ảnh `sticky` bên phải giải quyết triệt để cảm giác "ảnh dán lên thẻ giấy" trước đây. Trong trang chi tiết (`.visual-case`), việc thay 3 thẻ quy trình bằng thanh điều hướng 3 bước (`.process-track`) kết hợp khung đối chiếu ảnh – lập luận (`.process-focus`) và `<details>/<summary>` tạo ra nhịp điệu đọc có chiều sâu.
* **Tôn trọng nhịp độ của người đọc:** Không dùng scroll-jacking, không dùng carousel tự chạy vô tận. Cỡ chữ thân bài (`22px–24px`) kết hợp chữ số `tabular-nums` cỡ lớn (`44px–54px`) mang lại cảm giác tự tin, rõ ràng và mang tính biên tập (editorial) trên nền trắng – xanh.

#### Những điểm vẫn còn cảm giác "đại trà" (Generic) và thiếu tính biên tập riêng biệt
1. **Hội chứng "hộp chữ nhật xanh nhạt đồng phục" (`#eef3fa` / `#edf3fb`):** Dù đã bỏ viền giả giấy, mọi hình ảnh ở cả `.reel-screen` (`height: calc(100dvh - 260px)`), `.project-cover` (`430px`), `.process-photo` (`390px`) và `.evidence-sheet` (`440px`) đều bị nhốt vào các khung chữ nhật có chiều cao cố định với nền `#eef3fa`. Đặc biệt, với **Career Checkpoint** (`.frame-checkpoint img { object-fit: contain; background: #fff }`), việc đặt một ảnh `contain` nền trắng lọt thỏm trong khung `.reel-screen` nền `#eef3fa` (trong khi 4 dự án kia dùng `object-fit: cover`) tạo cảm giác như một lỗi hiển thị khung chứa ảnh mẫu (template placeholder) thay vì sự tôn trọng chủ đích đối với tỷ lệ thật của artwork gốc.
2. **Sân khấu ảnh bên phải thiếu ngữ cảnh bằng chứng trực tiếp:** `.reel-viewer-caption` hiện chỉ hiển thị mỗi `studies[active].date` và bộ đếm `01 / 05`. Khi người đọc nhìn sang bức ảnh lớn bên phải, bức ảnh bị tách rời khỏi bằng chứng cụ thể (ví dụ: bức ảnh đang cho thấy điều gì tại RMIT Club Day với 43 câu lạc bộ & 2.500+ người tham gia, hay quy trình điều phối 12+ nhà cung cấp tại Michelin?).
3. **Hiển thị số liệu (`.reel-impact` & `.impact-strip`) còn cào bằng, chưa phân định rõ "đóng góp trực tiếp" và "quy mô sự kiện":** Cách cắt cứng `study.results.slice(0, 2)` với 2 cột đồng dạng khiến mọi con số trông giống KPI quảng cáo. Với dữ liệu thực của Mai, sự minh bạch về phạm vi là yếu tố tạo nên sự tin cậy (đặc biệt ở **Careers Fair**: cần phân biệt rõ *300+ sinh viên Mai trực tiếp hỗ trợ/tương tác* với quy mô chung của toàn sự kiện là *2.136 người tham dự và 53 doanh nghiệp*).
4. **Thanh `.reel-index` 5 cột bằng nhau và sự lệch pha phông chữ cuối bài:** Lưới 5 nút `grid-template-columns: repeat(5, minmax(0, 1fr))` chữ `16px` bên dưới `.reel-screen` vừa nhỏ, vừa lặp lại tư duy chia ô đều nhau. Ngoài ra, ở cuối trang chi tiết, `.outcome-reflection blockquote > p` đột ngột chuyển sang phông có chân `'Instrument Serif'` (`39px`) trong khi toàn bộ hệ thống dùng `'DM Sans'`, tạo cảm giác chắp vá từ một mẫu thiết kế khác.

---

### 3. Phân tích chi tiết theo 6 khía cạnh kỹ thuật và thiết kế

#### A. Tương tác (Interactions)
* **Xung đột trạng thái khi bấm `.reel-index` (Flicker bug):** Hàm `jump(index)` gọi `setActive(index)` ngay lập tức rồi mới gọi `scrollIntoView({ behavior: 'smooth' })`. Trong suốt quãng đường cuộn mượt từ dự án 01 xuống dự án 05, `IntersectionObserver` (với `rootMargin: '-35% 0px -35% 0px'`) vẫn hoạt động và liên tục bắt trúng các dự án 02, 03, 04 đi ngang qua tâm màn hình, gọi `setActive()` đè lên lựa chọn vừa bấm. Kết quả là sân khấu ảnh bên phải bị nháy qua hàng loạt ảnh trung gian.
* **Lệch đồng bộ khi điều hướng bằng bàn phím (`Tab`):** Khi người dùng nhấn `Tab` qua các liên kết `.reel-open` ở cột trái, nếu `<article>` chưa nằm trong vùng `rootMargin` giữa màn hình, `active` không đổi — dẫn đến việc người dùng đang focus vào dự án thứ 2 nhưng sân khấu ảnh bên phải vẫn hiển thị dự án thứ 1.
* **Tiêu đề dự án không bấm được:** Trong `.reel-story`, người dùng có xu hướng nhấp trực tiếp vào `<h2>` (`clamp(49px, 5vw, 76px)`) để mở bài viết, nhưng hiện chỉ có liên kết nhỏ `.reel-open` bên dưới là nhận thao tác click.

#### B. Bố cục (Layout)
* **Nguy cơ tràn dọc ở `.reel-viewer` trên màn hình laptop phổ thông (13–14 inch):** `.reel-viewer` đặt `top: 80px`, bên trong chứa `.reel-screen` (`height: calc(100dvh - 260px)`), cộng thêm `.reel-viewer-caption` (`min-height: 40px`) và `.reel-index` (`min-height: 58px`, thực tế cao hơn khi tên dự án dài xuống 2–3 dòng). Tổng chiều cao vượt quá `100dvh - 80px` trên màn hình cao `768px–820px`, đẩy thanh chỉ mục `.reel-index` chạm hoặc tràn khỏi mép dưới viewport.
* **Độ rộng cột văn bản và khung ảnh:** Ở `.reel-story-text > p`, `max-width: 29ch` với cỡ chữ `24px` hơi hẹp, gây ngắt dòng liên tục; nới lên `34ch–38ch` sẽ tạo nhịp đọc đĩnh đạc hơn. Ở `.evidence-wall`, `.evidence-sheet` cố định `flex: 0 0 70%` và `img { height: 440px }` khiến các ảnh ngang và ảnh dọc bị ép chung một khuôn.

#### C. Nghệ thuật chữ (Typography)
* **Vi phạm cục bộ nguyên tắc "không chữ nhỏ":** Dù văn bản chính đạt `22px–24px`, nhiều nhãn mang thông tin định hướng vẫn bị tụt xuống `16px–18px`: `.reel-index button` (`16px`), `.reel-heading > span` (`17px`), `.reel-viewer-caption` (`17px`), `.process-number` (`17px`), `.case-navigation` (`18px`), `.visual-role > span` (`18px`), `.process-track > button > span:last-of-type` (`18px`). Cần nâng sàn chữ phụ lên `18px–20px`.
* **Tính nhất quán phông chữ:** Loại bỏ `'Instrument Serif'` ở `.outcome-reflection blockquote > p`, chuyển về `'DM Sans'` (`font-weight: 400`, `letter-spacing: -0.035em`) với đường kẻ dọc màu xanh (`border-left: 3px solid var(--blue)`) để giữ đúng tinh thần trực diện, hiện đại.

#### D. Ngữ nghĩa HTML & Khả năng tiếp cận (Semantics & Accessibility)
* **Thứ tự đọc ngược trong `<dl className="reel-impact">`:** Trong JSX, `<dt>{result.label}</dt>` đứng trước `<dd>{result.value}</dd>`, nhưng CSS dùng `.reel-impact dt { order: 1 }` để đẩy nhãn xuống dưới con số. Điều này khiến thứ tự thị giác (*con số → nhãn*) bị ngược với thứ tự đọc của Screen Reader (*nhãn → con số*), và thiếu phần tử mô tả ngữ cảnh phạm vi (như quy mô toàn sự kiện vs. đóng góp cá nhân).
* **Xử lý `inert` và quản lý Focus trong `WorkReel`:** Truyền `inert={active !== index}` trực tiếp trong các phiên bản React < 19 có thể xuất ra `inert="false"` trên DOM (vốn vẫn kích hoạt trạng thái `inert` vì đây là thuộc tính boolean của HTML) hoặc gây cảnh báo; cần đảm bảo chỉ gắn thuộc tính khi ẩn. Ngoài ra, khi bấm `<button>` trong `<nav className="reel-index">`, focus vẫn nằm lại ở nút bấm bên phải thay vì chuyển sang `<article>` hoặc `<h2>` vừa được cuộn tới, khiến lần nhấn `Tab` tiếp theo của người dùng bàn phím bị lạc vị trí.
* **Thiếu vai trò ARIA hoàn chỉnh ở `.process-track`:** CSS đang selector theo `.process-track > button[aria-selected=true]`, nhưng `aria-selected` chỉ hợp lệ khi phần tử mang `role="tab"`, nằm trong vùng chứa `role="tablist"`, và liên kết qua `aria-controls` / `aria-labelledby` tới khung `.process-focus` có `role="tabpanel"`.

#### E. Thiết bị di động (Mobile)
* **Thiếu quy tắc thu gọn triệt để dưới `900px`:** Trong đoạn CSS hiện tại, `.reel-mobile-photo` đang để `display: none` và chưa có khối `@media (max-width: 899px)` đầy đủ để:
  1. Ẩn hoàn toàn `.reel-viewer` (`display: none`) nhằm tránh hiển thị trùng lặp 5 bức ảnh và thanh điều hướng.
  2. Bật `.reel-mobile-photo { display: block; margin-bottom: 24px }` và gỡ bỏ `min-height: 78dvh` trên `.reel-story` (tránh khoảng trắng thừa lớn giữa các dự án khi cuộn dọc trên điện thoại).
  3. Chuyển `.reel-layout`, `.visual-case-intro`, `.process-heading`, `.process-focus`, `.outcome-reflection`, `.next-project-exhibit` và sơ đồ `.map-flow` (`grid-template-columns: 1fr 25px 1.2fr 25px 1fr`) về bố cục 1 cột dọc; chuyển `.process-track` sang dạng xếp chồng dọc để 3 bước quy trình không bị tràn ngang.
  4. Mở rộng `.evidence-sheet` từ `flex: 0 0 70%` lên `flex: 0 0 88%` trên màn hình nhỏ.

#### F. Giảm chuyển động (Reduced Motion)
* **Chưa đồng bộ giữa hệ điều hành và CSS:** Hàm `jump` trong JS chỉ kiểm tra `document.documentElement.dataset.motion === 'off'`, bỏ sót thiết lập hệ thống `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
* **Chuyển động trong CSS chưa được tắt khi bật Reduced Motion:** Cần bổ sung `@media (prefers-reduced-motion: reduce)` và `html[data-motion="off"]` để tắt `transform: translateY(3%) scale(1.025)` trên `.reel-frame`, tắt `@keyframes process-copy-in` / `process-image-in`, và bỏ dịch chuyển mũi tên `.reel-open:hover span`.

---

### 4. Ba cải tiến quan trọng nhất cần thực hiện ngay (Three Most Consequential Refinements)

#### Cải tiến 1: Khóa đồng bộ Cuộn – Nhảy mục – Focus trong `WorkReel` và nâng cấp Sân khấu ảnh thành "Bàn đối chiếu bằng chứng"
* **Cách thực hiện trong JS (`WorkReel`):**
  * Thêm một `useRef` khóa tạm thời (`isProgrammaticScroll`) khi người dùng bấm nút trong `.reel-index`: khi `jump(index)` kích hoạt, tạm bỏ qua callback của `IntersectionObserver` trong khoảng `600ms` (hoặc đến khi sự kiện `scrollend` hoàn tất), sau đó chuyển focus (`sections.current[index]?.focus({ preventScroll: true })`) vào bài viết đích.
  * Thêm `onFocusCapture={() => setActive(index)}` lên `<article className="reel-story">` để khi người dùng nhấn `Tab` đến bất kỳ liên kết nào của dự án, sân khấu ảnh bên phải lập tức cập nhật khớp với dự án đó.
  * Bọc `<h2>` trong liên kết `<a href={`#/work/${study.id}`}>` để tiêu đề lớn có thể nhấp trực tiếp.
  * Thay thế chú thích đơn điệu ở `.reel-viewer-caption` bằng **chú thích bằng chứng thực tế** (`visual.coverAlt` hoặc ngữ cảnh ảnh + thời gian), và biến `.reel-index` thành thanh chỉ mục gọn gàng có chiều cao kiểm soát được (`height: calc(100dvh - 300px)` cho `.reel-screen`).

#### Cải tiến 2: Bỏ kiểu "hộp nền `#eef3fa` đồng phục", tôn trọng tỷ lệ thật của ảnh/artwork gốc và chuẩn hóa cấu trúc hiển thị Số liệu nguồn
* **Xử lý khung ảnh thật vs. recap artwork:**
  * Thay vì ép mọi ảnh vào hộp `#eef3fa` có chiều cao cứng, cho phép `.reel-screen`, `.project-cover` và `.process-photo` thích ứng theo loại tư liệu: với ảnh chụp sự kiện (Club Day, Careers Fair, Michelin), giữ khung tràn sắc nét; với recap artwork gốc hoặc sơ đồ (như **Career Checkpoint**, **CTM**), đặt nền trắng tinh (`background: #fff`) kèm đường viền mảnh `1px solid #d8e4f5` để tôn trọng thiết kế gốc mà không tạo cảm giác "ảnh nhỏ lọt thỏm trong hộp xám".
* **Chuẩn hóa ngữ nghĩa & độ chính xác của số liệu (`.reel-impact` & `.impact-strip`):**
  * Đưa `<dd>` (con số) lên trước `<dt>` (nhãn giải thích) hoặc dùng cấu trúc rõ ngữ nghĩa kèm **ghi chú phạm vi (scope note)** kích thước `18px–20px` để thể hiện chính xác 100% dữ liệu nguồn:
    * **Career Checkpoint:** `160` sinh viên tham gia · `3` workshops · `88%` phản hồi tự tin sử dụng công cụ.
    * **Michelin:** `12+` nhà cung cấp · `15+` đề xuất (proposals) · phối hợp `4+` phòng ban.
    * **Club Day:** `43` câu lạc bộ · `2.500+` người tham gia.
    * **Careers Fair:** `300+` sinh viên Mai trực tiếp hỗ trợ & gắn kết *(thuộc sự kiện quy mô 2.136 người tham dự & 53 doanh nghiệp)*.
    * **CTM:** Hỗ trợ `4` kênh truyền thông · `5+` webinars mỗi tháng.

#### Cải tiến 3: Hoàn thiện Responsive Mobile, chuẩn hóa cỡ chữ phụ (`≥18px`), ARIA Tabs và Reduced Motion trong CSS
* **Cập nhật trực tiếp vào CSS hiện có:**
  * Nâng toàn bộ các nhãn `16px–17px` (`.reel-index button`, `.reel-heading > span`, `.reel-viewer-caption`, `.process-number`) lên `18px–20px`; đổi `blockquote > p` từ `'Instrument Serif'` sang `'DM Sans'`.
  * Bổ sung khối `@media (max-width: 899px)` hoàn chỉnh cho cả `.work-reel` và `.visual-case` (chuyển sang stack 1 cột, bật `.reel-mobile-photo`, ẩn `.reel-viewer`, xếp dọc `.process-track` và `.map-flow`).
  * Bổ sung khối `@media (prefers-reduced-motion: reduce), html[data-motion="off"]` để loại bỏ toàn bộ hiệu ứng scale/translate và giảm thời gian chuyển trạng thái về tức thì.

---

### 5. Tiêu chí nghiệm thu (Acceptance Criteria)

1. **Đồng bộ tương tác & bàn phím (Interaction & Keyboard Parity):**
   * Nhấp vào bất kỳ nút nào trong `.reel-index` sẽ cuộn đến đúng dự án và chuyển thẳng sang ảnh của dự án đó mà **không** làm nhấp nháy ảnh của các dự án nằm giữa.
   * Nhấn phím `Tab` đi qua các dự án ở cột trái luôn đồng bộ bức ảnh đang hiển thị ở cột phải; các nút trong `.process-track` có đầy đủ `role="tab"`, `role="tablist"` và điều khiển `role="tabpanel"`.
2. **Toàn vẹn dữ liệu nguồn & hình ảnh gốc (Source & Visual Fidelity):**
   * Toàn bộ 5 dự án hiển thị đúng số liệu gốc đã kiểm chứng; riêng **Careers Fair** phân biệt rõ con số cá nhân của Mai (`300+` sinh viên trực tiếp tương tác) và quy mô sự kiện (`2.136` người tham dự, `53` công ty).
   * Artwork gốc của **Career Checkpoint** và các tư liệu quy trình không bị đóng khung trong nền xám/xanh lệch tông hay bị cắt xén mất nội dung.
3. **Quy chuẩn chữ & hệ thống thị giác (Typography & Visual System):**
   * Chữ thân bài duy trì ở mức `22px–24px`; không có bất kỳ văn bản chức năng, chú thích hay nút điều hướng nào nhỏ hơn `18px`.
   * Toàn bộ trang dùng thống nhất hệ phông sans-serif trực diện (`DM Sans`) trên bảng màu trắng – xanh; không còn phông serif lạc lõng ở phần trích dẫn cuối bài.
4. **Trải nghiệm Mobile & Reduced Motion (Responsive & Motion Safety):**
   * Ở viewport `< 900px`, `.reel-viewer` ẩn hoàn toàn, `.reel-mobile-photo` hiển thị đúng tỷ lệ phía trên mỗi câu chuyện, không có khoảng trống `78dvh` dư thừa, và sơ đồ `.operations-map` / `.process-track` không gây tràn ngang.
   * Khi hệ điều hành bật `prefers-reduced-motion: reduce` hoặc `data-motion="off"`, thao tác nhảy mục diễn ra tức thì (`instant`) và mọi hiệu ứng `transform` / `keyframes` trên ảnh đều được vô hiệu hóa hoàn toàn.


## Implementation notes

The text-only review received the complete reel component and an excerpt of the stylesheet. The existing mobile stack, ARIA process tabs, React 19 inert support, and global reduced-motion rules were outside parts of that excerpt; those observations were checked against the source before applying changes. The review was completed with Gemini 4 Argon High through the Antigravity CLI, with tool use disabled in the prompt after the AgentDesk worker could not obtain read_file permission. No security settings were changed.

Applied: stable index jumps with scroll-settle cleanup; article focus synchronizes the photograph; linked project titles; original-evidence captions; compact numbered navigation; separate personal and whole-event figures; native artwork proportions; one sans-serif voice in Work; explicit reduced-motion transforms and no small functional labels in the reel.
