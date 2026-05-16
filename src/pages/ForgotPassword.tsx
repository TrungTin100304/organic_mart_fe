import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "motion/react";
import { forgotPassword, resetPassword } from "@/services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Require token for password reset
    if (!token) {
      setError("Vui lòng nhập mã xác thực (token) trước khi cập nhật mật khẩu.");
      return;
    }

    // perform reset with token + new password
    if (!newPassword || newPassword.length < 8) {
      setError("Mật khẩu phải ít nhất 8 ký tự.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ token, newPassword });
      setResetSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Không thể cập nhật mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const sendResetEmail = async () => {
    setError("");
    if (!email) {
      setError("Vui lòng nhập email trước khi gửi.");
      return;
    }
    setIsSendingEmail(true);
    try {
      await forgotPassword({ email });
      setEmailSent(true);
    } catch (err: any) {
      setError(err?.message || "Không thể gửi email. Vui lòng thử lại.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleResend = async () => {
    // alias to sendResetEmail
    await sendResetEmail();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-6 md:py-10 px-4 md:px-10 bg-surface">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="max-w-[480px] w-full mx-auto relative"
      >
        {/* Back button top-left – mirrors Auth page */}

     

        <div className="bg-surface-container-lowest border border-outline-variant p-8 md:p-12 rounded-[28px] shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-on-surface font-headline-md text-headline-md mb-2">Quên mật khẩu?</h2>
            <p className="text-on-surface-variant font-body-md text-body-md">Nhập email của bạn để nhận hướng dẫn khôi phục mật khẩu.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">{error}</div>
          )}

          {resetSuccess ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-primary/10 text-primary rounded-xl text-sm md:text-base">Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể đăng nhập bằng mật khẩu mới.</div>
              <Link to="/login" className="inline-block mt-4 w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-bold py-3 md:py-4 rounded-xl transition-all text-sm md:text-base border border-outline-variant">Trở lại đăng nhập</Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-on-surface font-label-lg text-label-lg mb-2 ml-1" htmlFor="email">Địa chỉ Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">mail</span>
                  </div>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-full text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 outline-none"
                    id="email"
                    name="email"
                    placeholder="example@email.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email"
                  />
                  {/* Inline Send / Resend button inside the input */}
                  <button
                    type="button"
                    onClick={sendResetEmail}
                    disabled={isSendingEmail || isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-outline-variant hover:bg-white transition-all"
                    aria-label={emailSent ? 'Gửi lại email' : 'Gửi email'}
                  >
                    {isSendingEmail ? 'Đang gửi...' : emailSent ? 'Gửi lại' : 'Gửi'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-on-surface font-label-lg text-label-lg mb-2 ml-1" htmlFor="token">Mã xác thực (Token)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">key</span>
                  </div>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-full text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 outline-none"
                    id="token"
                    name="token"
                    placeholder="Nhập mã xác thực"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    aria-label="Token"
                  />
                </div>

              </div>

              <div>
                <label className="block text-on-surface font-label-lg text-label-lg mb-2 ml-1" htmlFor="new-password">Mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                  </div>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border border-outline-variant rounded-full text-on-surface font-body-md focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 outline-none"
                    id="new-password"
                    name="new-password"
                    placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    aria-label="Mật khẩu mới"
                  />
                </div>
              </div>

              <button
                className="w-full bg-primary text-on-primary py-4 rounded-full font-headline-md text-headline-md hover:bg-primary-container hover:shadow-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
                type="submit"
                disabled={isLoading || !token}
                title={!token ? 'Vui lòng nhập mã xác thực (token) để cập nhật mật khẩu' : undefined}
              >
                {isLoading ? (
                  <span>Đang xử lý...</span>
                ) : (
                  <>
                    <span>{'Cập nhật mật khẩu'}</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>

              {emailSent && !token && (
                 <div className="p-3 bg-primary/10 text-primary rounded-lg text-sm">
                   Một email hướng dẫn đặt lại mật khẩu đã được gửi đến <span className="font-bold">{email}</span>. Vui lòng kiểm tra hộp thư của bạn và nhập mã xác thực ở trên.
                 </div>
               )}

               <div className="mt-2 text-center">
                 <Link to="/login" className="text-on-surface-variant hover:text-primary transition-colors">Quay lại Đăng nhập</Link>
               </div>
             </form>
           )}
         </div>


       </motion.div>
     </div>
   );
 }
