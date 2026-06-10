import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Truck,
  CreditCard,
  MapPin,
  AlertCircle,
  ShoppingBag,
  Tag,
  LoaderCircle,
  QrCode,
  ShieldCheck,
  Package,
  ShoppingCart,
  Clock,
  CalendarDays,
} from "lucide-react";
import { motion } from "motion/react";
import VietQrPaymentModal from "../components/VietQrPaymentModal";
import type { Cart } from "../services/cartService";
import { clearCart, getCurrentCart, getCartItemImage } from "../services/cartService";
import { getCurrentUser } from "../services/userService";
import { getAllAddresses } from "../services/addressService";
import {
  createOrder,
  type CreateOrderRequest,
  type DeliveryMethod,
} from "../services/orderService";
import {
  createVietQrPayment,
  getVietQrPayment,
  type VietQrPayment,
  type OrderResponse,
} from "../services/paymentService";
import { getActiveBuildings, type ResidentialBuilding } from "../services/buildingService";
import {
  getDeliveryFees,
  getAvailableSlots,
  type DeliveryFee,
  type AvailableSlot,
} from "../services/deliveryService";
import type { Address } from "../types/user";
import type { User } from "../types/user";

const FADE_IN = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const DEFAULT_WEIGHT_KG = 1;

export default function Checkout() {
  const routerNavigate = useNavigate();

  // ── State ───────────────────────────────────────────────────────────────
  const [cart, setCart] = useState<Cart | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [buildings, setBuildings] = useState<ResidentialBuilding[]>([]);
  const [deliveryFees, setDeliveryFees] = useState<DeliveryFee[]>([]);

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethod>("STANDARD");
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [promotionCode, setPromotionCode] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"VIETQR" | "COD">("VIETQR");
  const [vietQrPayment, setVietQrPayment] = useState<VietQrPayment | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderResponse | null>(null);

  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isRefreshingPayment, setIsRefreshingPayment] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [actionError, setActionError] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [promoError, setPromoError] = useState("");

  // ── Derived ─────────────────────────────────────────────────────────────
  const selectedAddress = useMemo(
    () => addresses.find((a) => String(a.id) === selectedAddressId),
    [addresses, selectedAddressId]
  );

  const hasCartItems = Boolean(cart?.items && cart.items.length > 0);
  const hasAddress = Boolean(selectedAddress?.id);
  const addressIncomplete =
    hasAddress &&
    (!selectedAddress.buildingId ||
      !selectedAddress.floor ||
      !selectedAddress.apartmentNumber);

  const subtotal = cart?.totalPrice ?? 0;
  const selectedFee = useMemo(() => {
    const fee = deliveryFees.find((f) => f.deliveryMethod === selectedDeliveryMethod);
    if (!fee) return 0;
    if (fee.freeShippingThreshold != null && subtotal >= fee.freeShippingThreshold) return 0;
    return fee.shippingFee;
  }, [deliveryFees, selectedDeliveryMethod, subtotal]);

  const total = subtotal + selectedFee;

  const canCheckout =
    hasCartItems &&
    hasAddress &&
    !addressIncomplete &&
    (selectedDeliveryMethod !== "SCHEDULED" || (deliveryDate && selectedSlotId)) &&
    !createdOrder &&
    !isCreatingOrder &&
    !isCreatingPayment;

  const canCreatePayment = canCheckout && !isCreatingPayment && !isCreatingOrder;

  // ── Load data ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      routerNavigate("/login");
      return;
    }

    let mounted = true;
    Promise.all([
      getCurrentCart(),
      getCurrentUser(),
      getAllAddresses(),
      getActiveBuildings(),
      getDeliveryFees(),
    ])
      .then(([cartData, userData, addressList, buildingList, feeList]) => {
        if (!mounted) return;
        setCart(cartData);
        setUser(userData);
        setAddresses(addressList);
        setBuildings(buildingList);
        setDeliveryFees(feeList);
        const defaultAddr = addressList.find((a) => a.isDefault) ?? addressList[0];
        if (defaultAddr?.id) setSelectedAddressId(String(defaultAddr.id));
      })
      .catch((err: unknown) => {
        if (mounted) setLoadError(getErrorMessage(err, "Không thể tải thông tin thanh toán."));
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => { mounted = false; };
  }, [routerNavigate]);

  // ── Load available slots when date changes ─────────────────────────────
  useEffect(() => {
    if (selectedDeliveryMethod !== "SCHEDULED" || !deliveryDate) return;
    let mounted = true;
    getAvailableSlots(deliveryDate)
      .then((slots) => { if (mounted) setAvailableSlots(slots); })
      .catch(() => { if (mounted) setAvailableSlots([]); });
    return () => { mounted = false; };
  }, [selectedDeliveryMethod, deliveryDate]);

  // ── Helpers ───────────────────────────────────────────────────────────
  const buildOrderItems = (): CreateOrderRequest["items"] =>
    (cart?.items ?? []).map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity),
    }));

  const markCartEmpty = useCallback(() => {
    setCart((cur) => {
      if (!cur) return cur;
      const empty: Cart = { ...cur, totalQuantity: 0, totalPrice: 0, distinctItemCount: 0, items: [] };
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: empty }));
      return empty;
    });
  }, []);

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  // ── Polling ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!vietQrPayment || vietQrPayment.status !== "PENDING") return;
    const paymentId = vietQrPayment.id;
    const interval = window.setInterval(async () => {
      try {
        const updated = await getVietQrPayment(paymentId);
        setVietQrPayment(updated);

        if (updated.status === "PAID" && updated.orderId && updated.orderCode) {
          window.clearInterval(interval);
          markCartEmpty();
          setCreatedOrder(buildMockOrder(updated));
        } else if (updated.status !== "PENDING") {
          window.clearInterval(interval);
        }
      } catch {
        // keep polling
      }
    }, 5000);
    return () => window.clearInterval(interval);
  }, [vietQrPayment?.id, markCartEmpty]);

  // ── Actions ───────────────────────────────────────────────────────────
  const handleCreateOrder = async (note: string) => {
    if (!selectedAddress?.id || !hasCartItems) return;
    setIsCreatingOrder(true);
    setActionError("");
    try {
      const request: CreateOrderRequest = {
        addressId: selectedAddress.id,
        promotionCode: promotionCode.trim() || undefined,
        note,
        items: buildOrderItems(),
        deliveryMethod: selectedDeliveryMethod,
        deliveryDate: selectedDeliveryMethod === "SCHEDULED" ? deliveryDate : undefined,
        deliverySlotId: selectedDeliveryMethod === "SCHEDULED" ? selectedSlotId ?? undefined : undefined,
      };
      const order = await createOrder(request);
      setCreatedOrder(order as unknown as OrderResponse);
      setVietQrPayment(null);
      markCartEmpty();
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, "Không thể tạo đơn hàng."));
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!selectedAddress?.id || !canCreatePayment) return;
    setIsCreatingPayment(true);
    setActionError("");
    try {
      const payment = await createVietQrPayment(
        selectedAddress.id,
        selectedDeliveryMethod,
        selectedDeliveryMethod === "SCHEDULED" ? deliveryDate : undefined,
        selectedDeliveryMethod === "SCHEDULED" ? selectedSlotId ?? undefined : undefined,
        promotionCode.trim() || undefined
      );
      setVietQrPayment(payment);
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, "Không thể tạo mã VietQR."));
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handleCheckout = () => {
    if (paymentMethod === "COD") {
      void handleCreateOrder("Thanh toán khi nhận hàng (COD)");
    } else {
      void handleCreatePayment();
    }
  };

  const handleRefreshPayment = async () => {
    if (!vietQrPayment) return;
    setIsRefreshingPayment(true);
    setActionError("");
    try {
      setVietQrPayment(await getVietQrPayment(vietQrPayment.id));
    } catch (err: unknown) {
      setActionError(getErrorMessage(err, "Không thể kiểm tra trạng thái thanh toán."));
    } finally {
      setIsRefreshingPayment(false);
    }
  };

  const handleCompleteVietQrOrder = () => {
    if (!vietQrPayment || vietQrPayment.status !== "PAID") return;
    if (vietQrPayment.orderId && vietQrPayment.orderCode) {
      setVietQrPayment(null);
      markCartEmpty();
      setCreatedOrder(buildMockOrder(vietQrPayment));
    }
  };

  const buildMockOrder = (payment: VietQrPayment): OrderResponse => ({
    id: payment.orderId!,
    orderCode: payment.orderCode!,
    userId: 0, userFullName: "",
    addressId: 0, addressLabel: null,
    shippingRecipientSnapshot: "", shippingPhoneSnapshot: "",
    shippingAddressSnapshot: "", shippingProviderNameSnapshot: "",
    promotion: null, subtotal: 0, discountAmount: 0, shippingFee: 0,
    totalAmount: payment.amount, status: "PENDING" as const,
    note: null, details: [], statusHistories: [],
    createdAt: "", updatedAt: "",
    deliveryMethod: null, deliveryDate: null, deliverySlotId: null,
    deliverySlotSnapshot: null, buildingCodeSnapshot: null, buildingNameSnapshot: null,
    floorSnapshot: null, apartmentNumberSnapshot: null,
    recipientNameSnapshot: null, recipientPhoneSnapshot: null,
    deliveryNoteSnapshot: null,
  });

  const handleApplyPromo = () => {
    if (!promotionCode.trim()) {
      setPromoError("Vui lòng nhập mã khuyến mãi.");
      return;
    }
    setPromoError("");
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (createdOrder) {
    return <OrderSuccess order={createdOrder} total={total} />;
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoaderCircle className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-on-surface-variant">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 text-center min-h-[400px] flex items-center justify-center">
        <div>
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{loadError}</p>
          <Link to="/cart" className="mt-4 inline-block text-primary font-bold hover:underline">
            Quay lại giỏ hàng
          </Link>
        </div>
      </div>
    );
  }

  if (!hasCartItems) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 text-center min-h-[400px] flex items-center justify-center">
        <div>
          <ShoppingCart className="w-16 h-16 text-on-surface-variant/40 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-on-surface mb-2">Giỏ hàng trống</h2>
          <p className="text-on-surface-variant mb-6">Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-2xl hover:brightness-105 transition-all"
          >
            <Package className="w-5 h-5" />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <motion.nav {...FADE_IN} className="flex items-center gap-2 mb-6 md:mb-10 text-on-surface-variant text-sm font-medium">
        <Link to="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link>
        <ChevronRight className="size-4" />
        <span className="text-primary font-bold">Thanh toán</span>
        <ChevronRight className="size-4" />
        <span className="opacity-50">Xác nhận</span>
      </motion.nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* ── Left column ── */}
        <motion.div initial="initial" animate="animate" className="lg:col-span-7 space-y-6 md:space-y-8">

          {/* Shipping address */}
          <section className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-primary tracking-tight">
              <MapPin className="size-6" />
              Địa chỉ giao hàng
            </h2>
            {addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr) => {
                  const isIncomplete = !addr.buildingId || !addr.floor || !addr.apartmentNumber;
                  return (
                    <label
                      key={addr.id}
                      className={`flex gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                        String(addr.id) === selectedAddressId
                          ? "border-primary bg-primary-container/10 ring-1 ring-primary/20"
                          : "border-outline-variant hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={String(addr.id) === selectedAddressId}
                        onChange={() => setSelectedAddressId(String(addr.id))}
                        className="mt-1 accent-primary"
                      />
                      <div>
                        <p className="font-bold text-on-surface">{addr.recipientName} ({addr.recipientPhone})</p>
                        <p className="text-sm text-on-surface-variant">
                          {addr.buildingId && addr.buildingCode
                            ? `Căn hộ ${addr.apartmentNumber ?? ""}, tầng ${addr.floor ?? ""}, tòa ${addr.buildingCode}`
                            : [addr.fullAddress, addr.ward, addr.district, addr.city].filter(Boolean).join(", ")}
                        </p>
                        {isIncomplete && (
                          <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                            <AlertCircle className="size-3" />
                            Cần cập nhật thông tin tòa nhà, tầng, căn hộ
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-on-surface-variant mb-4">Bạn chưa có địa chỉ giao hàng.</p>
                <Link to="/account" className="text-primary font-bold hover:underline">
                  Thêm địa chỉ trong tài khoản
                </Link>
              </div>
            )}
          </section>

          {/* Internal delivery method */}
          <section className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40" />
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-primary tracking-tight">
              <Truck className="size-6" />
              Hình thức giao hàng nội khu
            </h2>

            {/* Address incomplete warning */}
            {addressIncomplete && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-semibold flex items-start gap-2">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>
                  Địa chỉ chưa có thông tin tòa nhà.{" "}
                  <Link to="/account" className="underline font-bold">Cập nhật địa chỉ</Link>{" "}
                  để tiếp tục thanh toán.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {([
                { key: "STANDARD" as DeliveryMethod, icon: Truck, label: "Giao tiêu chuẩn", time: deliveryFees.find(f => f.deliveryMethod === "STANDARD")?.estimatedTime ?? "60 phút" },
                { key: "EXPRESS" as DeliveryMethod, icon: Clock, label: "Giao nhanh", time: deliveryFees.find(f => f.deliveryMethod === "EXPRESS")?.estimatedTime ?? "30 phút" },
                { key: "SCHEDULED" as DeliveryMethod, icon: CalendarDays, label: "Đặt lịch giao", time: "Chọn ngày & khung giờ" },
              ]).map(({ key, icon: Icon, label, time }) => {
                const fee = deliveryFees.find(f => f.deliveryMethod === key);
                const feeDisplay = fee?.shippingFee === 0 ? "Miễn phí" : `${(fee?.shippingFee ?? 0).toLocaleString()}đ`;
                const isActive = selectedDeliveryMethod === key;
                return (
                  <label
                    key={key}
                    className={`relative flex flex-col items-center p-4 md:p-5 border-2 rounded-2xl cursor-pointer transition-all text-center ${
                      isActive
                        ? "border-primary bg-primary-container/5 ring-1 ring-primary/20"
                        : "border-outline-variant hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={key}
                      checked={isActive}
                      onChange={() => {
                        setSelectedDeliveryMethod(key);
                        if (key !== "SCHEDULED") {
                          setDeliveryDate("");
                          setSelectedSlotId(null);
                          setAvailableSlots([]);
                        } else {
                          setDeliveryDate(getTomorrow());
                        }
                      }}
                      className="sr-only"
                    />
                    <Icon className={`size-7 mb-2 ${isActive ? "text-primary" : "text-on-surface-variant"}`} />
                    <span className="font-bold text-on-surface text-sm">{label}</span>
                    <span className="text-xs text-on-surface-variant mt-0.5">{time}</span>
                    <span className={`mt-1 font-bold text-sm ${fee?.shippingFee === 0 ? "text-emerald-600" : "text-primary"}`}>{feeDisplay}</span>
                  </label>
                );
              })}
            </div>

            {/* SCHEDULED: date + slot picker */}
            {selectedDeliveryMethod === "SCHEDULED" && (
              <div className="space-y-4 border-t border-outline-variant/40 pt-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">
                    <CalendarDays className="size-4 inline mr-1" />
                    Ngày giao hàng
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    min={getTomorrow()}
                    onChange={(e) => {
                      setDeliveryDate(e.target.value);
                      setSelectedSlotId(null);
                    }}
                    className="w-full h-12 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm font-medium outline-none focus:border-primary transition-colors"
                  />
                </div>
                {deliveryDate && (
                  <div>
                    <label className="block text-sm font-bold text-on-surface mb-2">
                      <Clock className="size-4 inline mr-1" />
                      Khung giờ giao
                    </label>
                    {availableSlots.length === 0 ? (
                      <p className="text-on-surface-variant text-sm">Đang tải khung giờ...</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.slotId}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setSelectedSlotId(slot.slotId)}
                            className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${
                              selectedSlotId === slot.slotId
                                ? "border-primary bg-primary text-white"
                                : slot.available
                                ? "border-outline-variant hover:border-primary/50 text-on-surface"
                                : "border-outline-variant/50 text-on-surface-variant/50 cursor-not-allowed"
                            }`}
                            title={slot.unavailableReason}
                          >
                            {slot.name}
                            {!slot.available && (
                              <span className="block text-[10px] font-normal mt-0.5 opacity-70">{slot.unavailableReason}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Payment method */}
          <section className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
            <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-primary tracking-tight">
              <CreditCard className="size-6" />
              Phương thức thanh toán
            </h2>
            <div className="space-y-3">
              {([
                { value: "VIETQR" as const, icon: QrCode, title: "Chuyển khoản VietQR", sub: "Quét QR bằng ứng dụng ngân hàng" },
                { value: "COD" as const, icon: ShoppingBag, title: "Thanh toán khi nhận hàng (COD)", sub: "Tạo đơn ngay, thanh toán khi nhận hàng" },
              ] as const).map(({ value, icon: Icon, title, sub }) => {
                const isActive = paymentMethod === value;
                return (
                  <label
                    key={value}
                    className={`flex items-center p-4 md:p-5 border-2 rounded-2xl cursor-pointer transition-all ${
                      isActive
                        ? "border-primary bg-primary-container/5 ring-1 ring-primary/20"
                        : "border-outline-variant hover:border-primary/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={isActive}
                      onChange={() => setPaymentMethod(value)}
                      className="accent-primary"
                    />
                    <div className="ml-4 flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <span className="block font-bold text-on-surface text-sm md:text-base">{title}</span>
                        <span className="block text-xs font-medium text-on-surface-variant">{sub}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Promo code */}
            <div className="mt-5 pt-5 border-t border-outline-variant/40">
              <label className="flex items-center gap-2 text-sm font-bold text-on-surface mb-2">
                <Tag className="size-4" />
                Mã khuyến mãi (tùy chọn)
              </label>
              <div className="flex gap-2">
                <input
                  value={promotionCode}
                  onChange={(e) => { setPromotionCode(e.target.value); setPromoError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleApplyPromo(); } }}
                  placeholder="Nhập mã khuyến mãi"
                  className="flex-1 h-11 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-sm outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => void handleApplyPromo()}
                  className="h-11 px-4 rounded-xl border border-primary/40 text-primary font-bold text-sm hover:bg-primary/5 transition-colors disabled:opacity-50"
                  disabled={!promotionCode.trim()}
                >
                  Áp dụng
                </button>
              </div>
              {promoError && <p role="alert" className="mt-1.5 text-xs text-red-600 font-semibold">{promoError}</p>}
            </div>
          </section>
        </motion.div>

        {/* ── Right column: Order summary ── */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-5"
        >
          <div className="sticky top-24 space-y-5">
            <div className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-xl">
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center justify-between tracking-tight">
                Tóm tắt đơn hàng
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">
                  {cart?.distinctItemCount ?? 0} sản phẩm
                </span>
              </h2>

              <div className="divide-y divide-outline-variant/30 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {cart?.items.map((item) => (
                  <div key={item.productId} className="py-4 flex gap-4 items-center">
                    <div className="size-16 flex-shrink-0 bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                      <img
                        src={item.imageUrl || "/assets/hero.png"}
                        alt={item.productName}
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold text-on-surface text-sm line-clamp-1">{item.productName}</h4>
                      <p className="text-xs font-medium text-on-surface-variant mt-0.5">
                        {item.quantity} × {item.unitPrice.toLocaleString()}đ
                      </p>
                      <p className="font-bold text-primary mt-1 text-sm">{item.subtotal.toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-outline-variant/50">
                <div className="flex justify-between text-sm font-medium text-on-surface-variant">
                  <span>Tạm tính</span>
                  <span className="font-bold">{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-on-surface-variant">
                  <span>Phí giao hàng</span>
                  <span className="font-bold">{selectedFee === 0 ? "Miễn phí" : `${selectedFee.toLocaleString()}đ`}</span>
                </div>
                {promotionCode.trim() && (
                  <div className="flex justify-between text-sm font-medium text-emerald-700">
                    <span>Khuyến mãi</span>
                    <span className="font-bold">-0đ</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 items-end border-t border-outline-variant/50">
                  <span className="text-lg md:text-xl font-bold tracking-tight">Tổng cộng</span>
                  <span className="text-2xl md:text-3xl font-bold text-primary">{total.toLocaleString()}đ</span>
                </div>
              </div>

              {/* Validation warnings */}
              {!hasAddress && (
                <div className="mt-4 flex items-start gap-2 text-sm text-red-600 font-semibold">
                  <AlertCircle className="size-4 mt-0.5 shrink-0" />
                  <span>Cần chọn địa chỉ giao hàng trước khi đặt hàng.</span>
                </div>
              )}
              {addressIncomplete && (
                <div className="mt-2 flex items-start gap-2 text-sm text-red-600 font-semibold">
                  <AlertCircle className="size-4 mt-0.5 shrink-0" />
                  <span>Cần cập nhật địa chỉ với thông tin tòa nhà, tầng, căn hộ.</span>
                </div>
              )}
              {selectedDeliveryMethod === "SCHEDULED" && !deliveryDate && (
                <div className="mt-2 flex items-start gap-2 text-sm text-red-600 font-semibold">
                  <AlertCircle className="size-4 mt-0.5 shrink-0" />
                  <span>Cần chọn ngày giao hàng.</span>
                </div>
              )}
              {selectedDeliveryMethod === "SCHEDULED" && deliveryDate && !selectedSlotId && (
                <div className="mt-2 flex items-start gap-2 text-sm text-red-600 font-semibold">
                  <AlertCircle className="size-4 mt-0.5 shrink-0" />
                  <span>Cần chọn khung giờ giao hàng.</span>
                </div>
              )}

              {actionError && (
                <div className="mt-3 flex items-start gap-2 text-sm text-red-600 font-semibold bg-red-50 rounded-xl p-3">
                  <AlertCircle className="size-4 mt-0.5 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={!canCheckout}
                className="w-full h-16 rounded-2xl font-bold text-lg mt-6 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:brightness-105 active:scale-[0.99] transition-all disabled:bg-surface-container disabled:text-on-surface-variant disabled:shadow-none disabled:cursor-not-allowed text-white bg-primary"
              >
                {isCreatingOrder || isCreatingPayment ? (
                  <>
                    Đang xử lý
                    <LoaderCircle className="size-5 animate-spin" />
                  </>
                ) : paymentMethod === "VIETQR" ? (
                  <>
                    Tạo mã VietQR
                    <QrCode className="size-5" />
                  </>
                ) : (
                  <>
                    Đặt hàng COD
                    <ShoppingBag className="size-5" />
                  </>
                )}
              </button>

              <div className="text-center mt-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                <ShieldCheck size={14} className="text-primary" />
                Thanh toán bảo mật qua VietQR
              </div>
            </div>
          </div>
        </motion.aside>
      </div>

      {/* VietQR modal */}
      <VietQrPaymentModal
        payment={vietQrPayment}
        errorMessage={actionError}
        isRefreshing={isRefreshingPayment}
        isCompletingOrder={isCreatingOrder}
        onClose={() => setVietQrPayment(null)}
        onRefresh={handleRefreshPayment}
        onCompleteOrder={handleCompleteVietQrOrder}
      />
    </div>
  );
}

// ── Order success screen ────────────────────────────────────────────────────────
function OrderSuccess({ order, total }: { order: OrderResponse; total: number }) {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto my-12 max-w-2xl px-6 text-center"
    >
      <div className="rounded-[2rem] border border-primary/20 bg-white p-8 shadow-xl md:p-12">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-10" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Đặt hàng thành công</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-on-surface">
          Cảm ơn bạn đã chọn Organic Mart
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-on-surface-variant">
          Đơn <strong className="text-on-surface">{order.orderCode}</strong> đã được tạo và đang chờ xác nhận.
        </p>
        <div className="mt-8 rounded-2xl bg-surface-container-low p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Mã đơn hàng</p>
          <p className="mt-1 text-2xl font-bold text-primary">{order.orderCode}</p>
          {order.deliveryMethod && (
            <p className="mt-2 text-sm text-on-surface-variant">
              Giao hàng nội khu ·{" "}
              {order.deliveryMethod === "STANDARD" ? "Tiêu chuẩn" : order.deliveryMethod === "EXPRESS" ? "Nhanh" : "Đặt lịch"}
              {order.deliveryDate && ` · ${new Date(order.deliveryDate).toLocaleDateString("vi-VN")}`}
              {order.deliverySlotSnapshot && ` · ${order.deliverySlotSnapshot}`}
            </p>
          )}
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tổng thanh toán</p>
          <p className="mt-1 text-3xl font-bold tabular-nums text-primary">
            {(order.totalAmount ?? total).toLocaleString("vi-VN")}đ
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/account?tab=orders"
            className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 font-bold text-white transition-colors hover:brightness-105"
          >
            Xem đơn hàng
          </Link>
          <button
            onClick={() => navigate("/shop")}
            className="flex min-h-12 items-center justify-center rounded-xl border border-outline-variant px-6 font-bold text-on-surface transition-colors hover:border-primary hover:text-primary"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </motion.section>
  );
}
