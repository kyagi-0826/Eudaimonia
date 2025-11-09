import { 
  BaseSort, 
  BaseFilter, 
  BaseSortFilter,
  createSortConfig,
  createFilterConfig,
  createSortFilterConfig,
  type SortConfig,
  type FilterConfig,
  type SortFilterConfig
} from './index'

// サンプルデータ
const sampleData = [
  { id: 1, name: '田中太郎', age: 25, department: '営業', isActive: true },
  { id: 2, name: '佐藤花子', age: 30, department: 'マーケティング', isActive: false },
  { id: 3, name: '鈴木一郎', age: 35, department: '開発', isActive: true },
  { id: 4, name: '高橋美咲', age: 28, department: '営業', isActive: true },
  { id: 5, name: '田村次郎', age: 42, department: 'HR', isActive: false }
]

// 1. 単独ソートコンポーネントの使用例
export const sortExample = () => {
  const sortConfig: SortConfig = createSortConfig('name', {
    label: '名前',
    type: 'text'
  })

  return {
    data: sampleData,
    config: sortConfig,
    handleSortChanged: (data: any[], config: SortConfig) => {
      console.log('ソート結果:', data)
      console.log('ソート設定:', config)
    }
  }
}

// 2. 単独フィルタコンポーネントの使用例  
export const filterExample = () => {
  const filterConfig: FilterConfig = createFilterConfig('department', 'select', 'equals', {
    label: '部署',
    enabled: true
  })

  return {
    data: sampleData,
    config: filterConfig,
    handleFilterChanged: (data: any[], config: FilterConfig) => {
      console.log('フィルタ結果:', data)
      console.log('フィルタ設定:', config)
    }
  }
}

// 3. 統合コンポーネントの使用例
export const sortFilterExample = () => {
  const sortFilterConfig: SortFilterConfig = createSortFilterConfig(
    [
      createSortConfig('name', { label: '名前', type: 'text' }),
      createSortConfig('age', { label: '年齢', type: 'number' })
    ],
    [
      createFilterConfig('department', 'select', 'equals', { label: '部署' }),
      createFilterConfig('age', 'number', 'greaterThan', { label: '年齢' }),
      createFilterConfig('isActive', 'boolean', 'equals', { label: 'アクティブ' })
    ],
    {
      multiSort: true,
      multiFilter: true,
      filterLogic: 'AND'
    }
  )

  return {
    data: sampleData,
    config: sortFilterConfig,
    handleDataChanged: (data: any[], config: SortFilterConfig) => {
      console.log('処理結果:', data)
      console.log('現在の設定:', config)
    }
  }
}

// Vue テンプレート例（参考）
export const vueTemplateExamples = `
<!-- 1. 単独ソートの使用 -->
<BaseSort
  :data="employees"
  :config="nameSort"
  size="medium"
  @sort-changed="handleSortChanged"
/>

<!-- 2. 単独フィルタの使用 -->
<BaseFilter
  :data="employees"
  :config="departmentFilter"
  size="medium"
  @filter-changed="handleFilterChanged"
/>

<!-- 3. 統合コンポーネントの使用 -->
<BaseSortFilter
  :data="employees"
  :config="sortFilterConfig"
  size="medium"
  :showClearButton="true"
  :showActiveConditions="true"
  @data-changed="handleDataChanged"
/>

<!-- 4. テーブルと組み合わせた使用例 -->
<div class="table-with-controls">
  <div class="controls-section mb-4">
    <BaseSortFilter
      :data="originalData"
      :config="tableConfig"
      @data-changed="updateTableData"
    />
  </div>
  
  <table class="min-w-full">
    <thead>
      <tr>
        <th>名前</th>
        <th>年齢</th>
        <th>部署</th>
        <th>ステータス</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in filteredData" :key="row.id">
        <td>{{ row.name }}</td>
        <td>{{ row.age }}</td>
        <td>{{ row.department }}</td>
        <td>{{ row.isActive ? 'アクティブ' : '非アクティブ' }}</td>
      </tr>
    </tbody>
  </table>
</div>
`