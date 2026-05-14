import { Link } from "react-router-dom";
import { PRODUCTS } from "../types";
import ProductCard from "../components/ProductCard";
import { motion } from "motion/react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
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

export default function Home() {
  return (
    <div className="flex flex-col bg-background min-h-screen">
      {/* Hero Carousel Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative h-[500px] w-full overflow-hidden rounded-[2.5rem] mx-auto max-w-[1280px] mt-8 shadow-xl group"
      >
        <img 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s] ease-out" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm9PDaD3aFo66bEjI1ltLaqLcM7nYGqHOqP9ij9yOGmCETHqSse6LfAOOEmrE8cakHyfshl4QEcg2SA3YTf7J7a_BbcfQXWb5mlkF8doSDFxd8Eyl-2v5Bw8VM2erzEo6AZATu7UHLzzOTVrHJpXx50-xmjvPdi9vmwNQZKnDPXl0K8v3w9c6AsQxw9hU3QlqO_VoLI0RcL-SQAgiuqhaJxfG6vDyL1s_w58omChw_18MdpODJfAy7F3pi55_5GdruFsBiU_ARPz0"
          alt="Fresh Organic Vegetables"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-center px-10 md:px-16 text-white">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="bg-primary/90 text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] w-fit mb-4 flex items-center gap-2 border border-white/20 backdrop-blur-sm">
              <span className="size-1.5 bg-white rounded-full animate-pulse" />
              Nông trại hữu cơ 100%
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 max-w-2xl leading-[1.1] tracking-tight">
              Mang trọn hương vị <br />
              <span className="text-primary-container">tươi sạch</span> từ thiên nhiên
            </h1>
            <p className="text-base md:text-lg mb-8 max-w-lg opacity-90 leading-relaxed font-medium">
              Khám phá bộ sưu tập rau củ và trái cây đạt chuẩn Organic quốc tế, thu hoạch mỗi ngày.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2 group/btn">
                Mua ngay
                <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link to="/shop" className="bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white hover:text-primary px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-300 active:scale-95">
                Khám phá ưu đãi
              </Link>
            </div>
          </motion.div>
        </div>
        {/* Carousel Dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <span className="w-16 h-1.5 bg-primary-container rounded-full"></span>
          <span className="w-3 h-3 border-2 border-white/50 rounded-full"></span>
          <span className="w-3 h-3 border-2 border-white/50 rounded-full"></span>
        </div>
      </motion.section>

      <div className="max-w-[1280px] mx-auto px-margin-desktop py-stack-lg w-full">
        {/* Sản phẩm mới về Section */}
        <motion.section 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
            {PRODUCTS.map((p, idx) => (
              <motion.div
                key={p.id}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0, transition: { duration: 0.5, delay: idx * 0.05 } }
                }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Khuyến mãi đặc biệt (Asymmetric Banner) */}
        <motion.section 
          {...fadeIn}
          className="bg-primary text-on-primary rounded-2xl overflow-hidden relative mb-20 shadow-xl"
        >
          <div className="grid md:grid-cols-2 items-center">
            <div className="p-stack-lg z-10">
              <span className="text-secondary-fixed font-bold text-label-lg mb-2 block uppercase tracking-wider">Giảm giá cuối tuần</span>
              <h2 className="text-headline-lg font-bold mb-stack-md leading-tight">Khuyến mãi đặc biệt lên đến 40% cho Trái cây nhập khẩu</h2>
              <p className="text-body-lg mb-stack-lg opacity-80 max-w-md leading-relaxed">Tận hưởng hương vị tươi ngon từ các nông trại hàng đầu thế giới với mức giá cực kỳ ưu đãi chỉ có trong tuần này.</p>
              <div className="flex items-center gap-gutter flex-wrap">
                <Link to="/shop" className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary-fixed transition-colors">Săn deal ngay</Link>
                <div className="text-white">
                  <p className="text-[10px] uppercase opacity-70 tracking-widest mb-1 font-bold">Kết thúc trong:</p>
                  <p className="font-bold text-price-display">02 : 14 : 55 : 30</p>
                </div>
              </div>
            </div>
            <div className="relative h-full min-h-[350px] overflow-hidden">
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

        {/* Sản phẩm yêu thích Section */}
        <motion.section 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter">
            {[...PRODUCTS].reverse().map((p, idx) => (
              <motion.div
                key={p.id + "_fav"}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0, transition: { duration: 0.5, delay: idx * 0.05 } }
                }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Về chúng tôi (Bento Grid Style) */}
        <section className="py-stack-lg">
          <motion.h2 
            {...fadeIn}
            className="text-headline-md font-bold text-primary mb-stack-lg text-center"
          >
            Vì sao nên chọn Organic Mart?
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
