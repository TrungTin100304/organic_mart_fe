import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

interface HeroBannerProps {
  badgeText?: string;
  title?: React.ReactNode;
  subtitle?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  imageSrc?: string;
}

export default function HeroBanner({
  badgeText = "Nông trại hữu cơ 100%",
  title = (
    <>
      Mang trọn hương vị <br />
      <span className="text-primary-container">tươi sạch</span> từ thiên nhiên
    </>
  ),
  subtitle = "Khám phá bộ sưu tập rau củ và trái cây đạt chuẩn Organic quốc tế, thu hoạch mỗi ngày.",
  primaryLabel = "Mua ngay",
  primaryTo = "/shop",
  secondaryLabel = "Khám phá ưu đãi",
  secondaryTo = "/shop",
  imageSrc = "https://lh3.googleusercontent.com/aida-public/AB6AXuAm9PDaD3aFo66bEjI1ltLaqLcM7nYGqHOqP9ij9yOGmCETHqSse6LfAOOEmrE8cakHyfshl4QEcg2SA3YTf7J7a_BbcfQXWb5mlkF8doSDFxd8Eyl-2v5Bw8VM2erzEo6AZATu7UHLzzOTVrHJpXx50-xmjvPdi9vmwNQZKnDPXl0K8v3w9c6AsQxw9hU3QlqO_VoLI0RcL-SQAgiuqhaJxfG6vDyL1s_w58omChw_18MdpODJfAy7F3pi55_5GdruFsBiU_ARPz0",
}: HeroBannerProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative h-[500px] md:h-[500px] w-full overflow-hidden md:rounded-[2.5rem] rounded-2xl shadow-xl group mt-stack-md md:mt-6 mb-stack-lg md:mb-16"
    >
      <img
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[10s] ease-out"
        src={imageSrc}
        alt="Hero"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />

      <div className="relative max-w-container-max mx-auto h-full flex flex-col justify-center px-margin-desktop text-white">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="bg-primary/90 text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] w-fit mb-4 flex items-center gap-2 border border-white/20 backdrop-blur-sm">
            <span className="size-1.5 bg-white rounded-full animate-pulse" />
            {badgeText}
          </span>

          <h1 className="text-3xl md:text-6xl font-bold mb-4 max-w-2xl leading-[1.1] tracking-tight">{title}</h1>

          <p className="text-sm md:text-lg mb-8 max-w-lg opacity-90 leading-relaxed font-medium">{subtitle}</p>

          <div className="flex flex-wrap gap-4">
            <Link to={primaryTo} className="bg-primary text-on-primary px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-300 hover:brightness-110 active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2 group/btn">
              {primaryLabel}
              <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
            <Link to={secondaryTo} className="bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white hover:text-primary px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-300 active:scale-95">
              {secondaryLabel}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <span className="w-16 h-1.5 bg-primary-container rounded-full" />
        <span className="w-3 h-3 border-2 border-white/50 rounded-full" />
        <span className="w-3 h-3 border-2 border-white/50 rounded-full" />
      </div>
    </motion.section>
  );
}
