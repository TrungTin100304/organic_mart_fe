import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Truck, CreditCard, MapPin, Phone, User, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import type { Cart } from "../services/cartService";
import { clearCart, getCurrentCart, getCartItemImage } from "../services/cartService";
import { getCurrentUser } from "../services/userService";
import { getAllAddresses } from "../services/addressService";
import { createOrder, getShipmentRates, type ShippingRate } from "../services/orderService";
import type { Address, User as UserType } from "../types/user";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const DEFAULT_WEIGHT_KG = 1;

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedShippingProviderId, setSelectedShippingProviderId] = useState<number | null>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [error, setError] = useState("");
  const [shippingError, setShippingError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/login");
      return;
    }

    let mounted = true;
    Promise.all([getCurrentCart(), getCurrentUser(), getAllAddresses()])
      .then(([cartData, userData, addressList]) => {
        if (!mounted) return;
        setCart(cartData);
        setUser(userData);
        setAddresses(addressList);
        const defaultAddress = addressList.find((address) => address.isDefault) || addressList[0];
        if (defaultAddress?.id) setSelectedAddressId(String(defaultAddress.id));
      })
      .catch((err: unknown) => {
        if (mounted) setError(err instanceof Error ? err.message : "Không thể tải thông tin thanh toán.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const selectedAddress = useMemo(
    () => addresses.find((address) => String(address.id) === selectedAddressId),
    [addresses, selectedAddressId]
  );

  useEffect(() => {
    if (!selectedAddress) {
      setShippingRates([]);
      setSelectedShippingProviderId(null);
      setShippingFee(0);
      setShippingError("");
      return;
    }

    const province = selectedAddress.city?.trim();
    const district = selectedAddress.district?.trim();
    const ward = selectedAddress.ward?.trim();

    if (!province || !district || !ward) {
      setShippingRates([]);
      setSelectedShippingProviderId(null);
      setShippingFee(0);
      setShippingError("Địa chỉ cần có đầy đủ tỉnh/thành, quận/huyện và phường/xã để tính phí ship.");
      return;
    }

    let mounted = true;
    setIsLoadingRates(true);
    setShippingError("");

    getShipmentRates({
      province,
      district,
      ward,
      weightKg: DEFAULT_WEIGHT_KG,
    })
      .then((rates) => {
        if (!mounted) return;

        setShippingRates(rates);

        if (rates.length === 0) {
          setSelectedShippingProviderId(null);
          setShippingFee(0);
          setShippingError("Không có đơn vị vận chuyển khả dụng cho địa chỉ này.");
          return;
        }

        setSelectedShippingProviderId((currentProviderId) => {
          const matchedRate = rates.find((rate) => rate.providerId === currentProviderId) || rates[0];
          setShippingFee(matchedRate.fee);
          return matchedRate.providerId;
        });
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setShippingRates([]);
        setSelectedShippingProviderId(null);
        setShippingFee(0);
        setShippingError(err instanceof Error ? err.message : "Không thể tính phí vận chuyển.");
      })
      .finally(() => {
        if (mounted) setIsLoadingRates(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedAddress]);

  const subtotal = cart?.totalPrice || 0;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddress?.id) {
      setError("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    if (!selectedShippingProviderId) {
      setError("Vui lòng chọn đơn vị vận chuyển.");
      return;
    }

    if (!cart?.items?.length) {
      setError("Giỏ hàng đang trống.");
      return;
    }

    try {
      setIsSubmittingOrder(true);
      setError("");

      const order = await createOrder({
        addressId: Number(selectedAddress.id),
        shippingProviderId: selectedShippingProviderId,
        shippingFee,
        promotionCode: "",
        note: note.trim(),
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      await clearCart();
      navigate(`/tracking/${order.orderCode}`, {
        state: {
          orderCreated: true,
          orderId: order.id,
          orderCode: order.orderCode,
        },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể tạo đơn hàng.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10">
      <motion.nav {...fadeIn} className="flex items-center gap-2 mb-6 md:mb-10 text-on-surface-variant text-sm font-medium">
        <Link to="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link>
        <ChevronRight className="size-4" />
        <span className="text-primary font-bold">Thanh toán</span>
        <ChevronRight className="size-4" />
        <span className="opacity-50">Xác nhận</span>
      </motion.nav>

      {isLoading && <p className="text-on-surface-variant">Đang tải thông tin thanh toán...</p>}
      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <motion.div initial="initial" animate="animate" className="lg:col-span-7 space-y-6 md:space-y-10 focus-within:z-10">
            <motion.section variants={fadeIn} className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-3 text-primary tracking-tight">
                <MapPin className="size-6" />
                Thông tin giao hàng
              </h2>

              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label key={address.id} className="flex gap-3 p-4 border border-outline-variant rounded-2xl cursor-pointer hover:border-primary transition-colors">
                      <input
                        type="radio"
                        name="address"
                        checked={String(address.id) === selectedAddressId}
                        onChange={() => {
                          setSelectedAddressId(String(address.id));
                          setError("");
                        }}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-bold">{address.recipientName} ({address.recipientPhone})</p>
                        <p className="text-sm text-on-surface-variant">
                          {address.fullAddress}
                          {address.ward && `, ${address.ward}`}
                          {address.district && `, ${address.district}`}
                          {address.city && `, ${address.city}`}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-outline" />
                      <input readOnly value={user?.fullName || ""} className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-medium" type="text" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-outline" />
                      <input readOnly value={user?.phone || ""} className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest font-medium" type="tel" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Link to="/account" className="text-primary font-bold hover:underline">Thêm địa chỉ giao hàng trong tài khoản</Link>
                  </div>
                </div>
              )}
            </motion.section>

            <motion.section variants={fadeIn} className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/40" />
              <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-3 text-primary tracking-tight">
                <Truck className="size-6" />
                Phương thức vận chuyển
              </h2>

              {shippingError && <p className="mb-4 text-sm text-red-600 font-semibold">{shippingError}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {isLoadingRates ? (
                  <p className="text-on-surface-variant">Đang tính phí vận chuyển...</p>
                ) : shippingRates.length > 0 ? (
                  shippingRates.map((rate) => {
                    const isSelected = selectedShippingProviderId === rate.providerId;

                    return (
                      <label
                        key={rate.providerId}
                        className={`relative flex items-center p-4 md:p-6 border-2 rounded-2xl cursor-pointer transition-all group ${isSelected ? "border-primary bg-primary-container/5 ring-1 ring-primary/20" : "border-outline-variant"}`}
                      >
                        <input
                          checked={isSelected}
                          onChange={() => {
                            setSelectedShippingProviderId(rate.providerId);
                            setShippingFee(rate.fee);
                            setError("");
                          }}
                          className="size-5 text-primary border-outline-variant focus:ring-primary"
                          name="shipping"
                          type="radio"
                        />
                        <div className="ml-4 md:ml-5">
                          <span className="block font-bold text-on-surface">{rate.providerName}</span>
                          <span className="text-xs font-medium text-on-surface-variant">{rate.estimatedDays}</span>
                        </div>
                        <span className="ml-auto font-bold text-primary text-sm md:text-base">{rate.fee.toLocaleString()}đ</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-sm text-on-surface-variant">Chọn địa chỉ hợp lệ để hiển thị đơn vị vận chuyển.</p>
                )}
              </div>
            </motion.section>

            <motion.section variants={fadeIn} className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
              <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-3 text-primary tracking-tight">
                <CreditCard className="size-6" />
                Phương thức thanh toán
              </h2>
              <label className="flex items-center p-4 md:p-5 border border-primary rounded-2xl cursor-pointer bg-primary-container/5 transition-all group">
                <input defaultChecked className="size-5 text-primary border-outline-variant focus:ring-primary" name="payment" type="radio" value="COD" />
                <span className="ml-4 md:ml-5 font-bold text-on-surface text-sm md:text-base">Thanh toán khi nhận hàng (COD)</span>
              </label>

              <div className="mt-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 ml-1">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-outline-variant p-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..."
                />
              </div>
            </motion.section>
          </motion.div>

          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="lg:col-span-5 h-full">
            <div className="sticky top-24 space-y-6 md:space-y-8">
              <div className="bg-white p-6 md:p-10 rounded-3xl border border-outline-variant shadow-xl ring-1 ring-white/50">
                <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center justify-between tracking-tight">
                  Tóm tắt đơn hàng
                  <span className="text-xs font-bold uppercase tracking-widest opacity-40">{cart?.distinctItemCount || 0} sản phẩm</span>
                </h2>

                <div className="divide-y divide-outline-variant/30 max-h-[320px] overflow-y-auto pr-2 mb-6 md:mb-8 custom-scrollbar">
                  {cart?.items.map((item) => (
                    <div key={item.productId} className="py-5 flex gap-5 items-center">
                      <div className="size-20 flex-shrink-0 bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                        <img className="size-full object-cover" src={getCartItemImage(item) || "/assets/hero.png"} alt={item.productName} />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-on-surface text-sm line-clamp-1">{item.productName}</h4>
                        <p className="text-xs font-medium text-on-surface-variant opacity-70 mt-1">{item.quantity} {item.unit || ""}</p>
                        <p className="font-bold text-primary mt-2">{item.subtotal.toLocaleString()}đ</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4 md:pt-6 border-t border-outline-variant/50">
                  <div className="flex justify-between text-sm font-medium text-on-surface-variant">
                    <span>Tạm tính</span>
                    <span className="font-bold">{subtotal.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-on-surface-variant">
                    <span>Phí vận chuyển</span>
                    <span className="font-bold">{shippingFee.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between pt-4 items-end">
                    <span className="text-xl md:text-2xl font-bold tracking-tight">Tổng cộng</span>
                    <span className="text-2xl md:text-3xl font-bold text-primary">{total.toLocaleString()}đ</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress || !selectedShippingProviderId || !cart?.items?.length || isSubmittingOrder || isLoadingRates}
                  className="w-full bg-primary text-white h-16 rounded-2xl font-bold text-lg mt-10 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmittingOrder ? "Đang đặt hàng..." : "Đặt hàng"}
                </button>

                {!selectedAddress && (
                  <p className="mt-4 text-sm text-red-600 font-semibold">Cần thêm địa chỉ trước khi đặt hàng.</p>
                )}

                <div className="text-center mt-6 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                  <ShieldCheck size={14} className="text-primary" />
                  Dữ liệu giỏ hàng lấy từ backend
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </div>
  );
}
