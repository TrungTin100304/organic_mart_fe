import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { getAdminAuditLogs, type AdminAuditLog } from "../../services/adminAuditLogService";

const entityTypes = ["", "ORDER", "USER", "PROMOTION", "DeliverySetting"];

export default function AuditLogs() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (targetPage = 0) => {
    setLoading(true);
    setError("");
    try {
      const result = await getAdminAuditLogs({ entityType: entityType || undefined, page: targetPage });
      setLogs(result.content);
      setPage(result.number);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải nhật ký.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(0);
  }, [entityType]);

  return (
    <div className="mx-auto max-w-[1440px] space-y-5">
      <div><h1 className="text-xl font-bold lg:text-2xl">Nhật ký quản trị</h1><p className="mt-1 text-sm text-on-surface-variant">{totalElements} hành động được ghi nhận</p></div>
      <select value={entityType} onChange={(event) => setEntityType(event.target.value)} className="rounded-xl border border-outline-variant/30 bg-white px-3 py-2 text-sm">
        {entityTypes.map((type) => <option key={type} value={type}>{type || "Tất cả đối tượng"}</option>)}
      </select>
      {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
      <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-white">
        {loading ? <div className="flex justify-center gap-2 py-16 text-on-surface-variant"><LoaderCircle className="h-5 w-5 animate-spin" /> Đang tải...</div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm">
            <thead className="bg-surface-container-low/30 text-left text-xs text-on-surface-variant"><tr><th className="px-5 py-3">Thời gian</th><th className="px-5 py-3">Hành động</th><th className="px-5 py-3">Đối tượng</th><th className="px-5 py-3">Người thực hiện</th><th className="px-5 py-3">Chi tiết</th></tr></thead>
            <tbody>{logs.map((log) => <tr key={log.id} className="border-t border-outline-variant/10"><td className="px-5 py-3 text-xs">{new Date(log.createdAt).toLocaleString("vi-VN")}</td><td className="px-5 py-3 font-semibold">{log.action}</td><td className="px-5 py-3">{log.entityType || "-"} {log.entityId ? `#${log.entityId}` : ""}</td><td className="px-5 py-3">{log.performedByEmail || "System"}</td><td className="px-5 py-3 text-on-surface-variant">{log.details || "-"}</td></tr>)}</tbody>
          </table></div>
        )}
        <div className="flex items-center justify-between border-t px-5 py-3 text-xs"><span>Trang {totalPages ? page + 1 : 0} / {totalPages}</span><div className="flex gap-1"><button disabled={page === 0 || loading} onClick={() => void load(page - 1)} className="p-2 disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button><button disabled={page + 1 >= totalPages || loading} onClick={() => void load(page + 1)} className="p-2 disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></div></div>
      </div>
    </div>
  );
}
