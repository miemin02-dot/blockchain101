Dựa trên câu trả lời của bạn — muốn xây **trang thanh toán onchain (USDC Checkout)** cho quán cà phê, biết React/JS nhưng chưa làm blockchain — đây là lựa chọn hoàn hảo để bắt đầu.

---

Đây là plan mình đề xuất:

## Implementation Plan: USDC Coffee Checkout

### Summary
Trang thanh toán onchain cho quán cà phê, cho phép khách hàng kết nối ví và trả tiền bằng USDC trực tiếp trên Arc Testnet. Chủ quán nhận thanh toán vào ví của mình mà không cần trung gian.

### Architecture
- **Blockchain:** Arc Testnet — USDC là gas token, phí rẻ, finality dưới 1 giây
- **Contract:** Không cần smart contract riêng — dùng USDC ERC-20 transfer thẳng đến ví chủ quán
- **Frontend:** React + Tailwind, wagmi để đọc/ghi blockchain, ConnectKit để kết nối ví
- **Wallet:** ConnectKit (hỗ trợ MetaMask, WalletConnect, Coinbase Wallet)

### Files to Create/Modify
1. `src/config.ts` — Cấu hình Arc Testnet chain và wagmi client
2. `src/components/MenuCard.tsx` — Hiển thị món đồ uống với tên, giá USDC, nút "Thanh toán"
3. `src/components/CheckoutModal.tsx` — Modal xác nhận đơn hàng, hiển thị tổng tiền, nút gửi USDC
4. `src/components/PaymentStatus.tsx` — Hiển thị trạng thái giao dịch (đang xử lý / thành công / lỗi)
5. `src/pages/Menu.tsx` — Trang menu chính, danh sách món, kết nối ví ở header
6. `src/App.tsx` — Routing và layout chính, bọc WagmiProvider + ConnectKitProvider
7. `.env` — `VITE_MERCHANT_ADDRESS` (ví nhận tiền của chủ quán)

### Build Sequence
1. Cấu hình wagmi cho Arc Testnet, bọc app với provider
2. Xây trang Menu với danh sách đồ uống (tên + giá USDC cố định)
3. Thêm ConnectKit wallet button vào header
4. Xây CheckoutModal — đọc USDC balance, gửi transfer đến merchant address
5. Xây PaymentStatus — theo dõi transaction hash, hiển thị kết quả
6. Styling toàn bộ UI theo phong cách quán cà phê (Tailwind)

### Done When
- [ ] Khách kết nối ví MetaMask thành công
- [ ] Trang menu hiển thị ít nhất 4-5 món với giá USDC
- [ ] Bấm "Thanh toán" mở modal xác nhận đơn hàng
- [ ] Giao dịch USDC được gửi thành công trên Arc Testnet
- [ ] Hiển thị thông báo "Thanh toán thành công" kèm transaction hash

---

## Ready to build?

Bấm **Approve** để bắt đầu build, hoặc cho mình biết nếu bạn muốn thay đổi gì (ví dụ: thêm lịch sử đơn hàng, QR code cho merchant, hoặc tích hợp onramp để nạp USDC từ tiền mặt). Plan đã được lưu tại `arc-studio-plans/PLAN.md`. Bấm **Approve** để chuyển sang Build mode và bắt đầu xây dựng!
