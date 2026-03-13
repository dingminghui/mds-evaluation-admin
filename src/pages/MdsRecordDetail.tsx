import { fetchMdsRecordByWorkflowId } from "@/api/mds";
import type { MdsEvaluationRecord } from "@/types/mds";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";

const MED_STATUS_MAP: Record<string, string> = {
  unimproved: "贫血未改善",
  improved: "贫血改善",
  incomplete_course: "未足疗程使用",
  not_used: "未使用",
};

const EXTRACTION_STATUS_MAP: Record<string, string> = {
  SUCCESS: "成功",
  PARTIAL_SUCCESS: "部分成功",
  FAILED: "失败",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      dateStyle: "medium",
      timeStyle: "medium",
    });
  } catch {
    return iso;
  }
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 py-2">
      <span className="w-28 shrink-0 text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}

function ResultLevelBadge({ level }: { level: "high" | "low" }) {
  const isHigh = level === "high";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
        isHigh
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400"
          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400"
      }`}
    >
      {isHigh ? "高度疑似 MDS" : "低怀疑"}
    </span>
  );
}

export function MdsRecordDetail() {
  const { workflowId } = useParams<{ workflowId: string }>();

  const { data: record, isLoading, error } = useQuery({
    queryKey: ["mds-record", workflowId],
    queryFn: () => fetchMdsRecordByWorkflowId(workflowId ?? ""),
    enabled: !!workflowId,
  });

  if (!workflowId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">缺少 workflow_id</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-amber-600 dark:text-amber-400">
          {(error as Error).message}
        </p>
        <Link
          to="/records"
          className="text-sky-600 hover:underline dark:text-sky-400"
        >
          返回列表
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">加载中…</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-slate-500">未找到该记录</p>
        <Link
          to="/records"
          className="text-sky-600 hover:underline dark:text-sky-400"
        >
          返回列表
        </Link>
      </div>
    );
  }

  const r = record;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <h1 className="truncate font-mono text-sm text-slate-700 dark:text-slate-300">
            {r.workflow_id}
          </h1>
          <Link
            to="/records"
            className="text-sm text-sky-600 hover:underline dark:text-sky-400"
          >
            返回列表
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              报告图片
            </h2>
            {r.image_url ? (
              <a
                href={r.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-md border border-slate-200/80 dark:border-slate-600"
              >
                <img
                  src={r.image_url}
                  alt="MDS 评估报告"
                  className="h-auto w-full object-contain"
                />
              </a>
            ) : (
              <p className="text-slate-500">无图片</p>
            )}
          </section>

          <section className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              基本信息
            </h2>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              <InfoRow
                label="结果分级"
                value={<ResultLevelBadge level={r.result_level} />}
              />
              <InfoRow label="性别" value={r.gender === "male" ? "男" : "女"} />
              <InfoRow
                label="HGB"
                value={`${r.hgb.value}${r.hgb.unit ? ` ${r.hgb.unit}` : ""}`}
              />
              <InfoRow
                label="MCV"
                value={`${r.mcv.value}${r.mcv.unit ? ` ${r.mcv.unit}` : ""}`}
              />
              <InfoRow
                label="贫血时长"
                value={r.duration_4m ? "≥4 个月" : "<4 个月"}
              />
              <InfoRow
                label="用药状态"
                value={r.med_status ? MED_STATUS_MAP[r.med_status] ?? r.med_status : "未填"}
              />
              <InfoRow
                label="提取状态"
                value={EXTRACTION_STATUS_MAP[r.extraction_status] ?? r.extraction_status}
              />
              <InfoRow
                label="有效报告"
                value={r.is_valid_report ? "是" : "否"}
              />
              {r.extraction_reason && (
                <InfoRow label="提取说明" value={r.extraction_reason} />
              )}
              <InfoRow label="创建时间" value={formatDate(r.created_at)} />
            </div>
          </section>
        </div>

        {r.result_reasons.length > 0 && (
          <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              判定理由
            </h2>
            <ul className="list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300">
              {r.result_reasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </section>
        )}

        {r.result_actions.length > 0 && (
          <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              建议行动
            </h2>
            <ul className="list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300">
              {r.result_actions.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
