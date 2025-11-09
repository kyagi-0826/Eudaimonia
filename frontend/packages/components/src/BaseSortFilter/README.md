# BaseSortFilter パッケージ 📊

独立して使用できるソート・フィルタコンポーネントパッケージです。Vue 3 + TypeScript で構築されており、テーブルシステムやリストビューで再利用可能です。

## 🚀 特徴

- **独立使用可能**: 各コンポーネントを個別に使用可能
- **TypeScript完全対応**: 型安全性を保証
- **リアクティブ**: Vue 3 Composition API使用
- **柔軟な設定**: 豊富なカスタマイズオプション
- **アクセシビリティ**: キーボード操作対応
- **レスポンシブ**: モバイル対応UI

## 📦 含まれるコンポーネント

### BaseSort 🔄
- 単一列のソート機能
- 昇順/降順/未ソート状態の切り替え
- 複数データ型対応（text, number, date, boolean）

### BaseFilter 🔍
- 多様な絞り込み条件
- インタラクティブなダイアログUI
- 10種類の演算子サポート

### BaseSortFilter 🎛️
- ソート+フィルタの統合コンポーネント
- 複数条件の組み合わせ
- アクティブ条件の可視化

## 🔧 使用方法

### 基本的な使用

\`\`\`vue
<template>
  <!-- 単独ソート -->
  <BaseSort
    :data="employees"
    :config="nameSort"
    @sort-changed="handleSortChanged"
  />

  <!-- 単独フィルタ -->
  <BaseFilter
    :data="employees"  
    :config="departmentFilter"
    @filter-changed="handleFilterChanged"
  />

  <!-- 統合コンポーネント -->
  <BaseSortFilter
    :data="employees"
    :config="sortFilterConfig"
    @data-changed="handleDataChanged"
  />
</template>

<script setup>
import { 
  BaseSort, 
  BaseFilter, 
  BaseSortFilter,
  createSortConfig,
  createFilterConfig,
  createSortFilterConfig
} from './BaseSortFilter'

// ソート設定
const nameSort = createSortConfig('name', {
  label: '名前',
  type: 'text'
})

// フィルタ設定
const departmentFilter = createFilterConfig('department', 'select', 'equals', {
  label: '部署',
  enabled: true
})

// 統合設定
const sortFilterConfig = createSortFilterConfig(
  [nameSort], 
  [departmentFilter]
)
</script>
\`\`\`

### 詳細設定例

\`\`\`typescript
// 複雑な設定例
const advancedConfig = createSortFilterConfig(
  [
    createSortConfig('name', { label: '名前', type: 'text' }),
    createSortConfig('createdAt', { label: '作成日', type: 'date' }),
    createSortConfig('score', { label: 'スコア', type: 'number' })
  ],
  [
    createFilterConfig('status', 'select', 'in', { 
      label: 'ステータス（複数選択）' 
    }),
    createFilterConfig('score', 'number', 'between', { 
      label: 'スコア範囲' 
    }),
    createFilterConfig('name', 'text', 'contains', { 
      label: '名前（部分一致）' 
    })
  ],
  {
    multiSort: true,      // 複数列ソート有効
    multiFilter: true,    // 複数条件フィルタ有効  
    filterLogic: 'AND'    // フィルタ条件の論理演算
  }
)
\`\`\`

## 🎨 スタイリング

Tailwind CSS を使用した完全カスタマイズ可能なデザインです。

### サイズバリエーション
\`\`\`vue
<BaseSort size="small" />   <!-- コンパクト -->
<BaseSort size="medium" />  <!-- 標準（デフォルト） -->
<BaseSort size="large" />   <!-- 大きめ -->
\`\`\`

### テーマ
\`\`\`vue
<BaseSort theme="light" />  <!-- ライトテーマ -->
<BaseSort theme="dark" />   <!-- ダークテーマ -->
\`\`\`

## 🛠️ 型定義

### SortConfig
\`\`\`typescript
interface SortConfig {
  key: string                     // ソート対象のキー
  direction: 'asc' | 'desc' | null // ソート方向
  label?: string                  // 表示ラベル
  type?: 'text' | 'number' | 'date' | 'boolean'
}
\`\`\`

### FilterConfig
\`\`\`typescript
interface FilterConfig {
  key: string                     // フィルタ対象のキー
  label?: string                  // 表示ラベル
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  operator: FilterOperator        // 演算子
  value: any                      // フィルタ値
  enabled: boolean               // 有効/無効
}
\`\`\`

### 利用可能な演算子
- \`equals\`: 等しい
- \`contains\`: 含む
- \`startsWith\`: で始まる
- \`endsWith\`: で終わる  
- \`greaterThan\`: より大きい
- \`lessThan\`: より小さい
- \`between\`: 範囲
- \`in\`: いずれかに一致

## 📋 イベント

### BaseSort
- \`sort-changed\`: ソート状態変更時
- \`update:data\`: データ更新時
- \`update:config\`: 設定更新時

### BaseFilter
- \`filter-changed\`: フィルタ状態変更時
- \`update:data\`: データ更新時
- \`update:config\`: 設定更新時

### BaseSortFilter
- \`data-changed\`: データ処理完了時
- \`update:data\`: データ更新時
- \`update:config\`: 設定更新時

## 🌟 実用例

### テーブルと組み合わせ
\`\`\`vue
<template>
  <div class="data-table">
    <!-- コントロール部分 -->
    <div class="mb-4 p-4 bg-gray-50 rounded-lg">
      <BaseSortFilter
        :data="originalData"
        :config="tableConfig"
        :showClearButton="true"
        :showActiveConditions="true"
        @data-changed="updateTable"
      />
    </div>

    <!-- テーブル部分 -->
    <table class="min-w-full">
      <thead>
        <tr>
          <th>名前</th>
          <th>年齢</th> 
          <th>部署</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in displayData" :key="row.id">
          <td>{{ row.name }}</td>
          <td>{{ row.age }}</td>
          <td>{{ row.department }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
\`\`\`

## 🎯 今後の拡張予定

- [ ] エクスポート機能（CSV、JSON）
- [ ] カスタムフィルタコンポーネント対応
- [ ] 保存済み設定機能
- [ ] アニメーション効果強化
- [ ] 国際化対応

## 🤝 コントリビューション

バグ報告や機能提案はお気軽に！