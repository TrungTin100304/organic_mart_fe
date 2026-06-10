import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Star, Check, X, LoaderCircle } from "lucide-react";
import AdminConfirmModal from "../components/AdminConfirmModal";
import {
  getAdminReviews,
  approveReview,
  rejectReview,
  type AdminReview,
} from "../../services/adminReviewService";

const statusMap: Record<AdminReview["reviewStatus"], { label: string; cls: string }> = {
  PENDING: { label: "Chờ duyệt", cls: "bg-amber-50 text-amber-700" },
  APPROVED: { label: "Đã duyệt", cls: "bg-emerald-50 text-emerald-700" },
  REJECTED: { label: "Từ chối", cls: "bg-red-50 text-red-600" },
};

export default function Reviews() {
  const [filter, setFilter] = useState<"all" | AdminReview["reviewStatus"]>("all");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [reviewToReject, setReviewToReject] = useState<AdminReview | null>(null);

  const load = async (targetPage = page) => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminReviews({
        status: filter === "all" ? undefined : filter,
        page: targetPage,
        size: 20,
      });
      setReviews(result.content);
      setPage(result.number);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải đánh giá.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(0); }, [filter]);

  const handleApprove = async (review: AdminReview) => {
    setProcessingId(review.id);
    try {
      await approveReview(review.id);
      setReviews((current) =>
        current.map((r) => r.id === review.id ? { ...r, reviewStatus: "APPROVED" as const } : r)
      );
    } catch {
      setError("Không thể duyệt đánh giá.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (review: AdminReview) => {
    setReviewToReject(review);
  };

  const handleConfirmReject = async () => {
    if (!reviewToReject) return;
    setProcessingId(reviewToReject.id);
    try {
      await rejectReview(reviewToReject.id);
      setReviews((current) =>
        current.map((r) => r.id === reviewToReject.id ? { ...r, reviewStatus: "REJECTED" as const } : r)
      );
      setReviewToReject(null);
    } catch {
      setError("Không thể từ chối đánh giá.");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = reviews.filter((r) => filter === "all" || r.reviewStatus === filter);

  return (
    <div className="space-y-5 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl lg:text-2xl font-bold text-on-surface">Đánh giá sản phẩm</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          {reviews.filter((r) => r.reviewStatus === "PENDING").length} đánh giá chờ duyệt
        </p>
      </motion.div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="flex bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-0.5 self-start w-fit">
        {(["all", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === f
                ? "bg-primary text-white shadow-sm"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            {f === "all" ? "Tất cả" : statusMap[f].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-on-surface-variant">
          <LoaderCircle className="w-5 h-5 animate-spin" /> Đang tải...
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-on-surface-variant">Không có đánh giá nào.</div>
            ) : (
              filtered.map((r, i) => {
                const st = statusMap[r.reviewStatus];
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-surface-container-lowest rounded-2xl border border-outline-variant/20 p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-primary-container/30 flex items-center justify-center text-primary font-bold text-sm">
                            {r.userFullName.split(" ").slice(-1)[0]?.[0] ?? "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-on-surface">{r.userFullName}</p>
                            <p className="text-[11px] text-on-surface-variant">
                              {new Date(r.createdAt).toLocaleString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-on-surface-variant mb-1.5">
                          Sản phẩm: <strong className="text-on-surface">{r.productName}</strong>
                        </p>
                        <div className="flex gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              className={`w-3.5 h-3.5 ${
                                j < r.rating ? "fill-amber-400 text-amber-400" : "text-surface-container-high"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-on-surface leading-relaxed">{r.comment || "(Không có bình luận)"}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st.cls}`}>
                          {st.label}
                        </span>
                        {r.reviewStatus === "PENDING" && (
                          <div className="flex gap-1">
                            <button
                              disabled={processingId === r.id}
                              onClick={() => void handleApprove(r)}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                              title="Duyệt"
                            >
                              {processingId === r.id ? (
                                <LoaderCircle className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              disabled={processingId === r.id}
                              onClick={() => handleReject(r)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Từ chối"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
              <span className="text-xs text-on-surface-variant">
                Trang {page + 1} / {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={page === 0}
                  onClick={() => void load(page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-bold disabled:opacity-30 hover:bg-surface-container transition-colors"
                >
                  Trước
                </button>
                <button
                  disabled={page + 1 >= totalPages}
                  onClick={() => void load(page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-bold disabled:opacity-30 hover:bg-surface-container transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <AdminConfirmModal
        open={Boolean(reviewToReject)}
        title="Từ chối đánh giá"
        message={`Từ chối đánh giá của "${reviewToReject?.userFullName}" cho sản phẩm "${reviewToReject?.productName}"?`}
        confirmLabel="Từ chối"
        isProcessing={processingId !== null}
        onClose={() => !processingId && setReviewToReject(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}
