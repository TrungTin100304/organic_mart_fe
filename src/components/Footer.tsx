import { useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  if (isAuthPage) return null;

  return (
    <footer className="bg-secondary text-on-secondary w-full mt-auto">
      <div className="max-w-[1280px] mx-auto py-stack-lg px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter">
        <div className="col-span-1 md:col-span-1">
          <span className="text-xl font-bold text-on-secondary block mb-stack-md">Organic Mart</span>
          <p className="text-body-md opacity-80 mb-stack-md">Chuỗi cửa hàng thực phẩm sạch, mang sức khỏe bền vững đến mọi nhà.</p>
          <div className="flex gap-stack-sm">
            <a className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all" href="#">
              <span className="material-symbols-outlined">facebook</span>
            </a>
            <a className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all" href="#">
              <span className="material-symbols-outlined">share</span>
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-stack-md uppercase text-label-lg">Liên kết nhanh</h4>
          <ul className="flex flex-col gap-stack-sm text-tertiary-fixed-dim font-body-md text-body-md">
            <li><a className="hover:text-white transition-all hover:underline" href="#">Chính sách bảo mật</a></li>
            <li><a className="hover:text-white transition-all hover:underline" href="#">Điều khoản dịch vụ</a></li>
            <li><a className="hover:text-white transition-all hover:underline" href="#">Thông tin vận chuyển</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-stack-md uppercase text-label-lg">Hỗ trợ</h4>
          <ul className="flex flex-col gap-stack-sm text-tertiary-fixed-dim font-body-md text-body-md">
            <li><a className="hover:text-white transition-all hover:underline" href="#">Hỗ trợ khách hàng</a></li>
            <li><a className="hover:text-white transition-all hover:underline" href="#">Câu hỏi thường gặp</a></li>
            <li><a className="hover:text-white transition-all hover:underline" href="#">Liên hệ chúng tôi</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-stack-md uppercase text-label-lg">Bản tin</h4>
          <p className="text-body-md opacity-80 mb-stack-sm">Nhận thông tin ưu đãi mới nhất.</p>
          <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
            <input 
              className="bg-transparent border-none focus:ring-0 text-white text-body-md w-full px-2 outline-none" 
              placeholder="Email của bạn" 
              type="email" 
            />
            <button className="bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-bold text-label-lg">Gửi</button>
          </div>
        </div>
      </div>
      <div className="max-w-[1280px] mx-auto px-margin-desktop py-stack-md border-t border-white/10 flex flex-col md:flex-row justify-between items-center opacity-70 font-body-md text-body-md">
        <span>© 2024 Organic Mart. Bảo lưu mọi quyền. Phát triển bởi Sapo.</span>
        <div className="flex gap-gutter mt-2 md:mt-0">
          <span>Facebook</span>
          <span>Instagram</span>
        </div>
      </div>
    </footer>
  );
}
