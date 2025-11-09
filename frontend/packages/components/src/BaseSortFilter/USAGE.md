# BaseSortFilter 使用ガイド 🚀

このガイドでは、BaseSortFilterパッケージの詳細な使用方法とベストプラクティスを説明します。

## 📋 目次

1. [基本的な使用方法](#基本的な使用方法)
2. [高度な設定](#高度な設定)  
3. [実用的な例](#実用的な例)
4. [トラブルシューティング](#トラブルシューティング)
5. [パフォーマンス最適化](#パフォーマンス最適化)

## 🔰 基本的な使用方法

### 1. パッケージのインストール

```bash
npm install @your-org/base-sort-filter
```

### 2. 基本的なセットアップ

```vue
<template>
  <div class="data-management">
    <!-- データ操作コントロール -->
    <BaseSortFilter
      :data="employees" 
      :config="sortFilterConfig"
      @data-changed="handleDataUpdate"
    />
    
    <!-- データ表示 -->
    <div class="results">
      <div v-for="item in filteredData" :key="item.id">
        {{ item.name }} - {{ item.department }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  BaseSortFilter,
  createSortFilterConfig,
  createSortConfig,
  createFilterConfig
} from '@your-org/base-sort-filter'

// サンプルデータ
const employees = ref([
  { id: 1, name: '田中太郎', age: 25, department: '営業', salary: 400000 },
  { id: 2, name: '佐藤花子', age: 30, department: 'マーケティング', salary: 550000 },
  { id: 3, name: '鈴木一郎', age: 35, department: '開発', salary: 600000 }
])

const filteredData = ref([...employees.value])

// 設定の作成
const sortFilterConfig = createSortFilterConfig(
  // ソート設定
  [
    createSortConfig('name', { label: '名前' }),
    createSortConfig('age', { label: '年齢', type: 'number' }),
    createSortConfig('salary', { label: '給与', type: 'number' })
  ],
  // フィルタ設定  
  [
    createFilterConfig('department', 'select', 'equals', { label: '部署' }),
    createFilterConfig('age', 'number', 'greaterThan', { label: '年齢' }),
    createFilterConfig('name', 'text', 'contains', { label: '名前検索' })
  ]
)

// データ更新処理
const handleDataUpdate = (data: any[]) => {
  filteredData.value = data
  console.log('処理済みデータ:', data.length, '件')
}
</script>
```

## 🔧 高度な設定

### 複数列ソートの有効化

```typescript
const advancedConfig = createSortFilterConfig(
  [
    createSortConfig('department', { label: '部署' }),
    createSortConfig('age', { label: '年齢', type: 'number' })
  ],
  [],
  {
    multiSort: true // 複数列ソートを有効化
  }
)
```

### OR条件フィルタの設定

```typescript
const orFilterConfig = createSortFilterConfig(
  [],
  [
    createFilterConfig('department', 'select', 'equals', { label: '部署' }),
    createFilterConfig('isActive', 'boolean', 'equals', { label: 'アクティブ' })
  ],
  {
    filterLogic: 'OR' // OR条件でフィルタを適用
  }
)
```

### 範囲フィルタの使用

```typescript
const rangeConfig = createFilterConfig('salary', 'number', 'between', {
  label: '給与範囲',
  value: [400000, 600000] // 40万〜60万の範囲
})
```

## 📊 実用的な例

### 1. 顧客管理システム

```vue
<template>
  <div class="customer-management">
    <h2>顧客一覧</h2>
    
    <!-- フィルタ・ソートコントロール -->
    <BaseSortFilter
      :data="customers"
      :config="customerConfig"
      :showActiveConditions="true"
      :showClearButton="true"
      @data-changed="updateCustomerList"
    />

    <!-- 顧客テーブル -->
    <table class="table">
      <thead>
        <tr>
          <th>顧客名</th>
          <th>業界</th>
          <th>契約金額</th>
          <th>契約日</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="customer in filteredCustomers" :key="customer.id">
          <td>{{ customer.name }}</td>
          <td>{{ customer.industry }}</td>
          <td>¥{{ customer.contractAmount.toLocaleString() }}</td>
          <td>{{ formatDate(customer.contractDate) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const customers = ref([
  {
    id: 1,
    name: '株式会社A',
    industry: 'IT',
    contractAmount: 1500000,
    contractDate: '2023-01-15'
  },
  // ... more customers
])

const filteredCustomers = ref([...customers.value])

const customerConfig = createSortFilterConfig(
  [
    createSortConfig('name', { label: '顧客名' }),
    createSortConfig('contractAmount', { label: '契約金額', type: 'number' }),
    createSortConfig('contractDate', { label: '契約日', type: 'date' })
  ],
  [
    createFilterConfig('industry', 'select', 'equals', { label: '業界' }),
    createFilterConfig('contractAmount', 'number', 'greaterThan', { 
      label: '契約金額（最小）' 
    }),
    createFilterConfig('contractDate', 'date', 'between', { 
      label: '契約期間' 
    })
  ],
  {
    multiSort: true,
    multiFilter: true,
    filterLogic: 'AND'
  }
)

const updateCustomerList = (data: any[]) => {
  filteredCustomers.value = data
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ja-JP')
}
</script>
```

### 2. 商品カタログ

```vue
<template>
  <div class="product-catalog">
    <div class="sidebar">
      <!-- 個別フィルタコンポーネント -->
      <div class="filter-section">
        <h3>カテゴリ</h3>
        <BaseFilter
          :data="products"
          :config="categoryFilter"
          @filter-changed="updateCategoryFilter"
        />
      </div>
      
      <div class="filter-section">
        <h3>価格帯</h3>
        <BaseFilter
          :data="products"
          :config="priceFilter"
          @filter-changed="updatePriceFilter"
        />
      </div>
    </div>

    <div class="main-content">
      <!-- ソートコントロール -->
      <div class="sort-controls">
        <BaseSort
          :data="filteredProducts"
          :config="popularitySort"
          @sort-changed="updateSort"
        />
        <BaseSort
          :data="filteredProducts"
          :config="priceSort"
          @sort-changed="updateSort"
        />
      </div>

      <!-- 商品グリッド -->
      <div class="product-grid">
        <div v-for="product in displayProducts" :key="product.id" class="product-card">
          <img :src="product.image" :alt="product.name" />
          <h4>{{ product.name }}</h4>
          <p class="price">¥{{ product.price.toLocaleString() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 個別コンポーネントの組み合わせ例
const categoryFilter = createFilterConfig('category', 'select', 'equals', {
  label: 'カテゴリ'
})

const priceFilter = createFilterConfig('price', 'number', 'between', {
  label: '価格帯'
})

const popularitySort = createSortConfig('popularity', {
  label: '人気順',
  type: 'number'
})

const priceSort = createSortConfig('price', {
  label: '価格',
  type: 'number'
})
</script>
```

## ⚠️ トラブルシューティング

### 1. データが更新されない

**問題**: フィルタを適用してもデータが変更されない

**解決策**:
```typescript
// イベントハンドラが正しく設定されているか確認
const handleDataChange = (newData: any[], config: any) => {
  // 必ずリアクティブな変数に代入
  filteredData.value = newData
  
  // 設定も更新が必要な場合
  currentConfig.value = config
}
```

### 2. パフォーマンスの問題

**問題**: 大量データ（1000件以上）で動作が重い

**解決策**:
```typescript
// デバウンス機能の実装
import { debounce } from 'lodash-es'

const debouncedFilter = debounce((data: any[]) => {
  filteredData.value = data
}, 300)

const handleDataChange = (data: any[]) => {
  debouncedFilter(data)
}
```

### 3. 型エラーの解決

**問題**: TypeScript型エラーが発生

**解決策**:
```typescript
// 正しい型インポート
import type { 
  SortFilterConfig, 
  SortConfig, 
  FilterConfig 
} from '@your-org/base-sort-filter'

// 型アサーションの使用
const config: SortFilterConfig = createSortFilterConfig(
  // ...設定
) as SortFilterConfig
```

## 🚀 パフォーマンス最適化

### 1. メモ化の活用

```typescript
import { computed } from 'vue'

// 計算プロパティでメモ化
const expensiveFilteredData = computed(() => {
  return data.value.filter(item => {
    // 重い処理
    return complexFilter(item)
  })
})
```

### 2. 仮想スクロールとの組み合わせ

```vue
<template>
  <BaseSortFilter
    :data="rawData"
    :config="config"
    @data-changed="updateVirtualList"
  />
  
  <VirtualList
    :items="filteredData"
    :item-height="60"
    class="virtual-list"
  >
    <template #default="{ item }">
      <div class="list-item">{{ item.name }}</div>
    </template>
  </VirtualList>
</template>
```

### 3. インデックスの使用

```typescript
// 検索用インデックスの作成
const searchIndex = computed(() => {
  const index = new Map()
  data.value.forEach(item => {
    const searchKey = item.name.toLowerCase()
    if (!index.has(searchKey)) {
      index.set(searchKey, [])
    }
    index.get(searchKey).push(item)
  })
  return index
})
```

## 🎯 ベストプラクティス

### 1. 設定の分離

```typescript
// config/sortFilterConfigs.ts
export const employeeConfig = createSortFilterConfig(
  [/* ソート設定 */],
  [/* フィルタ設定 */],
  { multiSort: true }
)

export const productConfig = createSortFilterConfig(
  [/* ソート設定 */],
  [/* フィルタ設定 */],
  { filterLogic: 'OR' }
)
```

### 2. カスタムフック

```typescript
// composables/useSortFilter.ts
export function useSortFilter(initialData: Ref<any[]>) {
  const filteredData = ref([...initialData.value])
  const config = ref(createSortFilterConfig([], []))

  const handleDataChange = (data: any[], newConfig: any) => {
    filteredData.value = data
    config.value = newConfig
  }

  return {
    filteredData,
    config,
    handleDataChange
  }
}
```

### 3. エラーハンドリング

```typescript
const handleDataChange = (data: any[], config: any) => {
  try {
    filteredData.value = data
  } catch (error) {
    console.error('データ処理エラー:', error)
    // フォールバック処理
    filteredData.value = originalData.value
  }
}
```

このガイドを参考に、BaseSortFilterパッケージを効果的に活用してください！ 🎉