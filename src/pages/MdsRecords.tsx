import { fetchMdsRecords } from "@/api/mds";
import type { MdsEvaluationRecord, MdsListParams } from "@/types/mds";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";

const RESULT_LEVEL_OPTIONS = [
  { value: "", label: "全部" },
  { value: "high", label: "高度疑似 MDS" },
  { value: "low", label: "低怀疑" },
] as const;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function ResultLevelBadge({ level }: { level: "high" | "low" }) {
  const isHigh = level === "high";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isHigh
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400"
          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400"
      }`}
    >
      {isHigh ? "高度疑似" : "低怀疑"}
    </span>
  );
}

function TableRow({ record }: { record: MdsEvaluationRecord }) {
  return (
    <tr className="border-b border-slate-200/80 transition-colors hover:bg-slate-50/80 dark:border-slate-700/80 dark:hover:bg-slate-800/40">
      <td className="py-3 pl-4 pr-2">
        <Link
          to={`/records/${record.workflow_id}`}
          className="font-mono text-sm text-sky-600 underline-offset-2 hover:underline dark:text-sky-400"
        >
          {record.workflow_id}
        </Link>
      </td>
      <td className="px-2 py-3">
        <ResultLevelBadge level={record.result_level} />
      </td>
      <td className="px-2 py-3 text-sm">
        {record.gender === "male" ? "男" : "女"}
      </td>
      <td className="px-2 py-3 font-mono text-sm">
        {record.hgb.value}
        {record.hgb.unit ? ` ${record.hgb.unit}` : ""}
      </td>
      <td className="px-2 py-3 font-mono text-sm">
        {record.mcv.value}
        {record.mcv.unit ? ` ${record.mcv.unit}` : ""}
      </td>
      <td className="px-2 py-3 text-sm">
        {record.duration_4m ? "≥4 月" : "<4 月"}
      </td>
      <td className="px-2 py-3 text-xs text-slate-500 dark:text-slate-400">
        {formatDate(record.created_at)}
      </td>
    </tr>
  );
}

export function MdsRecords() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const levelParam = searchParams.get("result_level");
  const levelFilter =
    levelParam === "high" || levelParam === "low" ? levelParam : "";

  const params: MdsListParams = {
    page,
    limit: 20,
    sort: "desc",
  };
  if (levelFilter) params.result_level = levelFilter;

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["mds-records", params],
    queryFn: () => fetchMdsRecords(params),
  });

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      prev.set("page", String(newPage));
      return prev;
    });
  };

  const handleLevelFilter = (val: string) => {
    const v = val === "high" || val === "low" ? val : "";
    setSearchParams((prev) => {
      if (v) prev.set("result_level", v);
      else prev.delete("result_level");
      prev.set("page", "1");
      return prev;
    });
  };

  const records = data?.success && Array.isArray(data.data) ? data.data : [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 20;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            MDS 评估记录
          </h1>
          <nav className="flex items-center gap-3">
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              首页
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              结果分级：
            </span>
            <select
              value={levelFilter}
              onChange={(e) => handleLevelFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {RESULT_LEVEL_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
          {error && (
            <div className="px-4 py-6 text-center text-amber-600 dark:text-amber-400">
              {(error as Error).message}
            </div>
          )}
          {isLoading ? (
            <div className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
              加载中…
            </div>
          ) : records.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
              暂无记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-700/80 dark:bg-slate-800/40">
                    <th className="py-3 pl-4 pr-2 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      workflow_id
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      结果分级
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      性别
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      HGB
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      MCV
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      贫血时长
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      创建时间
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <TableRow key={r.workflow_id} record={r} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200/80 px-4 py-3 dark:border-slate-700/80">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                共 {total} 条
                {isFetching && " · 更新中…"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="rounded px-3 py-1 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  上一页
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="rounded px-3 py-1 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
