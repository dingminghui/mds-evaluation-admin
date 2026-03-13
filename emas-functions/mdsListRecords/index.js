/**
 * MDS 评估记录查询云函数
 * HTTP 路径: GET /mds/records
 * 支持分页、筛选、排序
 * @see https://help.aliyun.com/document_detail/435914.html
 */

const COLLECTION_NAME = "mds_evaluation_records";
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

module.exports = async (ctx) => {
  try {
    const args = ctx.args || {};
    const query = args.queryStringParameters || args;
    const workflowId = query.workflow_id;
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT)
    );
    const resultLevel = query.result_level;
    const sortOrder = query.sort === "asc" ? 1 : -1;

    const db = ctx.mpserverless.db;

    if (workflowId && typeof workflowId === "string") {
      const findRes = await db
        .collection(COLLECTION_NAME)
        .find({ workflow_id: workflowId }, { limit: 1 });

      if (!findRes?.success || !findRes?.result?.length) {
        return jsonResponse(200, {
          success: true,
          data: null,
          total: 0,
        });
      }

      return jsonResponse(200, {
        success: true,
        data: findRes.result[0],
        total: 1,
      });
    }

    const filter = {};
    if (resultLevel && ["high", "low"].includes(resultLevel)) {
      filter.result_level = resultLevel;
    }

    const skip = (page - 1) * limit;

    const [listRes, countRes] = await Promise.all([
      db
        .collection(COLLECTION_NAME)
        .find(filter, {
          sort: { created_at: sortOrder },
          skip,
          limit,
        }),
      db.collection(COLLECTION_NAME).count(filter),
    ]);

    const total =
      countRes?.success && typeof countRes.result === "number"
        ? countRes.result
        : 0;
    const data = listRes?.success && Array.isArray(listRes.result)
      ? listRes.result
      : [];

    return jsonResponse(200, {
      success: true,
      data,
      total,
      page,
      limit,
    });
  } catch (err) {
    ctx.logger && ctx.logger.error("mdsListRecords 异常", err);
    return jsonResponse(500, {
      success: false,
      message: err.message || "查询失败",
    });
  }
};

function jsonResponse(statusCode, body) {
  return {
    mpserverlessComposedResponse: true,
    isBase64Encoded: false,
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
