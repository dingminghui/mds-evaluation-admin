/** MDS 评估记录（云数据库结构） */
export interface MdsEvaluationRecord {
  _id: string;
  workflow_id: string;
  duration_4m: boolean;
  med_status: "unimproved" | "improved" | "incomplete_course" | "not_used" | null;
  image_url: string;
  gender: "male" | "female";
  hgb: { value: number; unit: string | null };
  mcv: {
    value: number;
    lower_bound: number | null;
    upper_bound: number | null;
    unit: string | null;
  };
  extraction_status: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";
  is_valid_report: boolean;
  extraction_reason: string | null;
  result_level: "high" | "low";
  result_reasons: string[];
  result_actions: string[];
  created_at: string;
}

/** 列表查询参数 */
export interface MdsListParams {
  page?: number;
  limit?: number;
  result_level?: "high" | "low";
  workflow_id?: string;
  sort?: "asc" | "desc";
}

/** 列表接口响应 */
export interface MdsListResponse {
  success: boolean;
  data: MdsEvaluationRecord[] | MdsEvaluationRecord | null;
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}
