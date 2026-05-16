import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  if (isAuthPage) return null;

  return (
    <footer className="bg-secondary text-on-secondary w-full mt-auto">
      <div className="max-w-[1280px] mx-auto py-8 md:py-16 px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <span className="text-xl font-bold text-on-secondary block mb-4">Organic Mart</span>
          <p className="text-sm md:text-base opacity-80 mb-6">Chuỗi cửa hàng thực phẩm sạch, mang sức khỏe bền vững đến mọi nhà.</p>
          <div className="flex gap-3">
            <a className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all" href="#">
              <span className="material-symbols-outlined">facebook</span>
            </a>
            <a className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all" href="#">
              <span className="material-symbols-outlined">share</span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Liên kết nhanh</h4>
          <ul className="flex flex-col gap-3 text-tertiary-fixed-dim font-body-md text-sm md:text-base">
            <li><a className="hover:text-white transition-all hover:underline" href="#">Chính sách bảo mật</a></li>
            <li><a className="hover:text-white transition-all hover:underline" href="#">Điều khoản dịch vụ</a></li>
            <li><a className="hover:text-white transition-all hover:underline" href="#">Thông tin vận chuyển</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Hỗ trợ</h4>
          <ul className="flex flex-col gap-3 text-tertiary-fixed-dim font-body-md text-sm md:text-base">
            <li><a className="hover:text-white transition-all hover:underline" href="#">Hỗ trợ khách hàng</a></li>
            <li><a className="hover:text-white transition-all hover:underline" href="#">Câu hỏi thường gặp</a></li>
            <li><a className="hover:text-white transition-all hover:underline" href="#">Liên hệ chúng tôi</a></li>
          </ul>
        </div>
        <div className="col-span-1 sm:col-span-2 md:col-span-1">
          <h4 className="font-bold mb-4 uppercase text-sm tracking-wider">Bản tin</h4>
          <p className="text-sm opacity-80 mb-3">Nhận thông tin ưu đãi mới nhất.</p>
          <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
            <input 
              className="bg-transparent border-none focus:ring-0 text-white text-sm w-full px-3 outline-none"
              placeholder="Email của bạn"
              type="email" 
            />
            <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-bold text-sm">Gửi</button>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center opacity-70 font-body-md text-sm text-center md:text-left gap-4 md:gap-0">
        <span>© 2024 Organic Mart. Bản quyền thuộc về chúng tôi.</span>
        <div className="flex gap-6 mt-2 md:mt-0">
          <span>Facebook</span>
          <span>Instagram</span>
        </div>
      </div>
    </footer>
  );
}
