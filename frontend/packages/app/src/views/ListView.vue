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
        required: true
      },
      {
        key: 'name',
        label: '氏名',
        type: 'text',
        priority: 'high',
        required: true,
        sortable: true
      },
      {
        key: 'email',
        label: 'メール',
        type: 'email',
        priority: 'medium',
        sortable: true
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
        sortable: true
      },
      {
        key: 'role',
        label: '役職',
        type: 'text',
        priority: 'medium',
        sortable: true,
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
        priority: 'low'
      },
      {
        key: 'extension',
        label: '内線',
        type: 'text',
        priority: 'low'
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
        sortable: true
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
        formatter: (value: number) => `${value}回`
      },
      {
        key: 'score',
        label: '評価スコア',
        type: 'number',
        priority: 'low',
        sortable: true,
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

const handleExport = (format: string) => {
  console.log(`Exporting data as ${format}`)
  // 実際のエクスポート処理をここに実装
}

const refreshData = async () => {
  loading.value = true
  try {
    // API呼び出しのシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000))
    tableData.value = generateMockData()
  } finally {
    loading.value = false
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
</style>
