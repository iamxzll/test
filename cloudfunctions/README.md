# 云开发数据库配置说明

## 集合说明

### 1. gears 集合（存储材料名称）

字段：
- `_id`: 自动生成
- `name`: 材料名称（字符串）
- `description`: 材料描述（字符串，可选）

示例数据：
```json
[
  { "name": "铁锭", "description": "基础金属材料" },
  { "name": "铜锭", "description": "导电性良好的金属材料" },
  { "name": "木头", "description": "常见的基础材料" },
  { "name": "布料", "description": "柔软的纺织材料" },
  { "name": "皮革", "description": "坚韧的动物皮" },
  { "name": "宝石", "description": "闪亮的珍贵宝石" }
]
```

### 2. materials 集合（存储装备信息）

字段：
- `_id`: 自动生成
- `name`: 装备名称（字符串）
- `description`: 装备描述（字符串，可选）
- `materials`: 制作材料列表（字符串数组）

示例数据：
```json
[
  {
    "name": "铁剑",
    "description": "一把锋利的铁制长剑，攻击力中等。",
    "materials": ["铁锭", "木头", "皮革"]
  },
  {
    "name": "铜盾",
    "description": "铜制盾牌，防御性能不错。",
    "materials": ["铜锭", "木头", "皮革"]
  },
  {
    "name": "布甲",
    "description": "轻便的布制护甲，适合敏捷职业。",
    "materials": ["布料", "皮革"]
  },
  {
    "name": "精钢长剑",
    "description": "经过千锤百炼的精钢长剑，攻击力极高。",
    "materials": ["铁锭", "宝石", "皮革"]
  },
  {
    "name": "法杖",
    "description": "蕴含魔力的法杖，增强法术效果。",
    "materials": ["木头", "宝石", "布料"]
  },
  {
    "name": "皮靴",
    "description": "舒适耐用的皮靴，提升移动速度。",
    "materials": ["皮革", "布料"]
  }
]
```

## 使用步骤

1. 在微信开发者工具中开通云开发
2. 在 app.js 中替换 `env: 'your-env-id'` 为你的云开发环境ID
3. 在云开发控制台创建两个集合：`gears` 和 `materials`
4. 向两个集合中导入上述示例数据
5. 设置集合权限（建议设置为"所有用户可读，仅创建者可读写"）
