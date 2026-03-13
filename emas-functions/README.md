# MDS 云函数

本目录存放需部署至 EMAS Serverless 的云函数代码。

## EMAS 云函数限制

- **上传顺序**：需先通过**附件上传**形式上传代码，再进行执行与发布操作
- **命名要求**：上传的 JS 包/文件名需与创建函数时填写的**函数名称**保持一致（如 `mdsListRecords.js` 对应函数名 `mdsListRecords`）

## mdsListRecords

**HTTP 路径**: `GET /mds/records`  
**功能**: 查询 `mds_evaluation_records` 集合，支持分页与筛选。

**目录结构**:
```
emas-functions/
  mdsListRecords/     # 函数包（zip 名与函数名一致）
    index.js           # 入口文件
  mdsListRecords.zip  # 打包产物，用于附件上传
```

### 部署步骤

1. 在 EMAS 控制台创建云函数，**函数名称**填写为 `mdsListRecords`
2. 打包：项目根目录执行 `pnpm emas:zip`，在 `emas-functions/` 下生成 `mdsListRecords.zip`
3. 通过**附件上传**上传 `mdsListRecords.zip`（内层入口为 index.js）
4. 配置 HTTP 触发，路径 `/mds/records`，方法 `GET`
5. 执行并发布

### 请求参数（Query）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| limit | number | 否 | 每页条数，默认 20，最大 100 |
| result_level | string | 否 | 筛选：`high` / `low` |
| workflow_id | string | 否 | 按 workflow_id 查询单条 |
| sort | string | 否 | 排序：`asc` / `desc`（按 created_at），默认 desc |

### 响应示例

**列表**:
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

**单条（workflow_id 查询）**:
```json
{
  "success": true,
  "data": { ... },
  "total": 1
}
```
