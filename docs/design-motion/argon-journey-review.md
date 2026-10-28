Tóm tắt: Đã rà soát checkpoint `20ae9a9` kèm ảnh chụp xác thực và trực tiếp triển khai các cải tiến chất lượng cảnh 3D, tương tác cảm ứng huy hiệu `>=44px` trên mobile, hiển thị và hiệu năng cho trang Journey.

---

### 1. Phát hiện chất lượng từ mã nguồn & ảnh chụp tại checkpoint `20ae9a9` (Quality Findings)

Qua kiểm tra trực tiếp mã nguồn (`src/JourneyPage.tsx`, `src/JourneyDesk.tsx`, `src/desk/buildJourneyScene.ts`, `src/journey-desk.css`, `src/App.tsx`) và bộ ảnh chụp (`docs/verification/journey-desk-desktop.png`, `journey-desk-council.png`, `journey-desk-mobile.png`):

1. **Chồng lấp giữa Đèn bàn & Khung ảnh RMIT Careers + Cắt cúp cạnh trên khi Focus (`lamp/photo overlap & clipped background objects`)**:
   - Trong `buildJourneyScene.ts`, đèn bàn (`lamp` tại `(-4.35, 0.08, -2.1)`) nằm ngay phía sau khung ảnh RMIT Careers (`frame` tại `(-3.15, 0.12, -1.65)`) theo hướng chiếu trực giao `(7, 9, 12)`. Trên `journey-desk-desktop.png` và `journey-desk-council.png`, chụp đèn màu coral thò ra ngay góc trên-trái của khung ảnh trắng, gây rối hình khối.
   - Trong `JourneyDesk.tsx`, tâm nhìn `focus` đặt thấp (`y = 0.2..0.25`) và khi chọn vật thể tiền cảnh (như sổ tay Council tại `z = 1.12`), `destination.z` dịch về phía trước làm đẩy toàn bộ cụm hậu cảnh (chụp đèn và đỉnh khung ảnh số `3`) chạm sát và bị cắt ở mép trên canvas (`journey-desk-council.png`).
2. **Huy hiệu số (`1`–`5`) đè lên chữ trên vật thể 3D, Tooltip va chạm thanh công cụ & Đích chạm Mobile (`tooltip/marker collisions & mobile touch targets`)**:
   - `anchors` cũ chỉ cộng độ lệch trục Y `(0, y, 0)` vào tâm vật thể nên:
     - Huy hiệu `1` đè thẳng lên chữ `"People."` trên bìa sổ Student Council.
     - Huy hiệu `2` đè lên tiêu đề `"A next step."` trên màn hình điện thoại CTM.
     - Huy hiệu `3` nằm sát mép trên canvas (`y = 24px`), khiến tooltip (`bottom: calc(100% + 7px)`) đâm xuyên lên thanh `.j-desk-toolbar`.
     - Huy hiệu `5` đè thẳng lên chữ `"Always"` trong dòng `"Always Day 1."` trên màn hình laptop TikTok.
   - Trên mobile (`<= 600px`), khi hiển thị huy hiệu số `1`–`5` ở góc vật thể, nếu đặt `pointer-events: none` thì thao tác chạm vào tâm huy hiệu sẽ xuyên qua huy hiệu xuống raycast 3D và trượt khỏi 4/5 vật thể. Do đó cả 5 huy hiệu cần giữ vùng chạm thực tế `>= 44x44px` (`pointer-events: auto; touch-action: pan-y`) trong khi vẫn giữ mặt hiển thị gọn `22x22px`, đồng thời thống nhất xử lý kéo/chạm trên `.j-desk-canvas`.
3. **Độ tương phản chất liệu, chi tiết kỷ vật & Font chữ trên `CanvasTexture` (`material/light & legibility`)**:
   - Bìa hồ sơ Michelin (`folder`) dùng chung vật liệu `sage` (`0xb7cbbb`) với tấm lót bàn (`desk mat`), khiến bìa hồ sơ bị chìm vào nền tấm lót trên `journey-desk-desktop.png`.
   - Thân điện thoại CTM màu `coral` tiệp màu với mặt bàn gỗ birch; tấm thẻ đeo cạnh khung ảnh RMIT Careers (`badge`) là khối trắng trơn chưa có nội dung in; mặt trong bìa sổ Council chưa có lớp giấy lót kem khi mở hé; các `CanvasTexture` dùng font `sans-serif` mặc định thay vì `'Outfit'` và chưa tự vẽ lại sau `document.fonts.ready`.
4. **Chi phí cập nhật DOM mỗi frame & Nội suy Focus (`focus easing & draw cost`)**:
   - Trong vòng lặp `render()` của `JourneyDesk.tsx`, `new THREE.Vector3` được cấp phát mới mỗi frame và `marker.style.transform` bị ghi đè 60 lần/giây cho cả 5 nút ngay cả khi camera đã đứng yên (chỉ có lá cây đung đưa nhẹ).
   - `shadowMap.needsUpdate` chưa tính đến góc mở của bìa sổ (`coverHinge.rotation.z`) và màn hình laptop (`screen.rotation.x`).
5. **Trải nghiệm đọc & Điều hướng chương trên Mobile (`responsive readability & copy`)**:
   - Trên `JourneyPage.tsx`, câu chuyển ý giàu cảm xúc trong `stories.ts` (`story.title` + `story.turn`) chưa được hiển thị ở thẻ tóm tắt chương.
   - Thanh chương `.j-chapters` trên mobile cuộn ngang nhưng chưa tự căn giữa chương đang chọn khi người dùng đổi chương từ bàn 3D hoặc nút mũi tên.
   - Lưu ý về ảnh chụp: hiện tượng thanh header cố định nằm giữa ảnh trong bản chụp full-page khi giữ nguyên `scrollY` là đặc tính chụp màn hình sau khi cuộn (`stage_in_view`), không phải lỗi giao diện thực tế.

---

### 2. Các thay đổi mã nguồn đã triển khai trực tiếp (Implemented Code Changes)

1. **[src/desk/buildJourneyScene.ts](file:///C:/Users/PC/AppData/Local/AgentDesk/wt/11f1d248cc40/r_f8ac9d8a/src/desk/buildJourneyScene.ts)**:
   - Tách vị trí đèn bàn (`lamp` sang `(-4.35, 0.08, -0.78, 0.35)`), ống bút (`pencils` sang `(-3.82, 0.08, 0.52)`) và tinh chỉnh khung ảnh RMIT Careers (`frame` tại `(-2.85, 0.12, -1.52, 0.15)`, chiều cao `1.88`) để chấm dứt hoàn toàn hiện tượng đèn bàn đè sau khung ảnh và bị cắt mép trên.
   - Bổ sung vật liệu `forest` (`0x2f5349`) cho bìa hồ sơ Michelin để tách biệt sắc nét khỏi tấm lót bàn `sage` (`0xb7cbbb`); bổ sung vỏ `navy` (`0x25364f`) viền `coral` cho điện thoại CTM; thêm đĩa tán sáng ấm (`bulbMat` phát sáng nhẹ `0xffc978`) dưới chụp đèn bàn; thêm lớp giấy lót mặt trong bìa sổ Council (`innerCover`) và chi tiết ghi chú có lề trang.
   - In nội dung thẻ đeo `"RMIT CAREERS · Career Checkpoint · Discover → Apply → Connect"` lên bề mặt `badge` cạnh khung ảnh RMIT Careers.
   - Nâng cấp helper `texture()` sử dụng bộ font `"Outfit", "DM Sans", sans-serif` và tự động vẽ lại + gọi `invalidate()` khi `document.fonts.ready` hoàn tất.
   - Dời 5 tọa độ `anchorOffsets` ra góc/viền từng vật thể để huy hiệu `1`–`5` không che khuất chữ trên bìa sổ, màn hình điện thoại, khung ảnh, hồ sơ Michelin và màn hình laptop TikTok (đồng thời giữ nguyên vùng click mesh sổ tay tại `(0.32, 0.55)`).
2. **[src/JourneyDesk.tsx](file:///C:/Users/PC/AppData/Local/AgentDesk/wt/11f1d248cc40/r_f8ac9d8a/src/JourneyDesk.tsx)**:
   - Nâng tâm nhìn cơ sở lên `(0, 0.38, -0.08)` và giới hạn biên dịch chuyển `destination` theo từng chương (`y = 0.44..0.52`, `z <= 0.08`, zoom `1.06` desktop / `1.18` mobile) giúp cả vật thể đang chọn lẫn các vật thể hậu cảnh luôn nằm gọn trong khung nhìn.
   - Mở rộng góc mở bìa sổ Council khi chọn (`0.46 rad`) để lộ rõ trang ghi chú bên trong; đưa độ lệch góc mở bìa sổ và màn hình laptop vào điều kiện cập nhật `shadowMap.needsUpdate`.
   - Tái sử dụng `destination` (`THREE.Vector3`) và bổ sung `markerCache` để chỉ cập nhật DOM (`style.transform`, `dataset.tip`, `dataset.hover`) khi giá trị thực sự thay đổi, đồng thời tự động đổi hướng tooltip (`top`/`bottom`, `-start`/`-end`) khi gần mép canvas và đồng bộ trạng thái hover giữa vật thể 3D với huy hiệu số.
   - Gắn `data-marker={index}` cho 5 nút `.j-markers button`, chuyển bộ lắng nghe pointer (`pointerdown`, `pointermove`, `pointerup`, `pointercancel`, `lostpointercapture`, `pointerleave`) lên `.j-desk-canvas` (`el`) và ưu tiên kiểm tra `[data-marker]` cùng khung `getBoundingClientRect()` `44x44px` của 5 nút trước khi raycast 3D trong `hit(e)`. Nhờ đó thao tác chạm vào tâm từng huy hiệu `1`–`5` trên mobile (`390x844`) chọn chính xác chương `0`–`4`, vẫn giữ kéo xoay ngang bàn, cuộn dọc `pan-y` tự nhiên và chặn chọn nhầm chương sau khi kéo/hủy (`blockClick`).
   - Hỗ trợ phím `Escape` trên vùng bàn 3D để trở về chế độ xem toàn bàn (`Whole desk`) và gắn `aria-pressed={selected < 0}` cho nút `Whole desk`.
3. **[src/JourneyPage.tsx](file:///C:/Users/PC/AppData/Local/AgentDesk/wt/11f1d248cc40/r_f8ac9d8a/src/JourneyPage.tsx)**:
   - Hiển thị thêm câu chuyển ý chân thật từ `stories.ts` (`<p className="j-story-turn">{story.title} <em>{story.turn}</em></p>`) ngay dưới vai trò, giữ nguyên toàn bộ dữ liệu gốc và mục `<details className="j-reflection">`.
   - Thêm `useEffect` tự động cuộn ngang thanh `.j-chapters` (`nav.scrollTo({ left })`) để căn giữa nút chương đang chọn trên màn hình hẹp mà tuyệt đối không làm thay đổi `window.scrollY`.
4. **[src/journey-desk.css](file:///C:/Users/PC/AppData/Local/AgentDesk/wt/11f1d248cc40/r_f8ac9d8a/src/journey-desk.css)**:
   - Bổ sung quy tắc định vị tooltip thông minh theo `data-tip^=bottom`, `data-tip$=-start`, `data-tip$=-end` và hiệu ứng đồng bộ `data-hover=true` khi rê chuột lên vật thể 3D.
   - Trên mọi kích thước màn hình (kể cả `<= 600px`), giữ `.j-markers button` có vùng chạm tương tác `44x44px` (`pointer-events: auto; touch-action: pan-y; cursor: pointer`) trong khi thu gọn mặt tròn hiển thị `.j-markers button > span` xuống `22x22px` (`pointer-events: none`) trên mobile.
   - Định dạng `.j-story-turn` và trạng thái nút `.j-reset[aria-pressed=false]`.

---

### 3. Giới hạn môi trường & Danh sách kiểm thử nghiệm thu cho Codex (Limitations & Acceptance Tests for Codex)

* **Giới hạn môi trường**: Trong phiên chạy headless này của Antigravity (`r_f8ac9d8a`), mọi lệnh shell (`npm`, `python`, `git`) và trình duyệt trực tiếp đều bị chặn theo quy định sandbox. Do đó, quá trình kiểm tra được thực hiện thông qua phân tích mã nguồn, tính toán hình học chiếu trực giao và cập nhật bộ kiểm thử tự động trong `scripts/verify-journey-desk.py`.
* **Kiểm thử nghiệm thu dành cho Codex sau khi Argon hoàn tất**:
  1. Chạy `npm run build` để xác nhận TypeScript và gói bundle Vite biên dịch thành công không có lỗi.
  2. Chạy `python scripts/verify-journey-desk.py` (55 bài kiểm tra tự động bao gồm 6 bài kiểm tra hồi quy chạm tâm huy hiệu mobile):
     - Trên `390x844` (`reduced_motion='reduce'`), xác nhận cả 5 `.j-markers button` có `pointer-events !== 'none'`, kích thước vùng chạm `>= 44x44px` và mặt hiển thị `span` đúng `22x22px`.
     - Đặt lại `Whole desk` trước mỗi lần chạm, gửi sự kiện cảm ứng thực tế (`Input.dispatchTouchEvent` `touchStart` + `touchEnd`) vào chính giữa từng huy hiệu `1`..`5` và xác nhận chọn đúng chương `0`..`4` (`/journey/0`..`/journey/4`).
     - Xác nhận kéo ngang xoay bàn, vuốt dọc cuộn trang tự nhiên (`pan-y`), thanh chương `.j-chapters`, `Pause motion` / `reduced-motion`, offscreen pause và WebGL fallback đều hoạt động nguyên vẹn.
