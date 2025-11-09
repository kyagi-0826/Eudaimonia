<!--
  @fileoverview TablePresets Component
  @description プリセット管理コンポーネント（保存・読み込み・共有・管理）
-->

<template>
  <div class="table-presets" :class="presetsClasses">
    <!-- Header -->
    <div class="presets-header">
      <h3 class="presets-title">プリセット管理</h3>
      <div class="header-actions">
        <button
          type="button"
          class="action-btn action-btn--save"
          @click="showSaveDialog"
          :disabled="!hasCurrentConfig"
          title="現在の設定をプリセットとして保存"
        >
          💾 保存
        </button>
        <button
          type="button"
          class="action-btn action-btn--import"
          @click="showImportDialog"
          title="プリセットをインポート"
        >
          📥 インポート
        </button>
        <button
          type="button"
          class="action-btn action-btn--close"
          @click="$emit('close')"
          title="閉じる"
        >
          ×
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="presets-controls">
      <div class="search-section">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="プリセットを検索..."
          :aria-label="'プリセット検索'"
        />
        <select v-model="filterCategory" class="category-filter">
          <option value="all">すべてのカテゴリ</option>
          <option value="system">システム</option>
          <option value="user">ユーザー</option>
          <option value="team">チーム</option>
        </select>
      </div>
      <div class="sort-section">
        <label class="sort-label">並び順:</label>
        <select v-model="sortBy" class="sort-select">
          <option value="name">名前</option>
          <option value="created">作成日</option>
          <option value="modified">更新日</option>
          <option value="usage">使用回数</option>
        </select>
        <button
          type="button"
          class="sort-order-btn"
          @click="toggleSortOrder"
          :title="sortOrder === 'asc' ? '昇順' : '降順'"
        >
          {{ sortOrder === 'asc' ? '⬆️' : '⬇️' }}
        </button>
      </div>
    </div>

    <!-- Preset List -->
    <div class="presets-list" ref="presetsListRef">
      <div
        v-for="preset in filteredPresets"
        :key="preset.id"
        :class="getPresetItemClasses(preset)"
        @click="selectPreset(preset)"
      >
        <!-- Preset Info -->
        <div class="preset-info">
          <div class="preset-header">
            <div class="preset-title-section">
              <h4 class="preset-name">{{ preset.name }}</h4>
              <div class="preset-badges">
                <span :class="getCategoryBadgeClasses(preset.category)">
                  {{ getCategoryLabel(preset.category) }}
                </span>
                <span v-if="preset.isDefault" class="badge badge--default">デフォルト</span>
                <span v-if="preset.shared" class="badge badge--shared">共有</span>
              </div>
            </div>
            <div class="preset-actions">
              <button
                type="button"
                class="preset-action-btn"
                @click.stop="applyPreset(preset)"
                title="このプリセットを適用"
              >
                ✅
              </button>
              <button
                type="button"
                class="preset-action-btn"
                @click.stop="duplicatePreset(preset)"
                title="複製"
              >
                📋
              </button>
              <button
                v-if="preset.category !== 'system'"
                type="button"
                class="preset-action-btn"
                @click.stop="editPreset(preset)"
                title="編集"
              >
                ✏️
              </button>
              <button
                type="button"
                class="preset-action-btn"
                @click.stop="sharePreset(preset)"
                title="共有"
              >
                🔗
              </button>
              <button
                v-if="preset.category !== 'system'"
                type="button"
                class="preset-action-btn preset-action-btn--danger"
                @click.stop="deletePreset(preset)"
                title="削除"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div v-if="preset.description" class="preset-description">
            {{ preset.description }}
          </div>
          
          <!-- Preset Stats -->
          <div class="preset-stats">
            <div class="stat-item">
              <span class="stat-label">作成:</span>
              <span class="stat-value">{{ formatDate(preset.createdAt) }}</span>
            </div>
            <div v-if="preset.modifiedAt" class="stat-item">
              <span class="stat-label">更新:</span>
              <span class="stat-value">{{ formatDate(preset.modifiedAt) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">使用回数:</span>
              <span class="stat-value">{{ preset.usageCount || 0 }}回</span>
            </div>
          </div>

          <!-- Preset Preview -->
          <div v-if="selectedPreset?.id === preset.id" class="preset-preview">
            <h5 class="preview-title">設定プレビュー</h5>
            <div class="preview-content">
              <div class="preview-section">
                <span class="preview-label">表示設定:</span>
                <span class="preview-value">
                  {{ preset.config.settings ? getDisplaySummary(preset.config.settings) : '設定なし' }}
                </span>
              </div>
              <div class="preview-section">
                <span class="preview-label">カラム数:</span>
                <span class="preview-value">{{ preset.config.columns?.length || 0 }}個</span>
              </div>
              <div class="preview-section">
                <span class="preview-label">フィルタ:</span>
                <span class="preview-value">
                  {{ preset.config.filters ? Object.keys(preset.config.filters).length : 0 }}個
                </span>
              </div>
              <div class="preview-section">
                <span class="preview-label">ソート:</span>
                <span class="preview-value">
                  {{ preset.config.sortConfig ? '設定あり' : '設定なし' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredPresets.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <div class="empty-message">
          {{ searchQuery ? '検索結果がありません' : 'プリセットがありません' }}
        </div>
        <button
          v-if="!searchQuery"
          type="button"
          class="empty-action-btn"
          @click="showSaveDialog"
        >
          最初のプリセットを作成
        </button>
      </div>
    </div>

    <!-- Save Dialog -->
    <div v-if="showSaveModal" class="modal-backdrop" @click="closeSaveDialog">
      <div class="save-modal" @click.stop>
        <h4 class="modal-title">プリセットを保存</h4>
        <div class="modal-content">
          <div class="form-group">
            <label for="preset-name" class="form-label">プリセット名</label>
            <input
              id="preset-name"
              v-model="newPresetName"
              type="text"
              class="form-input"
              placeholder="例: 営業レポート用設定"
              maxlength="50"
            />
          </div>
          <div class="form-group">
            <label for="preset-description" class="form-label">説明（任意）</label>
            <textarea
              id="preset-description"
              v-model="newPresetDescription"
              class="form-textarea"
              placeholder="このプリセットの用途や特徴を説明..."
              rows="3"
              maxlength="200"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="preset-category" class="form-label">カテゴリ</label>
            <select id="preset-category" v-model="newPresetCategory" class="form-select">
              <option value="user">ユーザー</option>
              <option value="team">チーム</option>
            </select>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="newPresetIsDefault"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">デフォルトプリセットにする</span>
            </label>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="modal-btn modal-btn--cancel" @click="closeSaveDialog">
            キャンセル
          </button>
          <button
            type="button"
            class="modal-btn modal-btn--save"
            @click="savePreset"
            :disabled="!newPresetName.trim()"
          >
            保存
          </button>
        </div>
      </div>
    </div>

    <!-- Import Dialog -->
    <div v-if="showImportModal" class="modal-backdrop" @click="closeImportDialog">
      <div class="import-modal" @click.stop>
        <h4 class="modal-title">プリセットをインポート</h4>
        <div class="modal-content">
          <div class="import-methods">
            <div class="import-method">
              <h5 class="method-title">ファイルから読み込み</h5>
              <input
                ref="fileInputRef"
                type="file"
                accept=".json"
                @change="handleFileImport"
                class="file-input"
              />
              <button type="button" class="file-btn" @click="triggerFileSelect">
                📁 ファイルを選択
              </button>
            </div>
            <div class="import-divider">または</div>
            <div class="import-method">
              <h5 class="method-title">JSONデータを貼り付け</h5>
              <textarea
                v-model="importJsonText"
                class="import-textarea"
                placeholder="プリセットのJSONデータを貼り付けてください..."
                rows="6"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="modal-btn modal-btn--cancel" @click="closeImportDialog">
            キャンセル
          </button>
          <button
            type="button"
            class="modal-btn modal-btn--import"
            @click="importPreset"
            :disabled="!importJsonText.trim()"
          >
            インポート
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { TableConfig, TableSettings, TablePreset } from '../types'

export interface Props {
  presets: TablePreset[]
  currentConfig?: TableConfig
  currentSettings?: TableSettings
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'apply-preset': [preset: TablePreset]
  'save-preset': [preset: Omit<TablePreset, 'id' | 'createdAt' | 'usageCount'>]
  'update-preset': [preset: TablePreset]
  'delete-preset': [presetId: string]
  'share-preset': [preset: TablePreset]
  'close': []
}>()

// =============================================================================
// 📊 Reactive State
// =============================================================================

const searchQuery = ref('')
const filterCategory = ref<'all' | 'system' | 'user' | 'team'>('all')
const sortBy = ref<'name' | 'created' | 'modified' | 'usage'>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')
const selectedPreset = ref<TablePreset | null>(null)

// Save Dialog State
const showSaveModal = ref(false)
const newPresetName = ref('')
const newPresetDescription = ref('')
const newPresetCategory = ref<'user' | 'team'>('user')
const newPresetIsDefault = ref(false)

// Import Dialog State
const showImportModal = ref(false)
const importJsonText = ref('')
const fileInputRef = ref<HTMLInputElement>()
const presetsListRef = ref<HTMLElement>()

// =============================================================================
// 📊 Computed Properties
// =============================================================================

const presetsClasses = computed(() => [
  'table-presets',
  {
    'presets--loading': props.loading
  }
])

const hasCurrentConfig = computed(() => 
  props.currentConfig || props.currentSettings
)

const filteredPresets = computed(() => {
  let filtered = props.presets

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(preset =>
      preset.name.toLowerCase().includes(query) ||
      (preset.description && preset.description.toLowerCase().includes(query))
    )
  }

  // Filter by category
  if (filterCategory.value !== 'all') {
    filtered = filtered.filter(preset => preset.category === filterCategory.value)
  }

  // Sort presets
  filtered.sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy.value) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'created':
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case 'modified':
        aValue = new Date(a.modifiedAt || a.createdAt)
        bValue = new Date(b.modifiedAt || b.createdAt)
        break
      case 'usage':
        aValue = a.usageCount || 0
        bValue = b.usageCount || 0
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortOrder.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

// =============================================================================
// 🎯 Event Handlers & Methods
// =============================================================================

const getPresetItemClasses = (preset: TablePreset) => [
  'preset-item',
  {
    'preset-item--selected': selectedPreset.value?.id === preset.id,
    'preset-item--default': preset.isDefault,
    'preset-item--shared': preset.shared
  }
]

const getCategoryBadgeClasses = (category: string) => [
  'badge',
  `badge--${category}`
]

const getCategoryLabel = (category: string) => {
  const labels = {
    system: 'システム',
    user: 'ユーザー', 
    team: 'チーム'
  }
  return labels[category as keyof typeof labels] || category
}

const selectPreset = (preset: TablePreset) => {
  selectedPreset.value = selectedPreset.value?.id === preset.id ? null : preset
}

const applyPreset = (preset: TablePreset) => {
  emit('apply-preset', preset)
}

const duplicatePreset = (preset: TablePreset) => {
  newPresetName.value = `${preset.name} のコピー`
  newPresetDescription.value = preset.description || ''
  newPresetCategory.value = 'user'
  newPresetIsDefault.value = false
  showSaveModal.value = true
}

const editPreset = (preset: TablePreset) => {
  // Edit functionality would be implemented here
  console.log('Edit preset:', preset)
}

const sharePreset = (preset: TablePreset) => {
  emit('share-preset', preset)
}

const deletePreset = (preset: TablePreset) => {
  if (confirm(`プリセット「${preset.name}」を削除しますか？`)) {
    emit('delete-preset', preset.id)
  }
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getDisplaySummary = (settings: TableSettings) => {
  const parts = [
    `${settings.size}サイズ`,
    settings.zebraStripes ? 'ストライプ' : '',
    settings.stickyHeader ? 'ヘッダー固定' : ''
  ].filter(Boolean)
  
  return parts.join(', ') || '標準設定'
}

// =============================================================================
// 💾 Save Dialog Methods
// =============================================================================

const showSaveDialog = () => {
  newPresetName.value = ''
  newPresetDescription.value = ''
  newPresetCategory.value = 'user'
  newPresetIsDefault.value = false
  showSaveModal.value = true
}

const closeSaveDialog = () => {
  showSaveModal.value = false
}

const savePreset = () => {
  if (!newPresetName.value.trim()) return

  const preset: Omit<TablePreset, 'id' | 'createdAt' | 'usageCount'> = {
    name: newPresetName.value.trim(),
    description: newPresetDescription.value.trim() || undefined,
    category: newPresetCategory.value,
    isDefault: newPresetIsDefault.value,
    shared: false,
    config: {
      ...props.currentConfig,
      settings: props.currentSettings
    },
    modifiedAt: new Date().toISOString()
  }

  emit('save-preset', preset)
  closeSaveDialog()
}

// =============================================================================
// 📥 Import Dialog Methods
// =============================================================================

const showImportDialog = () => {
  importJsonText.value = ''
  showImportModal.value = true
}

const closeImportDialog = () => {
  showImportModal.value = false
}

const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

const handleFileImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    importJsonText.value = e.target?.result as string
  }
  reader.readAsText(file)
}

const importPreset = () => {
  if (!importJsonText.value.trim()) return

  try {
    const presetData = JSON.parse(importJsonText.value)
    
    // Validate preset structure
    if (!presetData.name || !presetData.config) {
      throw new Error('無効なプリセット形式です')
    }

    const preset: Omit<TablePreset, 'id' | 'createdAt' | 'usageCount'> = {
      ...presetData,
      category: 'user',
      shared: false,
      modifiedAt: new Date().toISOString()
    }

    emit('save-preset', preset)
    closeImportDialog()
  } catch (error) {
    alert('プリセットのインポートに失敗しました。JSONデータを確認してください。')
    console.error('Import error:', error)
  }
}

// =============================================================================
// 🔄 Watchers
// =============================================================================

watch(
  () => searchQuery.value,
  async () => {
    await nextTick()
    if (presetsListRef.value) {
      presetsListRef.value.scrollTop = 0
    }
  }
)
</script>

<style scoped>
/* =============================================================================
   🎨 Presets Layout
   ============================================================================= */

.table-presets {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.presets--loading {
  opacity: 0.6;
  pointer-events: none;
}

/* =============================================================================
   📑 Header
   ============================================================================= */

.presets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.presets-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover:not(:disabled) {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn--save {
  border-color: #10b981;
  color: #065f46;
}

.action-btn--save:hover:not(:disabled) {
  background-color: #f0fdf4;
  border-color: #059669;
}

.action-btn--import {
  border-color: #3b82f6;
  color: #1e40af;
}

.action-btn--import:hover:not(:disabled) {
  background-color: #eff6ff;
  border-color: #2563eb;
}

.action-btn--close {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 1.25rem;
  font-weight: bold;
}

/* =============================================================================
   🔍 Controls
   ============================================================================= */

.presets-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;
}

.search-section {
  display: flex;
  gap: 12px;
  flex: 1;
}

.search-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.15s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.category-filter {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  font-size: 0.875rem;
  cursor: pointer;
}

.sort-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.sort-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  font-size: 0.875rem;
  cursor: pointer;
}

.sort-order-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s ease;
}

.sort-order-btn:hover {
  background-color: #f3f4f6;
}

/* =============================================================================
   📋 Presets List
   ============================================================================= */

.presets-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.preset-item {
  margin: 8px 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.preset-item--selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.preset-item--default {
  border-color: #10b981;
  background-color: #f0fdf4;
}

.preset-item--shared {
  border-left: 4px solid #f59e0b;
}

/* Preset Info */
.preset-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preset-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.preset-title-section {
  flex: 1;
}

.preset-name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.4;
}

.preset-badges {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge--system {
  background-color: #e5e7eb;
  color: #374151;
}

.badge--user {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge--team {
  background-color: #fef3c7;
  color: #92400e;
}

.badge--default {
  background-color: #dcfce7;
  color: #166534;
}

.badge--shared {
  background-color: #fef9c3;
  color: #854d0e;
}

/* Preset Actions */
.preset-actions {
  display: flex;
  gap: 4px;
}

.preset-action-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background-color: white;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preset-action-btn:hover {
  border-color: #d1d5db;
  background-color: #f9fafb;
}

.preset-action-btn--danger:hover {
  border-color: #fca5a5;
  background-color: #fef2f2;
  color: #dc2626;
}

.preset-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
}

/* Preset Stats */
.preset-stats {
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: #9ca3af;
}

.stat-item {
  display: flex;
  gap: 4px;
}

.stat-label {
  font-weight: 500;
}

.stat-value {
  color: #6b7280;
}

/* Preset Preview */
.preset-preview {
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.preview-title {
  margin: 0 0 8px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-section {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}

.preview-label {
  color: #6b7280;
  font-weight: 500;
}

.preview-value {
  color: #374151;
}

/* =============================================================================
   🚫 Empty State
   ============================================================================= */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-message {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 16px;
  text-align: center;
}

.empty-action-btn {
  padding: 8px 16px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  background-color: #3b82f6;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.empty-action-btn:hover {
  background-color: #2563eb;
}

/* =============================================================================
   📝 Modals
   ============================================================================= */

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.save-modal,
.import-modal {
  width: 90vw;
  max-width: 500px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

.modal-title {
  margin: 0;
  padding: 20px 24px 16px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
}

.modal-content {
  padding: 24px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

/* Form Elements */
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.15s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  background-color: white;
  position: relative;
  transition: all 0.15s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

.checkbox-text {
  font-size: 0.875rem;
  color: #374151;
}

/* Modal Buttons */
.modal-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-btn--cancel {
  border: 1px solid #d1d5db;
  background-color: white;
  color: #374151;
}

.modal-btn--cancel:hover {
  background-color: #f9fafb;
}

.modal-btn--save,
.modal-btn--import {
  border: 1px solid #3b82f6;
  background-color: #3b82f6;
  color: white;
}

.modal-btn--save:hover:not(:disabled),
.modal-btn--import:hover:not(:disabled) {
  background-color: #2563eb;
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Import Specific */
.import-methods {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.import-method {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.file-input {
  display: none;
}

.file-btn {
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
  align-self: flex-start;
}

.file-btn:hover {
  background-color: #f9fafb;
}

.import-divider {
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  position: relative;
}

.import-divider::before,
.import-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background-color: #e5e7eb;
}

.import-divider::before {
  left: 0;
}

.import-divider::after {
  right: 0;
}

.import-textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.875rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  resize: vertical;
}

/* =============================================================================
   🎬 Animations
   ============================================================================= */

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* =============================================================================
   📱 Responsive Design
   ============================================================================= */

@media (max-width: 768px) {
  .presets-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .search-section {
    width: 100%;
  }
  
  .sort-section {
    justify-content: space-between;
    width: 100%;
  }
  
  .preset-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .preset-actions {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .preset-stats {
    flex-wrap: wrap;
  }
  
  .save-modal,
  .import-modal {
    width: 95vw;
    margin: 20px;
  }
  
  .modal-content {
    padding: 16px;
  }
}

/* =============================================================================
   🌙 Dark Mode
   ============================================================================= */

@media (prefers-color-scheme: dark) {
  .table-presets {
    background-color: #1f2937;
    color: #f9fafb;
  }
  
  .presets-header {
    background-color: #111827;
    border-color: #374151;
  }
  
  .presets-title {
    color: #f9fafb;
  }
  
  .presets-controls {
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .preset-item {
    background-color: #374151;
    border-color: #4b5563;
  }
  
  .preset-item:hover {
    border-color: #6b7280;
  }
  
  .preset-item--selected {
    background-color: #1e3a8a;
    border-color: #60a5fa;
  }
  
  .action-btn,
  .search-input,
  .category-filter,
  .sort-select,
  .sort-order-btn,
  .preset-action-btn {
    background-color: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
  
  .save-modal,
  .import-modal {
    background-color: #1f2937;
    color: #f9fafb;
  }
  
  .modal-title {
    color: #f9fafb;
    border-color: #374151;
  }
  
  .modal-actions {
    background-color: #111827;
    border-color: #374151;
  }
}
</style>