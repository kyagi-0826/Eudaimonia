<!--
  @fileoverview ListView Component
  @description BaseTableシステムを活用した一覧表示デモページ
  🌟 企業級テーブルシステムの実用例
-->

<template>
  <div class="list-view">
    <!-- ページヘッダー -->
    <div class="page-header">
      <h1 class="page-title">📋 ユーザー一覧</h1>
      <p class="page-subtitle">
        BaseTableシステムのデモ - 多項目セル、レスポンシブ表示、高度な操作機能
      </p>
    </div>

    <!-- 操作パネル -->
    <div class="action-panel">
      <div class="panel-left">
        <button 
          class="btn btn-primary"
          @click="refreshData"
          :disabled="loading"
        >
          <span class="btn-icon">🔄</span>
          {{ loading ? '更新中...' : 'データ更新' }}
        </button>
        
        <button 
          class="btn btn-secondary"
          @click="addNewUser"
        >
          <span class="btn-icon">➕</span>
          新規追加
        </button>
      </div>

      <div class="panel-right">
        <div class="data-info">
          <span class="total-count">
            総件数: {{ totalCount }}件
            <span v-if="selectedItems.length > 0" class="selected-count">
              ({{ selectedItems.length }}件選択中)
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- アクティブソート・フィルター表示 -->
    <div v-if="activeSorts.length > 0 || activeFilters.size > 0" class="active-controls">
      <!-- マルチソート状態 -->
      <div v-if="activeSorts.length > 0" class="active-sort">
        <div class="control-header">
          <span class="control-title">📊 ソート中 ({{ activeSorts.length }}件)</span>
          <button class="btn-link" @click="clearSort">すべて解除</button>
        </div>
        <div class="sort-info">
          <div v-for="(sort, index) in activeSorts" :key="`${sort.key}-${sort.priority}`" class="sort-tag">
            <span class="sort-priority">#{{ sort.priority }}</span>
            <span class="sort-label">{{ getSortItemLabelByKey(sort.key) }}</span>
            <span class="sort-direction">
              {{ sort.direction === 'asc' ? '🔼 昇順' : '🔽 降順' }}
            </span>
            <button class="btn-remove" @click="removeSortByKey(sort.key)">
              <span class="remove-icon">×</span>
            </button>
          </div>
        </div>
      </div>

      <!-- フィルター状態 -->
      <div v-if="activeFilters.size > 0" class="active-filters">
        <div class="control-header">
          <span class="control-title">🔍 アクティブなフィルター ({{ activeFilters.size }}件)</span>
          <button class="btn-link" @click="clearAllFilters">すべて解除</button>
        </div>
        <div class="filter-tags">
          <div 
            v-for="[key, filter] in activeFilters" 
            :key="key" 
            class="filter-tag"
          >
            <span class="filter-label">{{ filter.item.label }}</span>
            <span class="filter-value">{{ formatFilterValue(filter) }}</span>
            <button class="filter-remove" @click="removeFilter(key)">×</button>
          </div>
        </div>
      </div>
    </div>

    <!-- テーブルコンテナ -->
        <!-- テーブル表示エリア -->
    <div class="table-container">
      <BaseTableResponsive
        :data="tableData"
        :columns="tableColumns"
        title="ユーザー一覧"
        :selectable="true"
        :loading="loading"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @filter-dialog-open="handleFilterDialogOpen"
        @row-click="handleRowClick"
        class="user-table"
      />
    </div>

    <!-- 選択時のアクションバー -->
    <div v-if="selectedItems.length > 0" class="selection-actions">
      <div class="selection-info">
        {{ selectedItems.length }}件のアイテムが選択されています
      </div>
      <div class="action-buttons">
        <button class="btn btn-outline" @click="clearSelection">
          選択解除
        </button>
        <button class="btn btn-warning" @click="bulkDeactivate">
          一括無効化
        </button>
        <button class="btn btn-danger" @click="bulkDelete">
          一括削除
        </button>
      </div>
    </div>

    <!-- ローディングオーバーレイ -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>データを読み込み中...</p>
      </div>
    </div>

    <!-- モーダル（新規追加・編集用） -->
    <div v-if="showUserModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingUser.id ? 'ユーザー編集' : '新規ユーザー' }}</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label>氏名 *</label>
              <input 
                v-model="editingUser.name" 
                type="text" 
                required 
                placeholder="田中 太郎"
              />
            </div>
            <div class="form-group">
              <label>メール *</label>
              <input 
                v-model="editingUser.email" 
                type="email" 
                required 
                placeholder="tanaka@example.com"
              />
            </div>
            <div class="form-group">
              <label>部署</label>
              <select v-model="editingUser.department">
                <option value="">選択してください</option>
                <option value="開発部">開発部</option>
                <option value="営業部">営業部</option>
                <option value="マーケティング部">マーケティング部</option>
                <option value="人事部">人事部</option>
                <option value="経理部">経理部</option>
              </select>
            </div>
            <div class="form-group">
              <label>ロール</label>
              <select v-model="editingUser.role">
                <option value="member">メンバー</option>
                <option value="leader">リーダー</option>
                <option value="manager">マネージャー</option>
                <option value="admin">管理者</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" @click="closeModal">
                キャンセル
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingUser.id ? '更新' : '作成' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- フィルターダイアログ -->
    <div v-if="showFilterDialog" class="modal-overlay" @click="closeFilterDialog">
      <div class="modal-content filter-dialog" @click.stop>
        <div class="modal-header">
          <h3>🔍 {{ filterItem?.label }} フィルター</h3>
          <button class="modal-close" @click="closeFilterDialog">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="applyFilter">
            <!-- テキスト入力 (text/email/phone) -->
            <div v-if="['text', 'email', 'phone'].includes(filterItem?.type)" class="form-group">
              <label>検索文字列</label>
              <input 
                v-model="filterForm.text" 
                type="text" 
                :placeholder="`${filterItem?.label}を入力...`"
                class="form-control"
              />
              <p class="form-help">部分一致で検索されます</p>
            </div>

            <!-- 日付範囲 (date) -->
            <div v-if="filterItem?.type === 'date'" class="form-group">
              <label>期間指定</label>
              <div class="date-range">
                <div class="date-input">
                  <label>開始日</label>
                  <input v-model="filterForm.dateFrom" type="date" class="form-control" />
                </div>
                <div class="date-input">
                  <label>終了日</label>
                  <input v-model="filterForm.dateTo" type="date" class="form-control" />
                </div>
              </div>
            </div>

            <!-- セレクト選択 (select) -->
            <div v-if="filterItem?.type === 'select'" class="form-group">
              <label>選択肢</label>
              <select v-model="filterForm.text" class="form-control">
                <option value="">すべて</option>
                <option v-for="option in filterForm.options" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeFilterDialog">
                キャンセル
              </button>
              <button type="submit" class="btn btn-primary">
                フィルター適用
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
// import { BaseTableResponsive } from 'components'
// import type { TableColumn, TableItem, TableConfig } from 'components'

// BaseTable システム import の修正
import BaseTableResponsive from '@components/BaseTable/components/BaseTableResponsive.vue'
import type { TableColumn, TableItem, TableConfig } from '@components/BaseTable/types'

// =============================================================================
// 📊 Reactive State
// =============================================================================

const loading = ref(false)

const selectedItems = ref<TableItem[]>([])
const showUserModal = ref(false)

// 編集中のユーザー
const editingUser = reactive({
  id: null as number | null,
  name: '',
  email: '',
  department: '',
  role: 'member'
})

// テーブルデータ
const tableData = ref<TableItem[]>([])
const originalData = ref<TableItem[]>([]) // 元データ保持用

// 初期データ設定
const initializeData = () => {
  const sampleData = generateMockData() // サンプルデータを生成
  originalData.value = sampleData
  tableData.value = [...sampleData]
}

// フィルター関連
const showFilterDialog = ref(false)
const filterColumn = ref<any>(null)
const filterItem = ref<any>(null)
const activeFilters = ref<Map<string, any>>(new Map())
const filteredData = ref<TableItem[]>([])

// フィルターフォーム
const filterForm = reactive({
  text: '',
  dateFrom: '',
  dateTo: '',
  options: [] as string[]
})

// =============================================================================
// 📋 Table Configuration
// =============================================================================

const tableColumns: TableColumn[] = [
  {
    id: 'user-info',
    label: 'ユーザー情報',
    visible: true,
    resizable: true,
    width: { type: 'minmax', min: 250, max: 350 },
    items: [
      {
        key: 'avatar',
        label: 'アバター',
        type: 'image',
        priority: 'high',
        required: true,
        sortable: false,
        filterable: false
      },
      {
        key: 'name',
        label: '氏名',
        type: 'text',
        priority: 'high',
        required: true,
        sortable: true,
        filterable: true
      },
      {
        key: 'email',
        label: 'メール',
        type: 'email',
        priority: 'medium',
        sortable: true,
        filterable: true
      }
    ]
  },
  {
    id: 'organization',
    label: '組織・役職',
    visible: true,
    resizable: true,
    width: { type: 'minmax', min: 200, max: 300 },
    items: [
      {
        key: 'department',
        label: '部署',
        type: 'text',
        priority: 'high',
        sortable: true,
        filterable: true
      },
      {
        key: 'role',
        label: '役職',
        type: 'text',
        priority: 'medium',
        sortable: true,
        filterable: true,
        formatter: (value: string) => {
          const roleMap: Record<string, string> = {
            admin: '管理者',
            manager: 'マネージャー',
            leader: 'リーダー',
            member: 'メンバー'
          }
          return roleMap[value] || value
        }
      }
    ]
  },
  {
    id: 'contact',
    label: '連絡先',
    visible: true,
    resizable: true,
    width: { type: 'minmax', min: 180, max: 250 },
    hideOn: ['xs', 'sm'],
    items: [
      {
        key: 'phone',
        label: '電話',
        type: 'phone',
        priority: 'low',
        sortable: true,
        filterable: true
      },
      {
        key: 'extension',
        label: '内線',
        type: 'text',
        priority: 'low',
        sortable: true,
        filterable: true
      }
    ]
  },
  {
    id: 'activity',
    label: '活動状況',
    visible: true,
    resizable: true,
    width: { type: 'minmax', min: 160, max: 220 },
    hideOn: ['xs'],
    items: [
      {
        key: 'status',
        label: 'ステータス',
        type: 'text',
        priority: 'medium',
        sortable: true,
        filterable: true,
        formatter: (value: string) => {
          const statusMap: Record<string, string> = {
            active: 'アクティブ',
            inactive: '非アクティブ',
            pending: '保留中',
            blocked: 'ブロック済み'
          }
          return statusMap[value] || value
        }
      },
      {
        key: 'lastLogin',
        label: '最終ログイン',
        type: 'date',
        priority: 'low',
        sortable: true,
        filterable: true
      }
    ]
  },
  {
    id: 'metrics',
    label: 'メトリクス',
    visible: true,
    resizable: true,
    width: { type: 'fixed', value: 160 },
    hideOn: ['xs', 'sm'],
    items: [
      {
        key: 'loginCount',
        label: 'ログイン回数',
        type: 'number',
        priority: 'low',
        sortable: true,
        filterable: true,
        formatter: (value: number) => `${value}回`
      },
      {
        key: 'score',
        label: '評価スコア',
        type: 'number',
        priority: 'low',
        sortable: true,
        filterable: true,
        formatter: (value: number) => `${value}/100`
      }
    ]
  }
]

// =============================================================================
// 💾 Mock Data Generation
// =============================================================================

const generateMockData = (): TableItem[] => {
  const departments = ['開発部', '営業部', 'マーケティング部', '人事部', '経理部', 'デザイン部']
  const roles = ['admin', 'manager', 'leader', 'member']
  const statuses = ['active', 'inactive', 'pending', 'blocked']
  
  const firstNames = ['太郎', '花子', '次郎', '美咲', '健太', '由美', '大輔', '愛子', '翔', '香織']
  const lastNames = ['田中', '佐藤', '鈴木', '高橋', '伊藤', '渡辺', '山本', '中村', '小林', '加藤']

  return Array.from({ length: 50 }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${lastName} ${firstName}`
    const email = `${lastName.toLowerCase()}.${firstName.toLowerCase()}@company.com`
    const department = departments[Math.floor(Math.random() * departments.length)]
    const role = roles[Math.floor(Math.random() * roles.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    // 最終ログイン日時（過去30日以内のランダム）
    const lastLoginDate = new Date()
    lastLoginDate.setDate(lastLoginDate.getDate() - Math.floor(Math.random() * 30))
    
    return {
      id: i + 1,
      avatar: `https://i.pravatar.cc/64?img=${i + 1}`,
      name,
      email,
      department,
      role,
      phone: `090-${String(Math.floor(Math.random() * 9000) + 1000).slice(0, 4)}-${String(Math.floor(Math.random() * 9000) + 1000).slice(0, 4)}`,
      extension: String(Math.floor(Math.random() * 9000) + 1000),
      status,
      lastLogin: lastLoginDate.toISOString(),
      loginCount: Math.floor(Math.random() * 500) + 10,
      score: Math.floor(Math.random() * 40) + 60, // 60-100のスコア
      createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
      updatedAt: new Date().toISOString()
    }
  })
}

// =============================================================================
// 🧮 Computed Properties
// =============================================================================

const totalCount = computed(() => tableData.value.length)

// =============================================================================
// 🎯 Event Handlers
// =============================================================================

const handleSelectionChange = (selectedData: TableItem[]) => {
  selectedItems.value = selectedData
}

const handleRowClick = (item: TableItem) => {
  console.log('Row clicked:', item)
  editingUser.id = item.id as number
  editingUser.name = item.name as string
  editingUser.email = item.email as string
  editingUser.department = item.department as string
  editingUser.role = item.role as string
  showUserModal.value = true
}

// ソート関連
const activeSorts = ref<Array<{
  key: string
  direction: 'asc' | 'desc'
  label: string
  priority: number
}>>([])

// 後方互換性のため（テンプレートで使用中）
const currentSortItem = computed(() => activeSorts.value.length > 0 ? activeSorts.value[0].key : null)
const currentSortDirection = computed(() => activeSorts.value.length > 0 ? activeSorts.value[0].direction : null)

const handleSortChange = (column: any, direction: 'asc' | 'desc' | null, item?: any) => {
  console.log('Sort changed:', column, direction, item)
  
  if (!direction || !item) {
    // ソート解除 - 該当項目のソートを削除
    if (item) {
      removeSortByKey(item.key)
    } else {
      // 全ソート解除
      clearAllSorts()
    }
    return
  }
  
  // マルチソート実行
  addOrUpdateSort(item, direction)
  console.log(`${item.label}を${direction === 'asc' ? '昇順' : '降順'}でソートに追加`)
}

const addOrUpdateSort = (item: any, direction: 'asc' | 'desc') => {
  // 既存のソートがあるかチェック
  const existingIndex = activeSorts.value.findIndex(sort => sort.key === item.key)
  
  if (existingIndex >= 0) {
    // 既存ソートの方向を更新
    activeSorts.value[existingIndex].direction = direction
  } else {
    // 新しいソートを追加（優先順位は現在のソート数 + 1）
    activeSorts.value.push({
      key: item.key,
      direction: direction,
      label: item.label,
      priority: activeSorts.value.length + 1
    })
  }
  
  // マルチソート実行
  executeMultiSort()
}

const removeSortByKey = (key: string) => {
  activeSorts.value = activeSorts.value.filter(sort => sort.key !== key)
  
  // 優先順位を再調整
  activeSorts.value.forEach((sort, index) => {
    sort.priority = index + 1
  })
  
  if (activeSorts.value.length > 0) {
    executeMultiSort()
  } else {
    // 全てのソートが解除された場合は元データに戻す
    applyFiltersOnly()
  }
}

const clearAllSorts = () => {
  activeSorts.value = []
  applyFiltersOnly()
}

const executeMultiSort = () => {
  let baseData = [...originalData.value]
  
  // アクティブなフィルターがある場合は先にフィルターを適用
  if (activeFilters.value.size > 0) {
    activeFilters.value.forEach((filter) => {
      baseData = baseData.filter(row => {
        const value = getNestedValue(row, filter.item.key)
        return matchesFilter(value, filter)
      })
    })
  }
  
  // マルチソート処理（優先順位順）
  const sortedData = baseData.sort((a, b) => {
    for (const sort of activeSorts.value) {
      let valueA = getNestedValue(a, sort.key)
      let valueB = getNestedValue(b, sort.key)
      
      // 数値の場合
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        const result = sort.direction === 'asc' ? valueA - valueB : valueB - valueA
        if (result !== 0) return result
        continue
      }
      
      // 文字列の場合
      valueA = String(valueA || '').toLowerCase()
      valueB = String(valueB || '').toLowerCase()
      
      const result = sort.direction === 'asc' 
        ? valueA.localeCompare(valueB, 'ja')
        : valueB.localeCompare(valueA, 'ja')
        
      if (result !== 0) return result
    }
    return 0
  })
  
  tableData.value = sortedData
}

const applyFiltersOnly = () => {
  let filtered = [...originalData.value]
  
  activeFilters.value.forEach((filter) => {
    filtered = filtered.filter(row => {
      const value = getNestedValue(row, filter.item.key)
      return matchesFilter(value, filter)
    })
  })
  
  tableData.value = filtered
}

const sortTableData = (item: any, direction: 'asc' | 'desc') => {
  // 元データまたは現在フィルター済みのデータベースを使用
  let baseData = [...originalData.value]
  
  // アクティブなフィルターがある場合は先にフィルターを適用
  if (activeFilters.value.size > 0) {
    activeFilters.value.forEach((filter) => {
      baseData = baseData.filter(row => {
        const value = getNestedValue(row, filter.item.key)
        return matchesFilter(value, filter)
      })
    })
  }
  
  // ソート処理
  const sortedData = baseData.sort((a, b) => {
    let valueA = getNestedValue(a, item.key)
    let valueB = getNestedValue(b, item.key)
    
    // 数値の場合
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return direction === 'asc' ? valueA - valueB : valueB - valueA
    }
    
    // 文字列の場合
    valueA = String(valueA || '').toLowerCase()
    valueB = String(valueB || '').toLowerCase()
    
    if (direction === 'asc') {
      return valueA.localeCompare(valueB, 'ja')
    } else {
      return valueB.localeCompare(valueA, 'ja')
    }
  })
  
  tableData.value = sortedData
}

// ネストしたオブジェクトの値を取得
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// フィルター機能
const handleFilterDialogOpen = (column: any, item: any) => {
  filterColumn.value = column
  filterItem.value = item
  
  // フォームをリセット
  filterForm.text = ''
  filterForm.dateFrom = ''
  filterForm.dateTo = ''
  filterForm.options = []
  
  // データ型に応じたフォーム初期化
  if (item.type === 'select') {
    // セレクト項目の選択肢を設定
    filterForm.options = getSelectOptions(item)
  }
  
  showFilterDialog.value = true
  console.log(`フィルターダイアログを開きます: ${item.label} (${item.type})`)
}

const getSelectOptions = (item: any) => {
  // 実際のデータから選択肢を抽出
  const values = new Set<string>()
  originalData.value.forEach(row => {
    const value = getNestedValue(row, item.key)
    if (value) values.add(String(value))
  })
  return Array.from(values).sort()
}

const applyFilter = () => {
  if (!filterItem.value) return
  
  const filterKey = `${filterColumn.value.id}.${filterItem.value.key}`
  const filterConfig = {
    column: filterColumn.value,
    item: filterItem.value,
    value: getFilterValue(),
    type: filterItem.value.type
  }
  
  activeFilters.value.set(filterKey, filterConfig)
  executeFilters()
  showFilterDialog.value = false
}

const getFilterValue = () => {
  switch (filterItem.value.type) {
    case 'text':
    case 'email':
    case 'phone':
      return filterForm.text
    case 'date':
      return {
        from: filterForm.dateFrom,
        to: filterForm.dateTo
      }
    case 'select':
      return filterForm.text
    default:
      return filterForm.text
  }
}

const executeFilters = () => {
  let filtered = [...originalData.value]
  
  activeFilters.value.forEach((filter) => {
    filtered = filtered.filter(row => {
      const value = getNestedValue(row, filter.item.key)
      return matchesFilter(value, filter)
    })
  })
  
  // フィルター後にソートも適用
  if (currentSortItem.value && currentSortDirection.value) {
    filtered = filtered.sort((a, b) => {
      let valueA = getNestedValue(a, currentSortItem.value!)
      let valueB = getNestedValue(b, currentSortItem.value!)
      
      // 数値の場合
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return currentSortDirection.value === 'asc' ? valueA - valueB : valueB - valueA
      }
      
      // 文字列の場合
      valueA = String(valueA || '').toLowerCase()
      valueB = String(valueB || '').toLowerCase()
      
      if (currentSortDirection.value === 'asc') {
        return valueA.localeCompare(valueB, 'ja')
      } else {
        return valueB.localeCompare(valueA, 'ja')
      }
    })
  }
  
  tableData.value = filtered
}

const matchesFilter = (value: any, filter: any): boolean => {
  if (!value || !filter.value) return false
  
  const strValue = String(value).toLowerCase()
  
  switch (filter.type) {
    case 'text':
    case 'email':
    case 'phone':
      return strValue.includes(String(filter.value).toLowerCase())
    case 'select':
      return strValue === String(filter.value).toLowerCase()
    case 'date':
      // 日付範囲フィルター
      const dateValue = new Date(value)
      const from = filter.value.from ? new Date(filter.value.from) : null
      const to = filter.value.to ? new Date(filter.value.to) : null
      
      if (from && dateValue < from) return false
      if (to && dateValue > to) return false
      return true
    default:
      return true
  }
}

const removeFilter = (filterKey: string) => {
  activeFilters.value.delete(filterKey)
  executeFilters()
}

const clearAllFilters = () => {
  activeFilters.value.clear()
  
  // ソート状態もリセット
  activeSorts.value = []
  
  // 元データに戻す
  tableData.value = [...originalData.value]
}

const closeFilterDialog = () => {
  showFilterDialog.value = false
}

const formatFilterValue = (filter: any): string => {
  switch (filter.type) {
    case 'date':
      if (filter.value.from && filter.value.to) {
        return `${filter.value.from} - ${filter.value.to}`
      } else if (filter.value.from) {
        return `${filter.value.from} 以降`
      } else if (filter.value.to) {
        return `${filter.value.to} 以前`
      }
      return '範囲指定'
    default:
      return String(filter.value)
  }
}

// ソート関連のヘルパー関数
const getSortItemLabel = (): string => {
  if (!currentSortItem.value) return ''
  
  // currentSortItemからラベルを取得
  for (const column of tableColumns) {
    for (const item of column.items || []) {
      if (item.key === currentSortItem.value) {
        return item.label
      }
    }
  }
  
  return currentSortItem.value
}

const getSortItemLabelByKey = (key: string): string => {
  // キーからラベルを取得
  for (const column of tableColumns) {
    for (const item of column.items || []) {
      if (item.key === key) {
        return item.label
      }
    }
  }
  
  return key
}

const clearSort = () => {
  activeSorts.value = []
  applyFiltersOnly()
}

const handleExport = (format: string) => {
  console.log(`Exporting data as ${format}`)
  // 実際のエクスポート処理をここに実装
}

const refreshData = () => {
  if (activeSorts.value.length === 0) {
    applyFiltersOnly()
  } else {
    executeMultiSort()
  }
}

const addNewUser = () => {
  editingUser.id = null
  editingUser.name = ''
  editingUser.email = ''
  editingUser.department = ''
  editingUser.role = 'member'
  showUserModal.value = true
}

const saveUser = async () => {
  try {
    if (editingUser.id) {
      // 既存ユーザー更新
      const index = tableData.value.findIndex((item: TableItem) => item.id === editingUser.id)
      if (index !== -1) {
        tableData.value[index] = {
          ...tableData.value[index],
          name: editingUser.name,
          email: editingUser.email,
          department: editingUser.department,
          role: editingUser.role,
          updatedAt: new Date().toISOString()
        }
      }
    } else {
      // 新規ユーザー追加
      const newUser = {
        id: Math.max(...tableData.value.map((item: any) => item.id as number)) + 1,
        avatar: `https://i.pravatar.cc/64?img=${Math.floor(Math.random() * 70) + 1}`,
        name: editingUser.name,
        email: editingUser.email,
        department: editingUser.department,
        role: editingUser.role,
        phone: '',
        extension: '',
        status: 'pending',
        lastLogin: new Date().toISOString(),
        loginCount: 0,
        score: 70,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      tableData.value.unshift(newUser)
    }
    closeModal()
  } catch (error) {
    console.error('保存エラー:', error)
  }
}

const closeModal = () => {
  showUserModal.value = false
}

const clearSelection = () => {
  selectedItems.value = []
}

const bulkDeactivate = () => {
  const ids = selectedItems.value.map((item: any) => item.id)
  tableData.value.forEach((item: any) => {
    if (ids.includes(item.id)) {
      item.status = 'inactive'
    }
  })
  clearSelection()
}

const bulkDelete = () => {
  if (confirm(`${selectedItems.value.length}件のアイテムを削除しますか？`)) {
    const ids = selectedItems.value.map((item: TableItem) => item.id)
    tableData.value = tableData.value.filter((item: TableItem) => !ids.includes(item.id))
    clearSelection()
  }
}

// =============================================================================
// 🔄 Lifecycle
// =============================================================================

onMounted(() => {
  initializeData()
  refreshData()
})
</script>

<style scoped>
/* =============================================================================
   📱 ListView Styles
   ============================================================================= */

.list-view {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Action Panel */
.action-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.panel-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.panel-right {
  display: flex;
  align-items: center;
}

.data-info {
  text-align: right;
}

.total-count {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.selected-count {
  color: #3b82f6;
  font-weight: 600;
}

/* Table Container */
.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.demo-table {
  border-radius: 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-icon {
  font-size: 1rem;
}

/* Selection Actions */
.selection-actions {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.selection-info {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  background: white;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

/* Responsive */
@media (max-width: 768px) {
  .list-view {
    padding: 16px;
  }

  .page-title {
    font-size: 2rem;
  }

  .action-panel {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .panel-left {
    justify-content: center;
  }

  .panel-right {
    justify-content: center;
  }

  .selection-actions {
    flex-direction: column;
    gap: 12px;
    bottom: 16px;
    left: 16px;
    right: 16px;
    transform: none;
  }

  .action-buttons {
    justify-content: center;
  }

  .modal-content {
    width: 95%;
    margin: 16px;
  }
}

/* ソート・フィルター統合スタイル */
.active-controls {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.active-sort {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
}

.active-filters {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.control-title {
  font-weight: 600;
  color: #374151;
}

.sort-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sort-tag {
  display: flex;
  align-items: center;
  background: #dbeafe;
  border: 1px solid #93c5fd;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.875rem;
  gap: 8px;
  position: relative;
}

.sort-priority {
  background: #1e3a8a;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sort-label {
  font-weight: 500;
  color: #1e3a8a;
}

.sort-direction {
  color: #1d4ed8;
  font-weight: 600;
}

.btn-remove {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  flex-shrink: 0;
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.1);
}

.remove-icon {
  color: #6b7280;
  font-size: 14px;
  font-weight: bold;
}

.btn-remove:hover .remove-icon {
  color: #ef4444;
}

/* 既存のフィルタースタイルの調整 */
.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-title {
  font-weight: 600;
  color: #374151;
}

@media (max-width: 640px) {
  .active-controls {
    margin-bottom: 12px;
    gap: 8px;
  }
  
  .active-sort,
  .active-filters {
    padding: 12px;
  }
  
  .sort-info,
  .filter-tags {
    flex-direction: column;
  }
}

/* フィルター関連スタイル */
.filter-dialog {
  max-width: 500px;
}

.date-range {
  display: flex;
  gap: 16px;
}

.date-input {
  flex: 1;
}

.date-input label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.form-help {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #6b7280;
}

.active-filters {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.filter-title {
  font-weight: 600;
  color: #374151;
}

.btn-link {
  background: none;
  border: none;
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-link:hover {
  color: #1d4ed8;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: flex;
  align-items: center;
  background: #e0e7ff;
  border: 1px solid #c7d2fe;
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 0.875rem;
  gap: 8px;
}

.filter-label {
  font-weight: 500;
  color: #3730a3;
}

.filter-value {
  color: #1e1b4b;
}

.filter-remove {
  background: none;
  border: none;
  color: #6366f1;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.filter-remove:hover {
  background: #c7d2fe;
}

@media (max-width: 640px) {
  .filter-dialog {
    max-width: 95%;
  }
  
  .date-range {
    flex-direction: column;
  }
  
  .filter-tags {
    flex-direction: column;
  }
}
</style>
