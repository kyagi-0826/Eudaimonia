<!--
  @fileoverview ItemRow Component
  @description 個々の項目を表示・編集する基本コンポーネント
  🔥 項目表示の基礎：値表示、編集機能、ソート・フィルタアイコン、型別フォーマット
-->

<template>
  <div 
    :class="itemRowClasses"
    :style="itemRowStyles"
    role="group"
    :aria-label="itemAriaLabel"
  >
    <!-- Item Label -->
    <div 
      v-if="showLabel"
      class="item-label"
      :class="labelClasses"
      :title="item.label"
    >
      <span class="label-text">{{ item.label }}</span>
      <span v-if="item.required" class="required-indicator" aria-label="必須">*</span>
    </div>

    <!-- Item Value -->
    <div 
      class="item-value"
      :class="valueClasses"
    >
      <!-- Edit Mode -->
      <div
        v-if="isEditing"
        class="value-editor"
        :class="editorClasses"
      >
        <component
          :is="editorComponent"
          v-model="editValue"
          v-bind="editorProps"
          class="value-input"
          :class="inputClasses"
          @blur="handleBlur"
          @keydown.enter="saveEdit"
          @keydown.escape="cancelEdit"
          :aria-label="inputAriaLabel"
        />
        
        <div class="edit-actions">
          <button
            type="button"
            class="edit-action edit-action--save"
            @click="saveEdit"
            :disabled="!isEditValueValid"
            aria-label="保存"
            title="保存 (Enter)"
          >
            ✓
          </button>
          <button
            type="button"
            class="edit-action edit-action--cancel"
            @click="cancelEdit"
            aria-label="キャンセル"
            title="キャンセル (Escape)"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Display Mode -->
      <div
        v-else
        class="value-display"
        :class="displayClasses"
        @click="handleValueClick"
        :tabindex="editable ? 0 : undefined"
        :role="editable ? 'button' : undefined"
        :aria-label="editable ? `${item.label}を編集` : undefined"
        @keydown.enter="startEdit"
        @keydown.space="startEdit"
      >
        <!-- Formatted Value -->
        <span class="formatted-value" :class="formattedValueClasses">
          {{ formattedValue }}
        </span>

        <!-- Type Icon -->
        <span 
          v-if="showTypeIcon"
          class="type-icon" 
          :class="typeIconClasses"
          :title="typeIconTitle"
        >
          {{ typeIcon }}
        </span>

        <!-- Edit Indicator -->
        <span
          v-if="editable && !primary"
          class="edit-indicator"
          title="クリックして編集"
        >
          ✏️
        </span>
      </div>
    </div>

    <!-- Item Actions -->
    <div 
      v-if="showActions"
      class="item-actions"
      :class="actionsClasses"
    >
      <!-- Sort Button -->
      <button
        v-if="item.sortable"
        type="button"
        class="item-action sort-action"
        :class="sortActionClasses"
        @click="handleSort"
        :aria-label="sortAriaLabel"
        :title="sortTitle"
      >
        <span class="sort-icon">{{ sortIcon }}</span>
      </button>

      <!-- Filter Button -->
      <button
        v-if="item.filterable"
        type="button"
        class="item-action filter-action"
        :class="filterActionClasses"
        @click="handleFilter"
        :aria-label="filterAriaLabel"
        :title="filterTitle"
      >
        <span class="filter-icon">{{ filterIcon }}</span>
      </button>

      <!-- Link Button (for link types) -->
      <button
        v-if="isLinkType && formattedValue"
        type="button"
        class="item-action link-action"
        @click="handleLinkClick"
        :aria-label="`${item.label}のリンクを開く`"
        title="リンクを開く"
      >
        <span class="link-icon">🔗</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { TableItemField, TableItem } from '../types'

// =============================================================================
// 📝 Component Props & Emits
// =============================================================================

export interface Props {
  item: TableItemField                     // 項目定義
  data: TableItem                         // 行データ
  rowIndex: number                        // 行インデックス
  primary?: boolean                       // 主項目かどうか
  editable?: boolean                      // 編集可能かどうか
  compact?: boolean                       // コンパクト表示
  showLabel?: boolean                     // ラベル表示
  showActions?: boolean                   // アクション表示
  showTypeIcon?: boolean                  // 型アイコン表示
}

const props = withDefaults(defineProps<Props>(), {
  primary: false,
  editable: false,
  compact: false,
  showLabel: true,
  showActions: true,
  showTypeIcon: false
})

const emit = defineEmits<{
  'edit-start': [field: string]
  'edit-save': [field: string, value: any]
  'edit-cancel': [field: string]
  'value-click': [item: TableItemField, data: TableItem]
  'sort-click': [item: TableItemField]
  'filter-click': [item: TableItemField]
  'link-click': [item: TableItemField, url: string]
}>()

// =============================================================================
// 📊 Reactive State
// =============================================================================

const isEditing = ref(false)
const editValue = ref<any>(null)
const originalValue = ref<any>(null)

// =============================================================================
// 📊 Computed Properties
// =============================================================================

// Value and formatting
const rawValue = computed(() => props.data[props.item.key])

const formattedValue = computed(() => {
  const value = rawValue.value
  
  if (value === null || value === undefined || value === '') {
    return props.item.placeholder || '—'
  }

  // Custom formatter takes priority
  if (props.item.formatter) {
    return props.item.formatter(value)
  }

  // Type-based formatting
  switch (props.item.type) {
    case 'date':
      return formatDate(value)
    case 'number':
      return formatNumber(value)
    case 'email':
      return formatEmail(value)
    case 'phone':
      return formatPhone(value)
    case 'url':
      return formatUrl(value)
    case 'boolean':
      return formatBoolean(value)
    case 'text':
    default:
      return formatText(value)
  }
})

const isEditValueValid = computed(() => {
  if (!props.item.validator) return true
  return props.item.validator(editValue.value)
})

// Type information
const isLinkType = computed(() => 
  props.item.type === 'url' || props.item.type === 'email'
)

// Style classes
const itemRowClasses = computed(() => [
  'item-row',
  `item-type--${props.item.type}`,
  {
    'item-row--primary': props.primary,
    'item-row--secondary': !props.primary,
    'item-row--compact': props.compact,
    'item-row--comfortable': !props.compact,
    'item-row--editable': props.editable,
    'item-row--editing': isEditing.value,
    'item-row--required': props.item.required,
    'item-row--has-value': rawValue.value !== null && rawValue.value !== undefined && rawValue.value !== ''
  }
])

const itemRowStyles = computed(() => {
  const styles: Record<string, any> = {}
  
  if (props.item.align) {
    styles.textAlign = props.item.align
  }
  
  return styles
})

const labelClasses = computed(() => [
  {
    'label--primary': props.primary,
    'label--secondary': !props.primary,
    'label--compact': props.compact
  }
])

const valueClasses = computed(() => [
  {
    'value--primary': props.primary,
    'value--secondary': !props.primary,
    'value--empty': !rawValue.value,
    'value--clickable': props.editable || isLinkType.value
  }
])

const displayClasses = computed(() => [
  {
    'display--editable': props.editable,
    'display--link': isLinkType.value
  }
])

const formattedValueClasses = computed(() => [
  `value-type--${props.item.type}`,
  {
    'value--placeholder': !rawValue.value,
    'value--with-prefix': props.item.prefix,
    'value--with-suffix': props.item.suffix
  }
])

const actionsClasses = computed(() => [
  {
    'actions--visible': !props.compact,
    'actions--hover': props.compact
  }
])

// Icons and labels
const typeIcon = computed(() => {
  const icons = {
    text: '📝',
    number: '🔢',
    date: '📅',
    email: '📧',
    phone: '📞',
    url: '🔗',
    boolean: '☑️',
    image: '🖼️',
    link: '🔗'
  }
  return icons[props.item.type] || '📄'
})

const typeIconTitle = computed(() => {
  const titles = {
    text: 'テキスト',
    number: '数値',
    date: '日付',
    email: 'メール',
    phone: '電話番号',
    url: 'URL',
    boolean: 'チェック',
    image: '画像',
    link: 'リンク'
  }
  return titles[props.item.type] || 'データ'
})

const sortIcon = computed(() => '📊')
const filterIcon = computed(() => '🔍')

// ARIA labels
const itemAriaLabel = computed(() => {
  const typeLabel = typeIconTitle.value
  const value = formattedValue.value
  return `${props.item.label}: ${value} (${typeLabel})`
})

const inputAriaLabel = computed(() => `${props.item.label}を編集`)
const sortAriaLabel = computed(() => `${props.item.label}でソート`)
const filterAriaLabel = computed(() => `${props.item.label}でフィルタ`)
const sortTitle = computed(() => `${props.item.label}でソート`)
const filterTitle = computed(() => `${props.item.label}でフィルタ`)

// Editor component
const editorComponent = computed(() => {
  switch (props.item.type) {
    case 'boolean':
      return 'input' // type="checkbox"
    case 'date':
      return 'input' // type="date"
    case 'email':
      return 'input' // type="email"
    case 'url':
      return 'input' // type="url"
    case 'phone':
      return 'input' // type="tel"
    case 'number':
      return 'input' // type="number"
    case 'text':
    default:
      return 'input' // type="text"
  }
})

const editorProps = computed(() => {
  const baseProps = {
    placeholder: props.item.placeholder || `${props.item.label}を入力...`
  }

  switch (props.item.type) {
    case 'boolean':
      return { ...baseProps, type: 'checkbox' }
    case 'date':
      return { ...baseProps, type: 'date' }
    case 'email':
      return { ...baseProps, type: 'email' }
    case 'url':
      return { ...baseProps, type: 'url' }
    case 'phone':
      return { ...baseProps, type: 'tel' }
    case 'number':
      return { ...baseProps, type: 'number' }
    case 'text':
    default:
      return { ...baseProps, type: 'text' }
  }
})

const editorClasses = computed(() => [
  `editor--${props.item.type}`
])

const inputClasses = computed(() => [
  {
    'input--invalid': !isEditValueValid.value
  }
])

const typeIconClasses = computed(() => [
  `type-icon--${props.item.type}`
])

const sortActionClasses = computed(() => [
  // Add sort state classes here
])

const filterActionClasses = computed(() => [
  // Add filter state classes here
])

// =============================================================================
// 🎯 Formatting Functions
// =============================================================================

const formatDate = (value: any): string => {
  if (!value) return ''
  try {
    const date = new Date(value)
    return date.toLocaleDateString('ja-JP')
  } catch {
    return String(value)
  }
}

const formatNumber = (value: any): string => {
  if (value === null || value === undefined) return ''
  const num = Number(value)
  if (isNaN(num)) return String(value)
  
  const formatted = num.toLocaleString('ja-JP')
  
  // Add prefix and suffix
  let result = formatted
  if (props.item.prefix) result = props.item.prefix + result
  if (props.item.suffix) result = result + props.item.suffix
  
  return result
}

const formatEmail = (value: any): string => {
  return String(value || '')
}

const formatPhone = (value: any): string => {
  const phone = String(value || '')
  // Basic phone formatting for Japanese numbers
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
}

const formatUrl = (value: any): string => {
  const url = String(value || '')
  if (url && !url.startsWith('http')) {
    return `https://${url}`
  }
  return url
}

const formatBoolean = (value: any): string => {
  return value ? '✓' : '✗'
}

const formatText = (value: any): string => {
  const text = String(value || '')
  
  // Add prefix and suffix
  let result = text
  if (props.item.prefix) result = props.item.prefix + result
  if (props.item.suffix) result = result + props.item.suffix
  
  return result
}

// =============================================================================
// 🎯 Event Handlers
// =============================================================================

const startEdit = async () => {
  if (!props.editable) return
  
  isEditing.value = true
  originalValue.value = rawValue.value
  editValue.value = rawValue.value
  
  emit('edit-start', props.item.key)
  
  // Focus input after rendering
  await nextTick()
  const input = document.querySelector('.value-input') as HTMLInputElement
  if (input) {
    input.focus()
    if (input.type === 'text' || input.type === 'email' || input.type === 'url') {
      input.select()
    }
  }
}

const saveEdit = () => {
  if (!isEditValueValid.value) return
  
  emit('edit-save', props.item.key, editValue.value)
  isEditing.value = false
}

const cancelEdit = () => {
  editValue.value = originalValue.value
  emit('edit-cancel', props.item.key)
  isEditing.value = false
}

const handleBlur = () => {
  // Auto-save on blur if valid
  if (isEditValueValid.value && editValue.value !== originalValue.value) {
    saveEdit()
  } else {
    cancelEdit()
  }
}

const handleValueClick = () => {
  if (props.editable) {
    startEdit()
  } else if (isLinkType.value && formattedValue.value) {
    handleLinkClick()
  }
  
  emit('value-click', props.item, props.data)
}

const handleSort = () => {
  emit('sort-click', props.item)
}

const handleFilter = () => {
  emit('filter-click', props.item)
}

const handleLinkClick = () => {
  const url = formattedValue.value
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
    emit('link-click', props.item, url)
  }
}

// =============================================================================
// 🔄 Watchers
// =============================================================================

watch(
  () => rawValue.value,
  (newValue) => {
    if (!isEditing.value) {
      editValue.value = newValue
    }
  }
)
</script>

<style scoped>
/* =============================================================================
   🎨 Item Row Styles
   ============================================================================= */

.item-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 20px;
  transition: all 0.15s ease;
}

.item-row--compact {
  gap: 4px;
  min-height: 16px;
}

.item-row--comfortable {
  gap: 8px;
  min-height: 24px;
}

.item-row--primary {
  font-weight: 600;
}

.item-row--secondary {
  font-weight: 400;
}

.item-row--editable {
  cursor: pointer;
}

.item-row--editing {
  background-color: #fefce8;
  border-radius: 4px;
  padding: 4px;
  margin: -4px;
}

.item-row--required .item-label {
  position: relative;
}

/* =============================================================================
   🏷️ Item Label
   ============================================================================= */

.item-label {
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  flex-shrink: 0;
  color: #6b7280;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.2;
}

.label--primary {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
}

.label--compact {
  font-size: 0.625rem;
}

.label-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.required-indicator {
  color: #ef4444;
  font-weight: bold;
  margin-left: 2px;
}

/* =============================================================================
   💎 Item Value
   ============================================================================= */

.item-value {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.value-display {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  min-height: 18px;
  border-radius: 3px;
  transition: all 0.15s ease;
}

.display--editable {
  padding: 2px 4px;
  cursor: pointer;
}

.display--editable:hover {
  background-color: #f9fafb;
}

.display--editable:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 1px;
}

.display--link {
  cursor: pointer;
  color: #2563eb;
}

.display--link:hover {
  text-decoration: underline;
}

.formatted-value {
  flex: 1;
  line-height: 1.3;
  word-break: break-word;
}

.value--primary .formatted-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
}

.value--secondary .formatted-value {
  font-size: 0.75rem;
  color: #6b7280;
}

.value--placeholder {
  color: #9ca3af !important;
  font-style: italic;
}

/* Type-specific formatting */
.value-type--date {
  font-family: monospace;
}

.value-type--number {
  font-family: monospace;
  text-align: right;
}

.value-type--email {
  color: #1d4ed8;
}

.value-type--phone {
  font-family: monospace;
}

.value-type--url {
  color: #1d4ed8;
  text-decoration: underline;
}

.value-type--boolean {
  font-size: 1rem;
}

/* =============================================================================
   ✏️ Value Editor
   ============================================================================= */

.value-editor {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
}

.value-input {
  flex: 1;
  padding: 4px 6px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.75rem;
  line-height: 1.3;
  background: white;
  transition: border-color 0.15s ease;
}

.value-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.input--invalid {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 1px #ef4444 !important;
}

.edit-actions {
  display: flex;
  gap: 2px;
}

.edit-action {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  background: white;
  cursor: pointer;
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.edit-action--save {
  color: #059669;
  border-color: #10b981;
}

.edit-action--save:hover:not(:disabled) {
  background-color: #10b981;
  color: white;
}

.edit-action--save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-action--cancel {
  color: #dc2626;
  border-color: #ef4444;
}

.edit-action--cancel:hover {
  background-color: #ef4444;
  color: white;
}

/* =============================================================================
   🎭 Icons & Actions
   ============================================================================= */

.type-icon {
  font-size: 0.75rem;
  opacity: 0.6;
  flex-shrink: 0;
}

.edit-indicator {
  font-size: 0.625rem;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.item-row--editable:hover .edit-indicator {
  opacity: 0.6;
}

.item-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.15s ease;
  align-self: flex-start;
}

.actions--visible {
  opacity: 1;
}

.actions--hover:hover,
.item-row:hover .actions--hover {
  opacity: 1;
}

.item-action {
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  opacity: 0.6;
}

.item-action:hover {
  opacity: 1;
  background-color: #f3f4f6;
}

.sort-action:hover {
  color: #3b82f6;
}

.filter-action:hover {
  color: #059669;
}

.link-action:hover {
  color: #7c3aed;
}

.sort-icon,
.filter-icon,
.link-icon {
  font-size: 0.625rem;
}

/* =============================================================================
   📱 Responsive Adjustments
   ============================================================================= */

@media (max-width: 768px) {
  .item-row {
    gap: 6px;
  }
  
  .item-row--compact {
    gap: 3px;
  }
  
  .label-text {
    max-width: 80px;
  }
  
  .actions--hover {
    opacity: 1; /* Always show on mobile */
  }
}

/* =============================================================================
   🌙 Dark Mode
   ============================================================================= */

@media (prefers-color-scheme: dark) {
  .item-label {
    color: #9ca3af;
  }
  
  .label--primary {
    color: #d1d5db;
  }
  
  .value--primary .formatted-value {
    color: #f9fafb;
  }
  
  .value--secondary .formatted-value {
    color: #9ca3af;
  }
  
  .display--editable:hover {
    background-color: #374151;
  }
  
  .value-input {
    background: #1f2937;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .value-input:focus {
    border-color: #3b82f6;
  }
  
  .edit-action {
    background: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
  
  .item-action:hover {
    background-color: #4b5563;
  }
}</style>