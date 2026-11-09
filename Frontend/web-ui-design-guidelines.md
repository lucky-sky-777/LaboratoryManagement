# Quy chuẩn thiết kế giao diện Web

> Tài liệu quy định thống nhất về phong cách, bố cục và cách triển khai giao diện web. Mục tiêu là tạo ra sản phẩm hiện đại, dễ sử dụng, nhất quán và có khả năng mở rộng.
>
> **Phong cách chủ đạo:** tối giản, rõ ràng, thân thiện, chuyên nghiệp.  
> **Tông màu chính:** xanh lá.

---

## 1. Nguyên tắc thiết kế

1. **Nhất quán:** Các trang phải dùng chung hệ thống màu sắc, kiểu chữ, khoảng cách, bo góc, đổ bóng và quy tắc component.
2. **Ưu tiên khả năng sử dụng:** Người dùng phải dễ nhận biết nội dung, hành động chính và trạng thái hiện tại.
3. **Đơn giản, có thứ bậc:** Tránh nhồi nhét thông tin, trang trí dư thừa hoặc sử dụng quá nhiều màu nhấn.
4. **Phản hồi rõ ràng:** Mọi thao tác cần có phản hồi phù hợp như loading, success, error hoặc disabled.
5. **Responsive:** Giao diện phải hoạt động tốt trên desktop, tablet và mobile.
6. **Accessibility:** Đảm bảo độ tương phản, điều hướng bằng bàn phím và nhãn dễ hiểu cho các thành phần tương tác.

## 2. Hệ thống màu sắc

### 2.1. Bảng màu thương hiệu

Sử dụng xanh lá làm màu nhận diện và màu nhấn chính. Không dùng màu xanh lá đậm cho toàn bộ nền trang.

| Token | Mã màu | Mục đích |
|---|---|---|
| `primary-50` | `#F0FDF4` | Nền xanh rất nhạt, vùng được chọn nhẹ |
| `primary-100` | `#DCFCE7` | Nền phụ, badge nhẹ |
| `primary-200` | `#BBF7D0` | Viền hoặc trạng thái hover nhẹ |
| `primary-300` | `#86EFAC` | Thành phần trang trí, biểu đồ |
| `primary-400` | `#4ADE80` | Màu nhấn phụ |
| `primary-500` | `#22C55E` | Màu thương hiệu |
| `primary-600` | `#16A34A` | Nút chính, liên kết, icon nhấn |
| `primary-700` | `#15803D` | Hover của nút chính |
| `primary-800` | `#166534` | Nội dung xanh đậm trên nền sáng |
| `primary-900` | `#14532D` | Điểm nhấn đậm, tiêu đề đặc biệt |

### 2.2. Màu trung tính

| Token | Mã màu | Mục đích |
|---|---|---|
| `background` | `#F8FAF9` | Nền tổng thể của ứng dụng |
| `surface` | `#FFFFFF` | Card, modal, dropdown, bảng |
| `surface-muted` | `#F1F5F2` | Nền khu vực phụ hoặc hover trung tính |
| `border` | `#E2E8E4` | Đường viền và đường phân cách |
| `text-primary` | `#17211B` | Nội dung chính, tiêu đề |
| `text-secondary` | `#647067` | Mô tả, nhãn phụ |
| `text-muted` | `#8A948D` | Placeholder, thông tin ít quan trọng |
| `white` | `#FFFFFF` | Chữ trên nút nền đậm |

### 2.3. Màu trạng thái

| Trạng thái | Màu nền gợi ý | Màu chữ gợi ý |
|---|---|---|
| Success | `#DCFCE7` | `#166534` |
| Warning | `#FEF3C7` | `#92400E` |
| Error | `#FEE2E2` | `#991B1B` |
| Info | `#DBEAFE` | `#1D4ED8` |

### 2.4. Quy tắc sử dụng màu

- Màu xanh lá chỉ nên chiếm khoảng **5–15% diện tích nhìn thấy** trên các trang nội dung thông thường; ưu tiên dùng cho hành động chính, trạng thái được chọn và điểm nhấn.
- Nền trang chủ yếu dùng `background`; card và vùng nhập liệu dùng `surface`.
- Không dùng nhiều sắc xanh lá đậm cạnh nhau nếu không có phân cấp rõ ràng.
- Không dùng màu thương hiệu để biểu thị lỗi hoặc cảnh báo.
- Không chỉ dựa vào màu sắc để truyền đạt trạng thái; cần có chữ, icon hoặc dấu hiệu bổ sung.
- Chữ trên nền xanh đậm nên dùng màu trắng; chữ trên nền xanh nhạt nên dùng màu xanh đậm.

## 3. Typography

### 3.1. Font chữ

- Ưu tiên `Inter` cho giao diện hiện đại; có thể dùng `Roboto` hoặc font sans-serif tương đương nếu Inter không khả dụng.
- Khai báo fallback: `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Không dùng quá hai họ font trong cùng một sản phẩm.

### 3.2. Thang kích thước

| Thành phần | Kích thước tham khảo | Độ đậm |
|---|---:|---:|
| H1 / tiêu đề trang | 28–32px | 700 |
| H2 / tiêu đề khu vực | 22–24px | 600–700 |
| H3 / tiêu đề card | 18–20px | 600 |
| Nội dung chính | 14–16px | 400 |
| Nhãn / nội dung phụ | 12–14px | 400–500 |
| Chú thích nhỏ | 11–12px | 400 |

- Nội dung thông thường nên dùng `14px` hoặc `16px`.
- Line-height nội dung nên nằm trong khoảng `1.45–1.65`.
- Không dùng quá nhiều kiểu chữ đậm trong cùng một khu vực.
- Tiêu đề phải thể hiện rõ thứ bậc, không dùng kích thước lớn chỉ để trang trí.

## 4. Bố cục và khoảng cách

### 4.1. Lưới bố cục

- Dùng hệ thống spacing theo bội số của `4px`.
- Khoảng cách phổ biến: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `40px`, `48px`.
- Nội dung chính desktop nên có chiều rộng tối đa khoảng `1200–1440px`, tùy loại trang.
- Căn chỉnh các khu vực theo cùng một trục lề trái/phải.
- Dùng khoảng trắng để phân nhóm nội dung thay vì thêm nhiều đường viền.

### 4.2. Khung ứng dụng

Đối với ứng dụng quản trị hoặc quản lý nghiệp vụ, có thể sử dụng cấu trúc:

- **Sidebar:** điều hướng chức năng chính; có trạng thái active rõ ràng.
- **Topbar:** tên trang hoặc breadcrumb, tìm kiếm (nếu cần), thông báo và tài khoản người dùng.
- **Main content:** tiêu đề trang, mô tả ngắn, hành động chính và nội dung.
- **Mobile:** sidebar chuyển thành drawer hoặc thanh điều hướng phù hợp; topbar cần gọn.

Không bắt buộc mọi trang phải có đủ các khu vực trên. Chỉ giữ những thành phần thực sự cần thiết cho chức năng của trang.

### 4.3. Card và vùng nội dung

- Card dùng nền trắng, viền mảnh hoặc đổ bóng rất nhẹ.
- Padding card phổ biến: `16px`, `20px` hoặc `24px`.
- Các card cùng cấp nên có khoảng cách, bán kính bo góc và cách đặt tiêu đề nhất quán.
- Tránh lồng quá nhiều card vào nhau.

## 5. Quy chuẩn component

### 5.1. Button

Các loại nút cần được phân biệt rõ:

- **Primary:** nền `primary-600`, chữ trắng; dành cho hành động chính của màn hình.
- **Secondary:** nền trắng hoặc `surface-muted`, chữ `text-primary`, có viền nhẹ.
- **Outline:** nền trong suốt, viền trung tính hoặc xanh lá; dùng cho hành động phụ.
- **Ghost:** không có nền mặc định; dùng trong toolbar hoặc thao tác ít nổi bật.
- **Danger:** dùng màu đỏ cho thao tác có tính phá hủy như xóa.

Quy tắc:

- Mỗi khu vực chỉ nên có một hành động primary nổi bật nhất.
- Chiều cao nút thông thường từ `36–44px`; vùng chạm trên mobile nên đạt tối thiểu khoảng `44px`.
- Có trạng thái `default`, `hover`, `focus`, `active`, `disabled` và `loading`.
- Nút chỉ có icon phải có tooltip hoặc nhãn hỗ trợ để người dùng hiểu chức năng.

### 5.2. Input và Form

- Label đặt phía trên trường nhập liệu, dùng tên ngắn và rõ nghĩa.
- Placeholder chỉ là gợi ý, không thay thế label.
- Trường bắt buộc cần được đánh dấu rõ ràng.
- Lỗi validation hiển thị gần trường tương ứng, kèm thông điệp có hướng xử lý.
- Giữ nguyên dữ liệu người dùng đã nhập khi xảy ra lỗi nếu có thể.
- Dùng đúng loại input: email, password, number, date, search...
- Không hiển thị lỗi ngay khi người dùng chưa có cơ hội tương tác, trừ trường hợp cần thiết.

### 5.3. Table

- Bảng cần có tiêu đề cột rõ ràng và căn chỉnh dữ liệu nhất quán.
- Nội dung văn bản căn trái; số liệu căn phải hoặc căn theo một quy ước thống nhất.
- Hàng có thể có hiệu ứng hover nhẹ để hỗ trợ theo dõi.
- Phân biệt rõ trạng thái selected, disabled và loading.
- Nếu bảng có nhiều dữ liệu, cần hỗ trợ phân trang, lọc hoặc tìm kiếm phù hợp.
- Trên mobile, cho phép cuộn ngang có chủ đích hoặc chuyển dữ liệu thành dạng card; không ép bảng co đến mức khó đọc.
- Có trạng thái empty state khi không có dữ liệu và thông báo lỗi khi tải thất bại.

### 5.4. Dialog, Modal và Drawer

- Chỉ dùng modal cho tác vụ cần tập trung hoặc xác nhận.
- Tiêu đề modal phải nói rõ mục đích.
- Có hành động đóng hoặc hủy dễ nhận biết.
- Với thao tác nguy hiểm, nêu rõ hậu quả trước khi xác nhận.
- Không mở modal chồng nhiều tầng nếu có thể tránh.
- Drawer phù hợp với bộ lọc, menu hoặc form phụ trên màn hình nhỏ.

### 5.5. Badge và trạng thái

- Badge chỉ hiển thị trạng thái hoặc thông tin ngắn.
- Dùng màu trạng thái theo mục 2.3.
- Nhãn phải ngắn, dễ hiểu và nhất quán trong toàn hệ thống.
- Không dùng badge chỉ để trang trí hoặc làm nổi bật mọi thông tin.

### 5.6. Navigation

- Mục đang được chọn cần có nền hoặc dấu hiệu active rõ ràng bằng màu xanh lá nhạt/đậm phù hợp.
- Nhóm chức năng phải được sắp xếp theo logic nghiệp vụ.
- Không đặt quá nhiều mục ngang cấp trong một sidebar.
- Tên mục điều hướng nên ngắn, ưu tiên danh từ hoặc cụm từ quen thuộc.
- Icon phải cùng phong cách và kích thước tương đối đồng nhất.

## 6. Icon, hình ảnh và biểu đồ

- Ưu tiên dùng một bộ icon thống nhất, ví dụ Lucide.
- Icon thông dụng có kích thước `16px`, `18px`, `20px` hoặc `24px`.
- Không trộn icon outline và filled tùy tiện.
- Icon phải hỗ trợ ý nghĩa của nội dung, không thay thế nhãn ở những chức năng khó đoán.
- Ảnh cần đúng tỷ lệ, không kéo giãn; ưu tiên `object-fit: cover` khi ảnh nằm trong khung cố định.
- Biểu đồ nên dùng xanh lá làm màu chính, kết hợp màu phụ có độ tương phản tốt. Không dùng nhiều sắc xanh gần giống nhau cho các chuỗi dữ liệu khó phân biệt.
- Luôn cung cấp nhãn, chú giải hoặc tooltip cho dữ liệu biểu đồ.

## 7. Trạng thái giao diện và phản hồi

Mỗi chức năng có tải dữ liệu hoặc gửi yêu cầu cần xem xét các trạng thái sau:

1. **Loading:** hiển thị spinner, skeleton hoặc trạng thái đang xử lý; tránh để màn hình trống.
2. **Success:** thông báo ngắn gọn khi thao tác hoàn tất, nếu người dùng cần biết kết quả.
3. **Error:** nêu vấn đề bằng ngôn ngữ dễ hiểu và hướng xử lý tiếp theo.
4. **Empty:** giải thích vì sao chưa có dữ liệu và đưa ra hành động tiếp theo khi phù hợp.
5. **Disabled:** thể hiện rõ thành phần không thể tương tác.
6. **Permission denied:** giải thích người dùng không có quyền thực hiện thao tác; không chỉ ẩn lỗi một cách khó hiểu.

Không hiển thị thông báo thành công khi yêu cầu chưa được máy chủ xác nhận.

## 8. Responsive

Thiết kế theo hướng mobile-first hoặc đảm bảo tối thiểu các mức hiển thị sau:

| Thiết bị | Chiều rộng tham khảo | Quy tắc |
|---|---:|---|
| Mobile | dưới `640px` | Một cột; thao tác dễ chạm; nội dung ưu tiên |
| Tablet | `640–1023px` | Có thể dùng hai cột; sidebar thu gọn |
| Desktop | từ `1024px` | Bố cục nhiều cột; tận dụng không gian hợp lý |

- Không để nội dung tràn khỏi viewport.
- Không phụ thuộc vào hover để người dùng truy cập chức năng.
- Form trên mobile thường nên xếp theo một cột.
- Giảm mật độ thông tin ở màn hình nhỏ; không chỉ thu nhỏ toàn bộ desktop layout.
- Kiểm tra ở cả chiều rộng hẹp và rộng, cũng như khi zoom trình duyệt.

## 9. Accessibility và khả năng sử dụng

- Đảm bảo nội dung có thể sử dụng bằng bàn phím; focus phải nhìn thấy rõ.
- Dùng thẻ HTML đúng ngữ nghĩa (`button`, `nav`, `main`, `form`, `label`,...).
- Mỗi input phải có label liên kết đúng.
- Không dùng màu sắc làm tín hiệu duy nhất.
- Đảm bảo độ tương phản văn bản theo WCAG 2.2 AA khi có thể: tối thiểu `4.5:1` với văn bản thông thường và `3:1` với văn bản lớn.
- Nút và vùng tương tác phải đủ lớn, có khoảng cách hợp lý.
- Hỗ trợ `prefers-reduced-motion`; tránh animation gây khó chịu.
- Nội dung thông báo động cần được công nghệ hỗ trợ tiếp cận nhận biết khi phù hợp.

## 10. Animation và hiệu ứng

- Chỉ dùng animation để hỗ trợ hiểu trạng thái hoặc chuyển đổi giao diện.
- Thời lượng phổ biến khoảng `150–250ms`.
- Ưu tiên transition nhẹ cho màu sắc, opacity, shadow và transform.
- Không lạm dụng hiệu ứng nảy, xoay, parallax hoặc animation liên tục.
- Tránh làm chậm thao tác hoặc khiến người dùng phải chờ hiệu ứng mới tiếp tục được.

## 11. Quy ước triển khai frontend

- Tạo design token tập trung cho màu sắc, spacing, radius, shadow và typography; không rải mã màu tùy ý trong từng component.
- Tách component dùng lại khi có cùng cấu trúc hoặc hành vi; tránh tạo abstraction quá sớm.
- Component cần có API/props rõ ràng và tên thể hiện đúng chức năng.
- Phân biệt component trình bày với logic gọi API hoặc xử lý nghiệp vụ khi phù hợp.
- Không dùng inline style cho các giá trị thiết kế lặp lại; ưu tiên CSS variables, CSS modules, Tailwind config hoặc cơ chế theme đang dùng trong dự án.
- Không tạo nhiều biến thể component chỉ khác một vài giá trị nhỏ nếu có thể cấu hình bằng props hoặc variant.
- Không để nội dung quan trọng chỉ xuất hiện trong console; cần có phản hồi trên giao diện.
- Dùng dữ liệu thực tế để kiểm tra độ dài tên, số lượng bản ghi, nội dung rỗng và lỗi mạng.

## 12. Checklist trước khi hoàn thành một trang

- [ ] Giao diện sử dụng đúng tông xanh lá và các design token thống nhất.
- [ ] Có phân cấp rõ ràng giữa tiêu đề, nội dung, mô tả và hành động.
- [ ] Khoảng cách, căn lề, bo góc và kiểu chữ nhất quán.
- [ ] Hành động chính và hành động phụ được phân biệt.
- [ ] Có đầy đủ loading, error, empty và disabled state khi cần.
- [ ] Form có label, validation và thông báo lỗi rõ ràng.
- [ ] Bảng và nội dung dài vẫn sử dụng được trên màn hình nhỏ.
- [ ] Có thể điều hướng bằng bàn phím và nhìn thấy focus.
- [ ] Màu chữ/nền có độ tương phản phù hợp.
- [ ] Không có tràn nội dung, lệch bố cục hoặc thành phần bị che khuất.
- [ ] Không có hiệu ứng hoặc thành phần trang trí gây cản trở thao tác.

---

## 13. Ví dụ design token CSS

Có thể dùng bộ token sau làm điểm khởi đầu. Nếu dự án đã có hệ thống theme, hãy ánh xạ các giá trị này vào hệ thống hiện tại thay vì tạo thêm một hệ thống song song.

```css
:root {
  /* Brand: green */
  --color-primary-50: #F0FDF4;
  --color-primary-100: #DCFCE7;
  --color-primary-200: #BBF7D0;
  --color-primary-300: #86EFAC;
  --color-primary-400: #4ADE80;
  --color-primary-500: #22C55E;
  --color-primary-600: #16A34A;
  --color-primary-700: #15803D;
  --color-primary-800: #166534;
  --color-primary-900: #14532D;

  /* Neutral */
  --color-background: #F8FAF9;
  --color-surface: #FFFFFF;
  --color-surface-muted: #F1F5F2;
  --color-border: #E2E8E4;
  --color-text-primary: #17211B;
  --color-text-secondary: #647067;
  --color-text-muted: #8A948D;

  /* Status */
  --color-success-bg: #DCFCE7;
  --color-success-text: #166534;
  --color-warning-bg: #FEF3C7;
  --color-warning-text: #92400E;
  --color-error-bg: #FEE2E2;
  --color-error-text: #991B1B;
  --color-info-bg: #DBEAFE;
  --color-info-text: #1D4ED8;

  /* Typography */
  --font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
}

body {
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  background: var(--color-background);
}
```

**Quy tắc cuối cùng:** Khi có xung đột giữa tính thẩm mỹ và khả năng sử dụng, ưu tiên khả năng sử dụng. Mọi trang mới cần tuân theo hệ thống design token và component chung, chỉ tạo ngoại lệ khi có lý do nghiệp vụ rõ ràng.
