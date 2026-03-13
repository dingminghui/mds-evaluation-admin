import type { MdsEvaluationRecord, MdsListParams, MdsListResponse } from "@/types/mds";

/** 开发环境走代理避免跨域，生产环境直连 EMAS */
const endpoint =
  import.meta.env.DEV ? "/api/emas" : import.meta.env.VITE_EMAS_HTTP_ENDPOINT;

function buildQuery(params: MdsListParams): string {
  const search = new URLSearchParams();
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.result_level) search.set("result_level", params.result_level);
  if (params.workflow_id) search.set("workflow_id", params.workflow_id);
  if (params.sort) search.set("sort", params.sort);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchMdsRecords(
  params: MdsListParams = {}
): Promise<MdsListResponse> {
  const url = `${endpoint}/mds/records${buildQuery(params)}`;
  const res = await fetch(url);
  const json = (await res.json()) as MdsListResponse;
  if (!res.ok) {
    throw new Error(json?.message ?? `请求失败: ${res.status}`);
  }
  if (!json?.success) {
    throw new Error(json?.message ?? "查询失败");
  }
  return json;
}

/** 获取单条记录（按 workflow_id） */
export async function fetchMdsRecordByWorkflowId(
  workflowId: string
): Promise<MdsEvaluationRecord | null> {
  const json = await fetchMdsRecords({ workflow_id: workflowId });
  const data = json.data;
  if (Array.isArray(data) ? data.length === 0 : !data) {
    return null;
  }
  return Array.isArray(data) ? data[0] : data;
}
