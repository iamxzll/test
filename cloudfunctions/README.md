# 云开发数据库配置说明

## 集合说明

### 1. gears 集合（存储材料信息）

字段：
- `_id`: 自动生成（云数据库自带）
- `id`: 材料ID（字符串，用于与装备的 materials.m_name 关联）
- `name`: 材料名称（字符串）

示例数据：
```json
[
  { "id": "mat_001", "name": "铁锭" },
  { "id": "mat_002", "name": "铜锭" },
  { "id": "mat_003", "name": "木头" },
  { "id": "mat_004", "name": "布料" },
  { "id": "mat_005", "name": "皮革" },
  { "id": "mat_006", "name": "宝石" }
]
```

### 2. materials 集合（存储装备信息）

字段：
- `_id`: 自动生成（云数据库自带）
- `name`: 装备名称（字符串）
- `body`: 装备部位（字符串，如：武器、胸部、脚部、副手等）
- `type`: 装备类型（字符串，如：单手剑、盾牌、布甲、皮甲等）
- `materials`: 制作材料列表（对象数组）
  - `m_name`: 材料ID（对应 gears 集合中的 id 字段）
  - `count`: 材料数量（数字）

示例数据：
```json
[
  {
    "name": "铁剑",
    "body": "武器",
    "type": "单手剑",
    "materials": [
      { "m_name": "mat_001", "count": 5 },
      { "m_name": "mat_003", "count": 2 },
      { "m_name": "mat_005", "count": 1 }
    ]
  },
  {
    "name": "铜盾",
    "body": "副手",
    "type": "盾牌",
    "materials": [
      { "m_name": "mat_002", "count": 8 },
      { "m_name": "mat_003", "count": 3 },
      { "m_name": "mat_005", "count": 2 }
    ]
  },
  {
    "name": "布甲",
    "body": "胸部",
    "type": "布甲",
    "materials": [
      { "m_name": "mat_004", "count": 10 },
      { "m_name": "mat_005", "count": 3 }
    ]
  },
  {
    "name": "精钢长剑",
    "body": "武器",
    "type": "双手剑",
    "materials": [
      { "m_name": "mat_001", "count": 12 },
      { "m_name": "mat_006", "count": 2 },
      { "m_name": "mat_005", "count": 2 }
    ]
  },
  {
    "name": "法杖",
    "body": "武器",
    "type": "法杖",
    "materials": [
      { "m_name": "mat_003", "count": 3 },
      { "m_name": "mat_006", "count": 5 },
      { "m_name": "mat_004", "count": 2 }
    ]
  },
  {
    "name": "皮靴",
    "body": "脚部",
    "type": "皮甲",
    "materials": [
      { "m_name": "mat_005", "count": 6 },
      { "m_name": "mat_004", "count": 2 }
    ]
  }
]
```

## 使用步骤

1. 在微信开发者工具中开通云开发
2. 在 [app.js](../app.js) 中替换 `env: 'your-env-id'` 为你的云开发环境ID
3. 在云开发控制台创建两个集合：`gears` 和 `materials`
4. 向两个集合中导入上述示例数据
5. 设置集合权限（建议设置为"所有用户可读，仅创建者可读写"）

## 搜索逻辑说明

### 按装备搜索
- 在 `materials` 集合中按 `name` 字段进行模糊搜索
- 查询到装备后，再根据 `materials.m_name` 关联查询 `gears` 集合获取材料名称

### 按材料搜索
- 先在 `gears` 集合中按 `name` 字段进行模糊搜索，找到匹配的材料ID
- 再用材料ID在 `materials` 集合中查询 `materials.m_name` 包含该ID的装备
- 最后同样关联查询材料名称用于显示
