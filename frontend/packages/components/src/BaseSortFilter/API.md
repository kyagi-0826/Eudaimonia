# BaseSortFilter API リファレンス 📖

## 📦 コンポーネント一覧

### BaseSort
単一列のソート機能を提供するコンポーネント。

#### Props
| プロパティ | 型 | デフォルト | 説明 |
|------------|----|-----------|----- |
| `data` | `any[]` | - | ソート対象のデータ配列 |
| `config` | `SortConfig` | - | ソート設定オブジェクト |
| `disabled` | `boolean` | `false` | コンポーネントの無効化 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | コンポーネントサイズ |
| `theme` | `'light' \| 'dark'` | `'light'` | テーマ設定 |

#### Emits
| イベント | ペイロード | 説明 |
|----------|------------|------|
| `sort-changed` | `(data: any[], config: SortConfig)` | ソート状態変更時 |
| `update:data` | `(data: any[])` | データ更新時 |
| `update:config` | `(config: SortConfig)` | 設定更新時 |

#### 使用例
```vue
<BaseSort
  :data="employees"
  :config="nameSort"
  size="medium"
  @sort-changed="handleSort"
/>
```

---

### BaseFilter  
単一項目のフィルタ機能を提供するコンポーネント。

#### Props
| プロパティ | 型 | デフォルト | 説明 |
|------------|----|-----------|----- |
| `data` | `any[]` | - | フィルタ対象のデータ配列 |
| `config` | `FilterConfig` | - | フィルタ設定オブジェクト |
| `disabled` | `boolean` | `false` | コンポーネントの無効化 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | コンポーネントサイズ |
| `theme` | `'light' \| 'dark'` | `'light'` | テーマ設定 |

#### Emits
| イベント | ペイロード | 説明 |
|----------|------------|------|
| `filter-changed` | `(data: any[], config: FilterConfig)` | フィルタ状態変更時 |
| `update:data` | `(data: any[])` | データ更新時 |
| `update:config` | `(config: FilterConfig)` | 設定更新時 |

#### 使用例
```vue
<BaseFilter
  :data="employees"
  :config="departmentFilter"
  @filter-changed="handleFilter"
/>
```

---

### BaseSortFilter
ソートとフィルタを統合したコンポーネント。

#### Props
| プロパティ | 型 | デフォルト | 説明 |
|------------|----|-----------|----- |
| `data` | `any[]` | - | 処理対象のデータ配列 |
| `config` | `SortFilterConfig` | - | 統合設定オブジェクト |
| `disabled` | `boolean` | `false` | コンポーネントの無効化 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | コンポーネントサイズ |
| `theme` | `'light' \| 'dark'` | `'light'` | テーマ設定 |
| `showClearButton` | `boolean` | `true` | クリアボタン表示 |
| `showActiveConditions` | `boolean` | `true` | アクティブ条件表示 |

#### Emits
| イベント | ペイロード | 説明 |
|----------|------------|------|
| `data-changed` | `(data: any[], config: SortFilterConfig)` | データ処理完了時 |
| `update:data` | `(data: any[])` | データ更新時 |
| `update:config` | `(config: SortFilterConfig)` | 設定更新時 |

#### 使用例
```vue
<BaseSortFilter
  :data="employees"
  :config="sortFilterConfig"
  :showClearButton="true"
  :showActiveConditions="true"
  @data-changed="handleDataChange"
/>
```

## 🏗️ 型定義

### SortConfig
```typescript
interface SortConfig {
  key: string                     // ソート対象のキー
  direction: 'asc' | 'desc' | null // ソート方向
  label?: string                  // 表示ラベル
  type?: 'text' | 'number' | 'date' | 'boolean'  // データ型
}
```

### FilterConfig
```typescript
interface FilterConfig {
  key: string                     // フィルタ対象のキー
  label?: string                  // 表示ラベル
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  operator: FilterOperator        // 演算子
  value: any                      // フィルタ値
  enabled: boolean               // 有効/無効
}
```

### SortFilterConfig
```typescript
interface SortFilterConfig {
  sorts: SortConfig[]             // ソート設定配列
  filters: FilterConfig[]         // フィルタ設定配列
  multiSort: boolean             // 複数列ソート有効
  multiFilter: boolean           // 複数条件フィルタ有効
  filterLogic: 'AND' | 'OR'      // フィルタ条件の論理演算
}
```

### FilterOperator
```typescript
type FilterOperator = 
  | 'equals'          // 等しい
  | 'contains'        // 含む
  | 'startsWith'      // で始まる
  | 'endsWith'        // で終わる
  | 'greaterThan'     // より大きい
  | 'lessThan'        // より小さい
  | 'between'         // 範囲
  | 'in'              // いずれかに一致
```

## 🔧 ヘルパー関数

### createSortConfig
ソート設定を作成するヘルパー関数。

```typescript
function createSortConfig(
  key: string,
  options?: Partial<SortConfig>
): SortConfig
```

#### パラメータ
- `key`: ソート対象のキー
- `options`: 追加オプション

#### 例
```typescript
const nameSort = createSortConfig('name', {
  label: '名前',
  type: 'text'
})

const ageSort = createSortConfig('age', {
  label: '年齢', 
  type: 'number',
  direction: 'asc'
})
```

---

### createFilterConfig
フィルタ設定を作成するヘルパー関数。

```typescript
function createFilterConfig(
  key: string,
  type: FilterConfig['type'],
  operator: FilterConfig['operator'] = 'equals',
  options?: Partial<FilterConfig>
): FilterConfig
```

#### パラメータ
- `key`: フィルタ対象のキー
- `type`: データ型
- `operator`: 演算子（デフォルト: 'equals'）
- `options`: 追加オプション

#### 例
```typescript
// テキスト検索
const nameFilter = createFilterConfig('name', 'text', 'contains', {
  label: '名前検索'
})

// 数値範囲
const ageFilter = createFilterConfig('age', 'number', 'between', {
  label: '年齢範囲',
  value: [20, 30]
})

// セレクト
const deptFilter = createFilterConfig('department', 'select', 'equals', {
  label: '部署',
  enabled: true
})
```

---

### createSortFilterConfig
統合設定を作成するヘルパー関数。

```typescript
function createSortFilterConfig(
  sorts: SortConfig[] = [],
  filters: FilterConfig[] = [],
  options?: Partial<SortFilterConfig>
): SortFilterConfig
```

#### パラメータ
- `sorts`: ソート設定配列
- `filters`: フィルタ設定配列
- `options`: 追加オプション

#### 例
```typescript
const config = createSortFilterConfig(
  [
    createSortConfig('name', { label: '名前' }),
    createSortConfig('age', { label: '年齢', type: 'number' })
  ],
  [
    createFilterConfig('department', 'select', 'equals', { label: '部署' }),
    createFilterConfig('age', 'number', 'greaterThan', { label: '最小年齢' })
  ],
  {
    multiSort: true,
    multiFilter: true,
    filterLogic: 'AND'
  }
)
```

## 📊 演算子の詳細

### テキスト型演算子

#### `equals` - 完全一致
```typescript
// 完全に一致するアイテムを抽出
{ operator: 'equals', value: '営業' }
// → department が '営業' のアイテムのみ
```

#### `contains` - 部分一致
```typescript
// 指定文字列を含むアイテムを抽出
{ operator: 'contains', value: '田' }
// → name に '田' を含むアイテム
```

#### `startsWith` - 前方一致
```typescript
// 指定文字列で始まるアイテムを抽出
{ operator: 'startsWith', value: '株式' }
// → company が '株式' で始まるアイテム
```

#### `endsWith` - 後方一致
```typescript
// 指定文字列で終わるアイテムを抽出
{ operator: 'endsWith', value: '株式会社' }
// → company が '株式会社' で終わるアイテム
```

### 数値型演算子

#### `greaterThan` - より大きい
```typescript
// 指定値より大きいアイテムを抽出
{ operator: 'greaterThan', value: 30 }
// → age が 30 より大きいアイテム
```

#### `lessThan` - より小さい
```typescript
// 指定値より小さいアイテムを抽出
{ operator: 'lessThan', value: 50 }
// → age が 50 より小さいアイテム
```

#### `between` - 範囲
```typescript
// 指定範囲内のアイテムを抽出
{ operator: 'between', value: [20, 40] }
// → age が 20 以上 40 以下のアイテム
```

### 配列型演算子

#### `in` - いずれかに一致
```typescript
// 指定配列のいずれかと一致するアイテムを抽出
{ operator: 'in', value: ['営業', '開発', 'マーケティング'] }
// → department が配列のいずれかと一致するアイテム
```

## 🎨 スタイルカスタマイズ

### CSS変数
```css
:root {
  --sort-filter-primary: #3b82f6;
  --sort-filter-secondary: #6b7280; 
  --sort-filter-success: #10b981;
  --sort-filter-warning: #f59e0b;
  --sort-filter-danger: #ef4444;
  
  --sort-filter-radius: 0.5rem;
  --sort-filter-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

### カスタムクラス
```vue
<template>
  <BaseSortFilter
    :data="data"
    :config="config"
    class="custom-sort-filter"
  />
</template>

<style scoped>
.custom-sort-filter {
  /* カスタムスタイル */
  --sort-filter-primary: #8b5cf6;
  border-radius: 1rem;
}

.custom-sort-filter .sort-trigger {
  background: linear-gradient(45deg, #8b5cf6, #a78bfa);
}
</style>
```

## ⚙️ 高度な設定

### ネストしたオブジェクト
```typescript
// ネストしたプロパティのソート/フィルタ
const userProfileSort = createSortConfig('user.profile.name', {
  label: 'ユーザー名'
})

const addressFilter = createFilterConfig('user.address.city', 'text', 'equals', {
  label: '都市'
})
```

### カスタムデータ型
```typescript
// 独自の比較関数を使用
const customSort = createSortConfig('customField', {
  type: 'custom',
  compareFunction: (a, b) => {
    // カスタム比較ロジック
    return customCompare(a, b)
  }
})
```

### 動的設定変更
```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const config = ref(createSortFilterConfig([], []))

// 設定を動的に変更
const addSort = (key: string, label: string) => {
  config.value.sorts.push(createSortConfig(key, { label }))
}

const removeFilter = (index: number) => {
  config.value.filters.splice(index, 1)
}

// 設定変更の監視
watch(config, (newConfig) => {
  console.log('設定が変更されました:', newConfig)
}, { deep: true })
</script>
```

## 🚨 エラーハンドリング

### 一般的なエラーパターン

#### 1. データ型不一致
```typescript
// 問題: 数値フィルタに文字列データ
{ type: 'number', value: 'abc' }

// 解決: バリデーション実装
const validateFilterValue = (value: any, type: string) => {
  switch (type) {
    case 'number':
      return !isNaN(Number(value))
    case 'date':
      return !isNaN(Date.parse(value))
    default:
      return true
  }
}
```

#### 2. 存在しないキー
```typescript
// 問題: データに存在しないキーでソート
createSortConfig('nonExistentKey')

// 解決: キー存在チェック
const validateKey = (data: any[], key: string) => {
  return data.length > 0 && key.split('.').reduce(
    (obj, prop) => obj && obj[prop] !== undefined, 
    data[0]
  )
}
```

#### 3. 無効な演算子
```typescript
// 問題: 型に対して無効な演算子
{ type: 'boolean', operator: 'contains' }

// 解決: 演算子バリデーション
const validOperators = {
  text: ['equals', 'contains', 'startsWith', 'endsWith'],
  number: ['equals', 'greaterThan', 'lessThan', 'between'],
  boolean: ['equals'],
  date: ['equals', 'greaterThan', 'lessThan', 'between'],
  select: ['equals', 'in']
}
```

## 🔍 デバッグガイド

### ログの有効化
```typescript
// 開発環境でのデバッグログ
const config = createSortFilterConfig([], [], {
  debug: process.env.NODE_ENV === 'development'
})
```

### パフォーマンス測定
```typescript
const handleDataChange = (data: any[]) => {
  const startTime = performance.now()
  
  filteredData.value = data
  
  const endTime = performance.now()
  console.log(`処理時間: ${endTime - startTime}ms`)
}
```

### 状態のトレース
```vue
<script setup lang="ts">
import { watch } from 'vue'

// 設定変更のトレース
watch(config, (newConfig, oldConfig) => {
  console.group('設定変更')
  console.log('前:', oldConfig)
  console.log('後:', newConfig)
  console.groupEnd()
}, { deep: true })
</script>
```

このAPIリファレンスを活用して、BaseSortFilterパッケージを最大限に活用してください！ 🚀