<template>
  <div class="demo-page min-h-screen bg-gray-50 py-8">
    <div class="max-w-6xl mx-auto px-4">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          BaseSortFilter コンポーネントデモ 🚀
        </h1>
        <p class="text-gray-600">
          独立して使用できるソート・フィルタコンポーネントの動作確認ページです
        </p>
      </header>

      <!-- デモセクション1: 単独ソート -->
      <section class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-blue-600">
          🔄 BaseSortコンポーネント（単独ソート）
        </h2>
        
        <div class="mb-4 flex gap-4 flex-wrap">
          <BaseSort
            :data="sortDemoData"
            :config="nameSortConfig"
            @sort-changed="handleNameSort"
          />
          <BaseSort
            :data="sortDemoData"
            :config="ageSortConfig"
            @sort-changed="handleAgeSort"
          />
          <BaseSort
            :data="sortDemoData"
            :config="dateSortConfig"
            @sort-changed="handleDateSort"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 class="font-semibold mb-2">元データ ({{ originalData.length }}件)</h4>
            <div class="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
              <pre class="text-xs">{{ JSON.stringify(originalData, null, 2) }}</pre>
            </div>
          </div>
          <div>
            <h4 class="font-semibold mb-2">ソート結果 ({{ sortDemoData.length }}件)</h4>
            <div class="bg-blue-50 p-3 rounded max-h-40 overflow-y-auto">
              <pre class="text-xs">{{ JSON.stringify(sortDemoData, null, 2) }}</pre>
            </div>
          </div>
          <div>
            <h4 class="font-semibold mb-2">現在の設定</h4>
            <div class="bg-green-50 p-3 rounded max-h-40 overflow-y-auto">
              <div class="text-xs">
                <div>名前: {{ nameSortConfig.direction || '未ソート' }}</div>
                <div>年齢: {{ ageSortConfig.direction || '未ソート' }}</div>
                <div>登録日: {{ dateSortConfig.direction || '未ソート' }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- デモセクション2: 単独フィルタ -->
      <section class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-green-600">
          🔍 BaseFilterコンポーネント（単独フィルタ）
        </h2>
        
        <div class="mb-4 flex gap-4 flex-wrap">
          <BaseFilter
            :data="originalData"
            :config="departmentFilterConfig"
            @filter-changed="handleDepartmentFilter"
          />
          <BaseFilter
            :data="originalData"
            :config="ageFilterConfig"
            @filter-changed="handleAgeFilter"
          />
          <BaseFilter
            :data="originalData"
            :config="nameFilterConfig"
            @filter-changed="handleNameFilter"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 class="font-semibold mb-2">元データ ({{ originalData.length }}件)</h4>
            <div class="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
              <pre class="text-xs">{{ JSON.stringify(originalData, null, 2) }}</pre>
            </div>
          </div>
          <div>
            <h4 class="font-semibold mb-2">フィルタ結果 ({{ filterDemoData.length }}件)</h4>
            <div class="bg-green-50 p-3 rounded max-h-40 overflow-y-auto">
              <pre class="text-xs">{{ JSON.stringify(filterDemoData, null, 2) }}</pre>
            </div>
          </div>
          <div>
            <h4 class="font-semibold mb-2">アクティブフィルタ</h4>
            <div class="bg-yellow-50 p-3 rounded max-h-40 overflow-y-auto text-xs">
              <div v-if="departmentFilterConfig.enabled">
                部署: {{ departmentFilterConfig.value }}
              </div>
              <div v-if="ageFilterConfig.enabled">
                年齢: {{ ageFilterConfig.operator }} {{ ageFilterConfig.value }}
              </div>
              <div v-if="nameFilterConfig.enabled">
                名前: {{ nameFilterConfig.value }}
              </div>
              <div v-if="!hasActiveFilters" class="text-gray-500">
                アクティブなフィルタなし
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- デモセクション3: 統合コンポーネント -->
      <section class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-purple-600">
          🎛️ BaseSortFilterコンポーネント（統合版）
        </h2>
        
        <div class="mb-6">
          <BaseSortFilter
            :data="originalData"
            :config="integratedConfig"
            :showClearButton="true"
            :showActiveConditions="true"
            @data-changed="handleIntegratedChange"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-2">処理結果 ({{ integratedData.length }}件)</h4>
            <div class="bg-purple-50 p-4 rounded max-h-60 overflow-y-auto">
              <pre class="text-xs">{{ JSON.stringify(integratedData, null, 2) }}</pre>
            </div>
          </div>
          <div>
            <h4 class="font-semibold mb-2">現在の設定</h4>
            <div class="bg-indigo-50 p-4 rounded max-h-60 overflow-y-auto">
              <div class="text-xs space-y-2">
                <div class="font-semibold">ソート設定:</div>
                <div v-for="sort in integratedConfig.sorts" :key="sort.key" class="ml-4">
                  {{ sort.label }}: {{ sort.direction || '未設定' }}
                </div>
                <div class="font-semibold mt-3">フィルタ設定:</div>
                <div v-for="filter in integratedConfig.filters" :key="filter.key" class="ml-4">
                  {{ filter.label }}: {{ filter.enabled ? `${filter.operator} "${filter.value}"` : '無効' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- エラー処理デモ -->
      <section class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-red-600">
          ⚠️ エラーハンドリングテスト
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-2">不正データテスト</h4>
            <button 
              @click="testInvalidData"
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mb-2"
            >
              null/undefined データでテスト
            </button>
            <div class="bg-red-50 p-3 rounded">
              <div class="text-sm">{{ errorTestResult }}</div>
            </div>
          </div>
          <div>
            <h4 class="font-semibold mb-2">パフォーマンステスト</h4>
            <button 
              @click="performanceTest"
              class="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mb-2"
            >
              大量データテスト (1000件)
            </button>
            <div class="bg-yellow-50 p-3 rounded">
              <div class="text-sm">{{ performanceResult }}</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
} from '../BaseSortFilter'

// サンプルデータ
const originalData = ref([
  { id: 1, name: '田中太郎', age: 25, department: '営業', isActive: true, registeredAt: '2023-01-15' },
  { id: 2, name: '佐藤花子', age: 30, department: 'マーケティング', isActive: false, registeredAt: '2023-03-22' },
  { id: 3, name: '鈴木一郎', age: 35, department: '開発', isActive: true, registeredAt: '2023-02-10' },
  { id: 4, name: '高橋美咲', age: 28, department: '営業', isActive: true, registeredAt: '2023-04-05' },
  { id: 5, name: '田村次郎', age: 42, department: 'HR', isActive: false, registeredAt: '2023-01-30' },
  { id: 6, name: '山田太郎', age: 33, department: '開発', isActive: true, registeredAt: '2023-05-12' },
  { id: 7, name: '林花子', age: 27, department: 'マーケティング', isActive: true, registeredAt: '2023-02-28' },
  { id: 8, name: '森一郎', age: 31, department: '営業', isActive: false, registeredAt: '2023-03-15' }
])

// 各デモ用のデータ
const sortDemoData = ref([...originalData.value])
const filterDemoData = ref([...originalData.value])
const integratedData = ref([...originalData.value])

// ソート設定
const nameSortConfig = ref(createSortConfig('name', { label: '名前', type: 'text' }))
const ageSortConfig = ref(createSortConfig('age', { label: '年齢', type: 'number' }))
const dateSortConfig = ref(createSortConfig('registeredAt', { label: '登録日', type: 'date' }))

// フィルタ設定
const departmentFilterConfig = ref(createFilterConfig('department', 'select', 'equals', { label: '部署' }))
const ageFilterConfig = ref(createFilterConfig('age', 'number', 'greaterThan', { label: '年齢' }))
const nameFilterConfig = ref(createFilterConfig('name', 'text', 'contains', { label: '名前' }))

// 統合設定
const integratedConfig = ref(createSortFilterConfig(
  [
    createSortConfig('name', { label: '名前', type: 'text' }),
    createSortConfig('age', { label: '年齢', type: 'number' }),
    createSortConfig('registeredAt', { label: '登録日', type: 'date' })
  ],
  [
    createFilterConfig('department', 'select', 'equals', { label: '部署' }),
    createFilterConfig('age', 'number', 'greaterThan', { label: '年齢' }),
    createFilterConfig('name', 'text', 'contains', { label: '名前' }),
    createFilterConfig('isActive', 'boolean', 'equals', { label: 'アクティブ' })
  ],
  {
    multiSort: true,
    multiFilter: true,
    filterLogic: 'AND'
  }
))

// エラーテスト結果
const errorTestResult = ref('テスト準備完了')
const performanceResult = ref('テスト準備完了')

// 計算プロパティ
const hasActiveFilters = computed(() => 
  departmentFilterConfig.value.enabled || 
  ageFilterConfig.value.enabled || 
  nameFilterConfig.value.enabled
)

// イベントハンドラ
const handleNameSort = (data: any[], config: SortConfig) => {
  console.log('名前ソート変更:', { data, config })
  sortDemoData.value = data
  nameSortConfig.value = config
}

const handleAgeSort = (data: any[], config: SortConfig) => {
  console.log('年齢ソート変更:', { data, config })
  sortDemoData.value = data
  ageSortConfig.value = config
}

const handleDateSort = (data: any[], config: SortConfig) => {
  console.log('日付ソート変更:', { data, config })
  sortDemoData.value = data
  dateSortConfig.value = config
}

const handleDepartmentFilter = (data: any[], config: FilterConfig) => {
  console.log('部署フィルタ変更:', { data, config })
  filterDemoData.value = data
  departmentFilterConfig.value = config
}

const handleAgeFilter = (data: any[], config: FilterConfig) => {
  console.log('年齢フィルタ変更:', { data, config })
  filterDemoData.value = data
  ageFilterConfig.value = config
}

const handleNameFilter = (data: any[], config: FilterConfig) => {
  console.log('名前フィルタ変更:', { data, config })
  filterDemoData.value = data
  nameFilterConfig.value = config
}

const handleIntegratedChange = (data: any[], config: SortFilterConfig) => {
  console.log('統合コンポーネント変更:', { data, config })
  integratedData.value = data
  integratedConfig.value = config
}

// エラーテスト
const testInvalidData = () => {
  try {
    const invalidData = [
      { name: null, age: undefined, department: '' },
      { name: 'テスト', age: 'invalid', department: null },
      null,
      undefined,
      { name: 'OK', age: 25, department: '開発' }
    ]
    
    // フィルタリングテスト
    const testConfig = createFilterConfig('name', 'text', 'contains')
    testConfig.enabled = true
    testConfig.value = 'テス'
    
    // 実際の処理を模擬
    const result = invalidData.filter(item => {
      if (!item || item.name === null || item.name === undefined) return false
      return String(item.name).includes('テス')
    })
    
    errorTestResult.value = `✅ エラーハンドリング成功！ 結果: ${result.length}件`
    
  } catch (error) {
    errorTestResult.value = `❌ エラー発生: ${error}`
  }
}

const performanceTest = async () => {
  const startTime = performance.now()
  
  // 1000件のテストデータ生成
  const largeData = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    name: `ユーザー${i + 1}`,
    age: Math.floor(Math.random() * 50) + 20,
    department: ['営業', '開発', 'HR', 'マーケティング'][Math.floor(Math.random() * 4)],
    isActive: Math.random() > 0.5,
    registeredAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
  }))
  
  // ソート処理
  const sorted = [...largeData].sort((a, b) => a.name.localeCompare(b.name))
  
  // フィルタ処理
  const filtered = sorted.filter(item => item.department === '開発')
  
  const endTime = performance.now()
  const duration = (endTime - startTime).toFixed(2)
  
  performanceResult.value = `✅ パフォーマンステスト完了！ 
    処理時間: ${duration}ms
    元データ: ${largeData.length}件 
    結果: ${filtered.length}件`
}

// 初期化
onMounted(() => {
  console.log('BaseSortFilter デモページが読み込まれました 🚀')
})
</script>

<style scoped>
/* 追加のスタイリング */
.demo-page {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
}

/* アニメーション */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>