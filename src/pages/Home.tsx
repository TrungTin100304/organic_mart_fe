import { Link } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import type { Product } from "@/types";
import ProductCard from "../components/ProductCard";
import HeroBanner from "../components/HeroBanner";
import { motion } from "motion/react";
import { getProducts } from "@/services/productService";
import { getHomeProductSections } from "@/utils/homeProductSections";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" as const }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  },
  viewport: { once: true }
};

function ProductSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col h-full animate-pulse">
      <div className="aspect-[4/3] bg-surface-container-high" />
      <div className="p-stack-md space-y-3 flex-grow">
        <div className="h-4 bg-surface-container-high rounded-full w-3/4 mx-auto" />
        <div className="h-5 bg-surface-container-high rounded-full w-1/2 mx-auto" />
        <div className="flex gap-2 mt-auto pt-2">
          <div className="h-9 bg-surface-container-high rounded-lg flex-1" />
          <div className="h-9 bg-surface-container-high rounded-lg flex-1" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const loadProducts = useCallback(() => {
    setIsLoadingProducts(true);
    setProductError(null);
    let mounted = true;
    getProducts({ page: 0, size: 12 })
      .then((page) => {
        if (mounted) {
          setProducts(page.content);
          // eslint-disable-next-line no-console
          console.debug("Home: loaded products", page.content.length, "items");
        }
      })
      .catch((err: any) => {
        // surface server error message if available
        // eslint-disable-next-line no-console
        console.error("Failed to load products:", err);
        if (mounted) setProductError(err?.message || "Không thể tải sản phẩm. Vui lòng thử lại.");
      })
      .finally(() => {
        if (mounted) setIsLoadingProducts(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = loadProducts();
    return cleanup;
  }, [loadProducts]);

  const { newArrivals, favoriteProducts } = useMemo(
    () => getHomeProductSections(products, 6),
    [products],
  );

  const renderProductGrid = (items: Product[], keySuffix = "") => {
    if (isLoadingProducts) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductSkeleton key={`skeleton-${keySuffix}-${i}`} />
          ))}
        </div>
      );
    }

    if (productError) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px]">cloud_off</span>
          </div>
          <p className="text-on-surface-variant text-body-lg mb-4">{productError}</p>
          <button
            onClick={loadProducts}
            className="px-6 py-2 bg-primary text-white font-bold rounded-full hover:brightness-110 transition-all active:scale-95 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-surface-container-high text-on-surface-variant rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
          </div>
          <p className="text-on-surface-variant text-body-lg">Chưa có sản phẩm nào.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
        {items.map((p, idx) => (
          <motion.div
            key={p.id + keySuffix}
            variants={{
              initial: { opacity: 0, y: 20 },
              whileInView: { opacity: 1, y: 0, transition: { duration: 0.5, delay: idx * 0.05 } }
            }}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* Hero Carousel */}
      <HeroBanner />

      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg w-full">
        {/* Sản phẩm mới về */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          animate="whileInView"
          viewport={{ once: true, margin: "-50px" }}
          className="mb-20"
        >
          <div className="flex items-center justify-between mb-stack-md">
            <h2 className="text-headline-md font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">new_releases</span>
              Sản phẩm mới về
            </h2>
            <Link className="text-primary font-bold hover:underline" to="/shop">Xem tất cả</Link>
          </div>
          {renderProductGrid(newArrivals, "_new")}
        </motion.section>

        {/* Khuyến mãi đặc biệt (Asymmetric Banner) */}
        <motion.section
          {...fadeIn}
          className="bg-primary text-on-primary md:rounded-2xl rounded-xl overflow-hidden relative mb-12 md:mb-20 shadow-xl"
        >
          <div className="flex flex-col-reverse md:grid md:grid-cols-2 items-center">
            <div className="p-4 md:p-stack-lg z-10 w-full">
              <span className="text-secondary-fixed font-bold text-sm md:text-label-lg mb-2 block uppercase tracking-wider">Giảm giá cuối tuần</span>
              <h2 className="text-2xl md:text-headline-lg font-bold mb-4 md:mb-stack-md leading-tight">Khuyến mãi đặc biệt lên đến 40% cho Trái cây nhập khẩu</h2>
              <p className="text-sm md:text-body-lg mb-6 md:mb-stack-lg opacity-80 max-w-md leading-relaxed">Tận hưởng hương vị tươi ngon từ các nông trại hàng đầu thế giới với mức giá cực kỳ ưu đãi chỉ có trong tuần này.</p>
              <div className="flex flex-col sm:flex-row md:items-center gap-4 md:gap-gutter flex-wrap">
                <Link to="/shop" className="bg-white text-primary text-center px-8 py-3 rounded-lg font-bold hover:bg-secondary-fixed transition-colors">Săn deal ngay</Link>
                <div className="text-white text-center sm:text-left">
                  <p className="text-[10px] uppercase opacity-70 tracking-widest mb-1 font-bold">Kết thúc trong:</p>
                  <p className="font-bold text-price-display">02 : 14 : 55 : 30</p>
                </div>
              </div>
            </div>
            <div className="relative h-48 md:h-full w-full min-h-[250px] md:min-h-[350px] overflow-hidden">
              <motion.img
                initial={{ scale: 1.2 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWt7BEqoTSm7Hgfzlnu21gyCTbdLbqxMErfRMYUV8CWzt9180cWVta3ygx2HJ0_bSqhkcx5eOJrX0IP837HqLJbZul1hs4g1ewHcNBaK_Mf-I0VtrEbpfp5qlo1xv_dpLLBTYDup08GipeP_rWB6nI_V0WFkAdyg4S67UYppHb6D8hjFGJqAUCJT2kkh6c6Xh9LgS5YmtNTQYEJFQOdsRRfkhZ9TLkvMzemp0W2cfTXmWVjqZRF6sSS9ohzV91RU2SfXzK7j4Ik1w"
                alt="Tropical Fruits"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary md:block hidden"></div>
            </div>
          </div>
        </motion.section>

        {/* Sản phẩm được yêu thích */}
        <motion.section
          variants={staggerContainer}
          initial="initial"
          animate="whileInView"
          viewport={{ once: true, margin: "-50px" }}
          className="mb-20"
        >
          <div className="flex items-center justify-between mb-stack-md">
            <h2 className="text-headline-md font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">favorite</span>
              Sản phẩm được yêu thích
            </h2>
            <Link className="text-primary font-bold hover:underline" to="/shop">Xem tất cả</Link>
          </div>
          {renderProductGrid(favoriteProducts, "_fav")}
        </motion.section>


        {/* Giới thiệu ngắn */}
        <section className="py-stack-lg">
          <motion.h2
            {...fadeIn}
            className="text-headline-md font-bold text-primary mb-stack-lg text-center"
          >
            Giới thiệu ngắn về RAU NHA MINH
          </motion.h2>

          <motion.div
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center text-on-surface-variant mb-6 px-4"
          >
            <p className="text-body-md leading-relaxed">
              RAU NHA MINH là nền tảng mua sắm trực tuyến chuyên cung cấp trái cây, rau củ và thực phẩm hữu cơ từ những nông trại được chứng nhận.
              Chúng tôi cam kết đem tới sản phẩm tươi ngon, minh bạch về nguồn gốc và trải nghiệm mua sắm đơn giản, an toàn cho cả gia đình.
            </p>
            <p className="text-body-md leading-relaxed mt-3">
              Thiết kế UX/UI của trang được tối ưu để giúp bạn tìm sản phẩm nhanh hơn, thanh toán dễ dàng chỉ với vài bước và nhận hỗ trợ tận tâm khi cần.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-gutter max-w-5xl mx-auto px-4"
          >
            <motion.div variants={fadeIn} className="bg-surface-container-high p-stack-lg rounded-2xl flex flex-col items-center text-center group hover:shadow-md transition-all border border-transparent hover:border-primary/10">
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-stack-md group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[28px]">search</span>
              </div>
              <h3 className="text-headline-md font-bold mb-2">Tìm kiếm &amp; Khám phá nhanh</h3>
              <p className="text-on-surface-variant text-body-md leading-relaxed">Bộ lọc thông minh, đề xuất cá nhân giúp bạn tìm sản phẩm phù hợp trong vài giây.</p>
            </motion.div>

            <motion.div variants={fadeIn} className="bg-surface-container-high p-stack-lg rounded-2xl flex flex-col items-center text-center group hover:shadow-md transition-all border border-transparent hover:border-primary/10">
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-stack-md group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[28px]">payment</span>
              </div>
              <h3 className="text-headline-md font-bold mb-2">Thanh toán 1-click</h3>
              <p className="text-on-surface-variant text-body-md leading-relaxed">Thanh toán nhanh, nhiều phương thức, bảo mật cao và lưu thông tin an toàn để mua lại nhanh chóng.</p>
            </motion.div>

            <motion.div variants={fadeIn} className="bg-surface-container-high p-stack-lg rounded-2xl flex flex-col items-center text-center group hover:shadow-md transition-all border border-transparent hover:border-primary/10">
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-stack-md group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[28px]">support_agent</span>
              </div>
              <h3 className="text-headline-md font-bold mb-2">Hỗ trợ &amp; Đáng tin cậy</h3>
              <p className="text-on-surface-variant text-body-md leading-relaxed">Hỗ trợ trực tuyến 24/7, chính sách đổi trả rõ ràng và chứng nhận nguồn gốc minh bạch.</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Vì sao nên chọn RAU NHA MINH? */}
        <section className="py-stack-lg">
          <motion.h2
            {...fadeIn}
            className="text-headline-md font-bold text-primary mb-stack-lg text-center"
          >
            Vì sao nên chọn RAU NHA MINH?
          </motion.h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-gutter"
          >
            <motion.div
              variants={fadeIn}
              className="bg-surface-container-high p-stack-lg rounded-2xl flex flex-col items-center text-center group hover:shadow-md transition-all border border-transparent hover:border-primary/10"
            >
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-stack-md group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[32px]">verified</span>
              </div>
              <h3 className="text-headline-md font-bold mb-2">Chứng nhận hữu cơ</h3>
              <p className="text-on-surface-variant text-body-md leading-relaxed">Sản phẩm đạt chuẩn organic từ các tổ chức uy tín nhất Việt Nam và quốc tế.</p>
            </motion.div>
            <motion.div
              variants={fadeIn}
              className="bg-surface-container-high p-stack-lg rounded-2xl flex flex-col items-center text-center group hover:shadow-md transition-all border border-transparent hover:border-primary/10"
            >
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-stack-md group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[32px]">local_shipping</span>
              </div>
              <h3 className="text-headline-md font-bold mb-2">Giao hàng 2H</h3>
              <p className="text-on-surface-variant text-body-md leading-relaxed">Đảm bảo độ tươi ngon bằng quy trình vận chuyển thần tốc và chuyên nghiệp.</p>
            </motion.div>
            <motion.div
              variants={fadeIn}
              className="bg-surface-container-high p-stack-lg rounded-2xl flex flex-col items-center text-center group hover:shadow-md transition-all border border-transparent hover:border-primary/10"
            >
              <div className="w-16 h-16 bg-primary-container/20 rounded-full flex items-center justify-center text-primary mb-stack-md group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[32px]">handshake</span>
              </div>
              <h3 className="text-headline-md font-bold mb-2">Hỗ trợ nông dân</h3>
              <p className="text-on-surface-variant text-body-md leading-relaxed">Chúng tôi làm việc trực tiếp với các nông trại, mang lại giá trị công bằng cho cộng đồng.</p>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
