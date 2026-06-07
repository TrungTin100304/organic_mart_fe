import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import type { Order } from "../services/orderService";

const fallbackOrder: Order = {
  id: 0,
  orderCode: "OM-92834",
  userId: 0,
  userFullName: "Nguyễn Minh Anh",
  addressId: 0,
  addressLabel: "Nhà riêng",
  shippingRecipientSnapshot: "Nguyễn Minh Anh",
  shippingPhoneSnapshot: "0901 234 567",
  shippingAddressSnapshot: "427 Gardenia Avenue, Căn hộ 4B, Brooklyn, NY 11201",
  shippingProviderNameSnapshot: "GreenExpress",
  promotion: null,
  subtotal: 542000,
  discountAmount: 0,
  shippingFee: 0,
  totalAmount: 587200,
  status: "shipped",
  note: "Gọi trước khi giao hàng khoảng 10 phút.",
  createdAt: "2024-10-24T10:45:00.000Z",
  updatedAt: "2024-10-24T13:30:00.000Z",
  details: [
    {
      id: 1,
      productId: 101,
      productName: "Bơ hữu cơ",
      productSlug: "bo-huu-co",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAT7zNFLcyz7wcznuewHt-MvZKZjw8qEegES2hCfpK-5bbPO0vdsq1AqszKqg1Y4xV_mloa-P9sNs452Mgv-Bq3_KH2sJyenpbqHq-oO0i6l2PrGVfezIn-PrE-dp7J8N5tmkyg7dCGGeAV9GatzFPyclkVZjGwZWc5nqRIP9wxm88ADomDB1gY1LUf5wwMYpgjmk9CdAMHovnHsb5XWwJeeo_iOWv5JLik5mEm6spMyjyM-Jb1qpSldNCLwfhBbhAWLiRl_gUiPlo",
      batchId: 123,
      batchCode: "AVO-24-A",
      quantity: 2,
      unit: "quả",
      priceAtPurchase: 25000,
      lineSubtotal: 50000,
    },
    {
      id: 2,
      productId: 102,
      productName: "Cải xoăn tươi",
      productSlug: "cai-xoan-tuoi",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAY8Hbit4Pe62-NTCPlJ430EC45Irb7w0599HpDg5Ncy6WReFcOViq8rdVZKvX2AGt8GF9h_c8TasUY0JfzNwslvm7vbb96TSf_1a0n0c0GFn7KJEsecA-ZixoMyN9QNe-7sSDsFUy_GY20dSqHaBcL7bgAaDIHm8MWLydakN6Mct-wWcOZAoQ65zvYN4mKqSYDMjT6IYUSJw8NcL8ptkSQ4Ic50OZJZtGE7vlsj_NTuXfVTvpjNNCzo2xKnBtrJrzDiXisA_gx7n0",
      batchId: 124,
      batchCode: "KAL-24-B",
      quantity: 1,
      unit: "bó lớn",
      priceAtPurchase: 42000,
      lineSubtotal: 42000,
    },
    {
      id: 3,
      productId: 103,
      productName: "Cà rốt hữu cơ",
      productSlug: "ca-rot-huu-co",
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBIso7g4m1fG3mY3MDNBd3tYkgMNVJBHVvr1MXk34w6zhItaVHMOFHy1dzb1oh3PKpvYFhwAPn_GOPAIPingGO7XIUHEk4ZvjWqjlcqErwtMgTR-uKRlwUE7W688ZvUxTgG3rIEKPYnegY7aAOvJWi1liqo0n0-juOCbohzpWBWp4uq_h3rTHsocuRBVx5yIjIvt6FJP7mCNBZNfohGa_4DiJ9p-WxvOhBhvsXnNcuUUS5U33t5DPkM_ZplOS1GrGbODm7A6T1m96E",
      batchId: 125,
      batchCode: "CAR-24-C",
      quantity: 1,
      unit: "túi 2lb",
      priceAtPurchase: 120000,
      lineSubtotal: 120000,
    },
    {
      id: 4,
      productId: 104,
      productName: "Rau bina non hữu cơ",
      productSlug: "rau-bina-non-huu-co",
      imageUrl: "/assets/hero.png",
      batchId: 126,
      batchCode: "SPI-24-D",
      quantity: 1,
      unit: "hộp",
      priceAtPurchase: 330000,
      lineSubtotal: 330000,
    },
  ],
  statusHistories: [],
};

const progressSteps = [
  { key: "placed", label: "Đã đặt hàng", time: "24/10, 10:45", icon: "check_circle", completed: true },
  { key: "processing", label: "Đang xử lý", time: "24/10, 11:30", icon: "check_circle", completed: true },
  { key: "shipping", label: "Đang giao hàng", time: "Dự kiến 14:30", icon: "local_shipping", completed: true, active: true },
  { key: "delivered", label: "Đã giao", time: "Dự kiến hôm nay", icon: "home", completed: false },
] as const;

function formatMoney(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function formatPlacedDate(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderTracking() {
  const { orderCode } = useParams();
  const order = fallbackOrder;
  const displayCode = orderCode || order.orderCode;

  const itemCount = useMemo(() => order.details.reduce((sum, item) => sum + item.quantity, 0), [order.details]);
  const progressWidth = `${((progressSteps.filter((step) => step.completed).length - 1) / (progressSteps.length - 1)) * 100}%`;

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary min-h-screen">
      <main className="max-w-container-max mx-auto px-gutter py-stack-lg">
        <div className="flex flex-col lg:flex-row gap-stack-lg">
          <aside className="hidden lg:flex flex-col gap-stack-md p-gutter h-full w-64 rounded-r-xl bg-surface-container-low border-r border-outline-variant">
            <div className="mb-6">
              <p className="font-label-lg text-label-lg text-on-surface-variant">Xin chào</p>
              <h3 className="font-headline-md text-headline-md text-primary font-bold">Khách hàng Organic</h3>
            </div>
            <nav className="flex flex-col gap-2">
              <button className="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-lg font-bold duration-200 text-left">
                <span className="material-symbols-outlined">package_2</span>
                <span className="font-label-lg text-label-lg">Chi tiết đơn hàng</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg duration-200 text-left">
                <span className="material-symbols-outlined">history</span>
                <span className="font-label-lg text-label-lg">Lịch sử mua hàng</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg duration-200 text-left">
                <span className="material-symbols-outlined">favorite</span>
                <span className="font-label-lg text-label-lg">Danh sách yêu thích</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg duration-200 text-left">
                <span className="material-symbols-outlined">location_on</span>
                <span className="font-label-lg text-label-lg">Địa chỉ nhận hàng</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg duration-200 text-left">
                <span className="material-symbols-outlined">credit_card</span>
                <span className="font-label-lg text-label-lg">Phương thức thanh toán</span>
              </button>
            </nav>
            <div className="mt-auto pt-6">
              <Link to="/shop" className="block w-full py-3 bg-primary-container text-on-primary-container rounded-full font-bold hover:opacity-90 transition-opacity text-center">
                Quay lại cửa hàng
              </Link>
            </div>
          </aside>

          <div className="flex-1 space-y-stack-lg">
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Đơn hàng #{displayCode}</h1>
                  <span className="bg-primary text-on-primary px-4 py-1 rounded-full text-label-lg font-bold">Đang giao hàng</span>
                </div>
                <p className="text-on-surface-variant font-body-md">Đặt lúc {formatPlacedDate(order.createdAt)}</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button className="flex items-center gap-2 px-6 py-2 border border-primary text-primary font-bold rounded-full hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined">description</span>
                  Xem hóa đơn
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary font-bold rounded-full hover:opacity-90 transition-all active:scale-95">
                  <span className="material-symbols-outlined">support_agent</span>
                  Liên hệ hỗ trợ
                </button>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm overflow-x-auto">
              <div className="min-w-[600px] relative flex justify-between">
                <div className="absolute top-5 left-0 w-full h-1 bg-surface-container-highest -z-0">
                  <div className="h-full bg-primary" style={{ width: progressWidth }} />
                </div>
                {progressSteps.map((step) => (
                  <div key={step.key} className="relative z-10 flex flex-col items-center gap-4 text-center w-32 hover:-translate-y-1 transition-transform duration-300">
                    <div className="relative">
                      {step.active && <div className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping" />}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center relative ${step.completed ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant"}`}>
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: step.completed ? '"FILL" 1' : '"FILL" 0' }}>{step.icon}</span>
                      </div>
                    </div>
                    <div>
                      <p className={`font-label-lg text-label-lg ${step.active ? "text-primary font-bold" : step.completed ? "text-on-surface" : "text-on-surface-variant"}`}>{step.label}</p>
                      <p className="text-xs text-on-surface-variant">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm h-full flex flex-col">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  Thông tin giao hàng
                </h2>
                <div className="space-y-6 flex-1">
                  <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant">
                    <p className="font-label-lg text-label-lg text-on-surface mb-1">Địa chỉ nhận hàng</p>
                    <p className="text-body-md text-on-surface-variant">{order.shippingRecipientSnapshot}<br />{order.shippingAddressSnapshot}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest">
                      <img
                        className="w-full h-full object-cover"
                        alt="Shipper"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPoQKxdEFSxseblRTx8di3ZThLZwgpFbU8_9pTvmQUlFttPyyDroxOroFsjfs7CqpgsnPP47QRdxvKcXpCyEwxTKWSeQ0stbzttbT-hXxUxEmUm-HS0WAsQuDwLYLqPBGH4m6_apvgH1G2lXyn8_8Kf76-1NS8Ijf10ltCDAlhPOhsgtLsitOnG5EqLdJmxgWZ6yyy6TvgpWqlEzoX7O4q23twxP1qiDZTz3REFALs-aOREiGEMQtSp0Wn7kVws7sJY0AHNhx-U8M"
                      />
                    </div>
                    <div>
                      <p className="font-label-lg text-label-lg text-on-surface">Shipper: David Miller</p>
                      <p className="text-xs text-on-surface-variant">Đang lấy hàng từ kho Brooklyn</p>
                    </div>
                    <button className="ml-auto w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary hover:bg-primary hover:text-on-primary transition-colors">
                      <span className="material-symbols-outlined">call</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant shadow-sm">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                  Tóm tắt thanh toán
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-body-md text-on-surface-variant">
                    <span>Tạm tính ({itemCount} sản phẩm)</span>
                    <span>{formatMoney(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-body-md text-on-surface-variant">
                    <span>Phí vận chuyển</span>
                    <span className="text-primary font-bold">{order.shippingFee === 0 ? "Miễn phí" : formatMoney(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-body-md text-on-surface-variant">
                    <span>Thuế ước tính</span>
                    <span>45.200đ</span>
                  </div>
                  <hr className="border-outline-variant my-2" />
                  <div className="flex justify-between font-headline-md text-headline-md text-on-surface">
                    <span>Tổng thanh toán</span>
                    <span className="text-primary">{formatMoney(order.totalAmount)}</span>
                  </div>
                  <div className="mt-6 flex items-center gap-3 p-3 bg-secondary-container/20 rounded-lg text-on-secondary-container">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>verified_user</span>
                    <p className="text-xs">Thanh toán đã được xử lý thành công qua thẻ Visa kết thúc bằng 4421.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <h2 className="font-headline-md text-headline-md text-on-surface">Sản phẩm trong đơn</h2>
                <span className="text-body-md text-on-surface-variant">{itemCount} sản phẩm</span>
              </div>
              <div className="divide-y divide-outline-variant px-6">
                {order.details.map((item) => (
                  <div key={item.id} className="py-6 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant">
                      <img className="w-full h-full object-cover" alt={item.productName} src={item.imageUrl || "/assets/hero.png"} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-headline-md text-headline-md text-on-surface">{item.productName}</h4>
                      <p className="text-on-surface-variant text-body-md">{item.quantity} {item.unit} • {formatMoney(item.priceAtPurchase)} / sản phẩm</p>
                    </div>
                    <div className="text-right">
                      <p className="font-price-display text-price-display text-on-surface">{formatMoney(item.lineSubtotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
