<!--
  @fileoverview MultiItemCell Component
  @description 複数項目を1つのセルに表示する革新的コンポーネント
  🔥 画像要件の核心：1カラムに複数項目、個別ソート・フィルタ、美しいレイアウト
-->

<template>
  <td
    :class="cellClasses"
    :style="cellStyles"
    :rowspan="rowspan"
    :colspan="colspan"
    role="cell"
    :aria-label="cellAriaLabel"
  >
    <div class="multi-item-cell" :class="cellContentClasses">
      <!-- Primary Item (最重要項目) -->
      <div 
        v-if="primaryItem"
        class="primary-item"
        :class="primaryItemClasses"
      >
        <ItemRow
          :item="primaryItem"
          :data="data"
          :row-index="rowIndex"
          :primary="true"
          :editable="editable && primaryItem.editable"
          :compact="false"
          :show-label="false"
          @edit-start="handleEditStart"
          @edit-save="handleEditSave"
          @edit-cancel="handleEditCancel"
          @value-click="handleValueClick"
          @sort-click="handleSortClick"
          @filter-click="handleFilterClick"
        />
      </div>

      <!-- Secondary Items (副項目) -->
      <div 
        v-if="secondaryItems.length > 0"
        class="secondary-items"
        :class="secondaryItemsClasses"
      >
        <ItemRow
          v-for="(item, index) in secondaryItems"
          :key="`secondary-${item.key}-${index}`"
          :item="item"
          :data="data"
          :row-index="rowIndex"
          :primary="false"
          :editable="editable && item.editable"
          :compact="compact"
          :show-label="false"
          @edit-start="handleEditStart"
          @edit-save="handleEditSave"
          @edit-cancel="handleEditCancel"
          @value-click="handleValueClick"
          @sort-click="handleSortClick"
          @filter-click="handleFilterClick"
        />
      </div>

      <!-- Additional Items (追加項目 - 展開時のみ表示) -->
      <div 
        v-if="additionalItems.length > 0 && showAdditionalItems"
        class="additional-items"
        :class="additionalItemsClasses"
      >
        <ItemRow
          v-for="(item, index) in additionalItems"
          :key="`additional-${item.key}-${index}`"
          :item="item"
          :data="data"
          :row-index="rowIndex"
          :primary="false"
          :editable="editable && item.editable"
          :compact="true"
          :show-label="false"
          @edit-start="handleEditStart"
          @edit-save="handleEditSave"
          @edit-cancel="handleEditCancel"
          @value-click="handleValueClick"
          @sort-click="handleSortClick"
          @filter-click="handleFilterClick"
        />
      </div>

      <!-- Expansion Toggle (追加項目がある場合) -->
      <button
        v-if="additionalItems.length > 0"
        class="expansion-toggle"
        :class="expansionToggleClasses"
        type="button"
        @click="toggleExpansion"
        :aria-expanded="showAdditionalItems"
        :aria-label="expansionAriaLabel"
      >
        <span class="toggle-icon" :class="{ 'expanded': showAdditionalItems }">
          {{ showAdditionalItems ? '▼' : '▶' }}
        </span>
        <span class="toggle-text">
          {{ showAdditionalItems ? '簡略表示' : `他${additionalItems.length}項目` }}
        </span>
      </button>

      <!-- Actions Menu (アクション項目) -->
      <div
        v-if="hasActions"
        class="cell-actions"
        :class="actionsClasses"
      >
        <button
          class="action-button"
          type="button"
          @click="showActionsMenu = !showActionsMenu"
          :aria-expanded="showActionsMenu"
          aria-label="アクション"
        >
          ⋮
        </button>
        
        <div
          v-if="showActionsMenu"
          class="actions-menu"
          :class="actionsMenuClasses"
        >
          <button
            v-for="action in actions"
            :key="action.key"
            class="action-item"
            type="button"
            @click="handleActionClick(action)"
            :disabled="action.disabled"
          >
            <span v-if="action.icon" class="action-icon">{{ action.icon }}</span>
            <span class="action-label">{{ action.label }}</span>
          </button>
        </div>
      </div>
    </div>
  </td>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import type { 
  MultiItemCellProps,
  TableItemField,
  TableItem,
  TableColumn
} from '../types'
import ItemRow from './ItemRow.vue'

// =============================================================================
// 📝 Component Props & Emits
// =============================================================================

export interface Props extends MultiItemCellProps {
  rowspan?: number
  colspan?: number
  actions?: Array<{
    key: string
    label: string
    icon?: string
    disabled?: boolean
    handler: (data: TableItem) => void
  }>
  showExpansion?: boolean
  maxVisibleItems?: number
  cellClassName?: string
}

const props = withDefaults(defineProps<Props>(), {
  rowspan: 1,
  colspan: 1,
  editable: false,
  compact: false,
  actions: () => [],
  showExpansion: true,
  maxVisibleItems: 3
})

const emit = defineEmits<{
  'edit-start': [id: string | number, field: string]
  'edit-save': [id: string | number, field: string, value: any]
  'edit-cancel': [id: string | number, field: string]
  'value-click': [item: TableItemField, data: TableItem]
  'action-click': [action: string, data: TableItem]
  'expand-toggle': [expanded: boolean, data: TableItem]
  'sort-click': [item: TableItemField, data: TableItem]
  'filter-click': [item: TableItemField, data: TableItem]
}>()

// =============================================================================
// 📊 Reactive State
// =============================================================================

const showAdditionalItems = ref(false)
const showActionsMenu = ref(false)

// =============================================================================
// 📊 Computed Properties
// =============================================================================

// Item categorization (項目の分類)
const primaryItem = computed((): TableItemField | null => {
  return props.items.find(item => item.priority === 'high') || props.items[0] || null
})

const secondaryItems = computed((): TableItemField[] => {
  const primary = primaryItem.value
  const remaining = props.items.filter(item => item !== primary)
  
  if (!props.showExpansion) {
    return remaining
  }
  
  return remaining.slice(0, Math.max(0, props.maxVisibleItems - 1))
})

const additionalItems = computed((): TableItemField[] => {
  if (!props.showExpansion) {
    return []
  }
  
  const primary = primaryItem.value
  const allSecondary = props.items.filter(item => item !== primary)
  
  return allSecondary.slice(Math.max(0, props.maxVisibleItems - 1))
})

const hasActions = computed(() => props.actions.length > 0)

// Style classes
const cellClasses = computed(() => [
  'table-cell',
  'multi-item-cell-wrapper',
  props.cellClassName,
  {
    'cell--editable': props.editable,
    'cell--compact': props.compact,
    'cell--has-actions': hasActions.value,
    'cell--expanded': showAdditionalItems.value
  }
])

const cellStyles = computed(() => {
  const styles: Record<string, any> = {}
  
  // Column width styling
  if (props.column?.width) {
    const width = props.column.width
    switch (width.type) {
      case 'fixed':
        styles.width = `${width.value}px`
        styles.minWidth = styles.width
        styles.maxWidth = styles.width
        break
      case 'percentage':
        styles.width = `${width.value}%`
        break
      case 'minmax':
        styles.minWidth = `${width.min}px`
        styles.maxWidth = `${width.max}px`
        break
    }
  }
  
  return styles
})

const cellContentClasses = computed(() => [
  {
    'compact-layout': props.compact,
    'comfortable-layout': !props.compact,
    'has-expansion': additionalItems.value.length > 0,
    'expanded': showAdditionalItems.value
  }
])

const primaryItemClasses = computed(() => [
  {
    'primary--prominent': !props.compact,
    'primary--subtle': props.compact
  }
])

const secondaryItemsClasses = computed(() => [
  {
    'secondary--stacked': !props.compact,
    'secondary--inline': props.compact
  }
])

const additionalItemsClasses = computed(() => [
  'additional-items--animated'
])

const expansionToggleClasses = computed(() => [
  {
    'toggle--compact': props.compact,
    'toggle--comfortable': !props.compact,
    'toggle--active': showAdditionalItems.value
  }
])

const actionsClasses = computed(() => [
  {
    'actions--floating': !props.compact,
    'actions--inline': props.compact
  }
])

const actionsMenuClasses = computed(() => [
  'actions-menu--slide-in'
])

// ARIA labels
const cellAriaLabel = computed(() => {
  const itemCount = props.items.length
  const primaryLabel = primaryItem.value?.label || ''
  return `セル: ${primaryLabel} (${itemCount}項目)`
})

const expansionAriaLabel = computed(() => {
  const count = additionalItems.value.length
  return showAdditionalItems.value 
    ? '追加項目を非表示' 
    : `追加${count}項目を表示`
})

// =============================================================================
// 🎯 Event Handlers
// =============================================================================

const handleEditStart = (field: string) => {
  emit('edit-start', props.data.id, field)
}

const handleEditSave = (field: string, value: any) => {
  emit('edit-save', props.data.id, field, value)
}

const handleEditCancel = (field: string) => {
  emit('edit-cancel', props.data.id, field)
}

const handleValueClick = (item: TableItemField, data: TableItem) => {
  emit('value-click', item, data)
}

const toggleExpansion = () => {
  showAdditionalItems.value = !showAdditionalItems.value
  emit('expand-toggle', showAdditionalItems.value, props.data)
  
  // Close actions menu when expanding
  if (showAdditionalItems.value) {
    showActionsMenu.value = false
  }
}

const handleActionClick = (action: any) => {
  action.handler(props.data)
  emit('action-click', action.key, props.data)
  showActionsMenu.value = false
}

const handleSortClick = (item: TableItemField) => {
  emit('sort-click', item, props.data)
}

const handleFilterClick = (item: TableItemField) => {
  emit('filter-click', item, props.data)
}

// Close actions menu when clicking outside
const closeActionsMenu = () => {
  showActionsMenu.value = false
}

// =============================================================================
// 📤 Expose Public API
// =============================================================================

defineExpose({
  expand: () => { showAdditionalItems.value = true },
  collapse: () => { showAdditionalItems.value = false },
  isExpanded: () => showAdditionalItems.value,
  toggleExpansion,
  getVisibleItems: () => [
    primaryItem.value,
    ...secondaryItems.value,
    ...(showAdditionalItems.value ? additionalItems.value : [])
  ].filter(Boolean)
})
</script>

<style scoped>
/* =============================================================================
   🎨 Multi-Item Cell Styles
   ============================================================================= */

.multi-item-cell-wrapper {
  position: relative;
  padding: 0;
  vertical-align: top;
  border: 1px solid #e5e7eb;
  background-color: white;
  transition: all 0.2s ease;
}

.multi-item-cell {
  display: flex;
  flex-direction: column;
  min-height: 48px;
  position: relative;
}

/* Compact vs Comfortable layouts */
.comfortable-layout {
  padding: 12px 16px;
  gap: 8px;
}

.compact-layout {
  padding: 8px 12px;
  gap: 4px;
}

/* =============================================================================
   📋 Item Sections
   ============================================================================= */

/* Primary Item */
.primary-item {
  display: flex;
  align-items: flex-start;
  min-height: 24px;
}

.primary--prominent {
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
  margin-bottom: 4px;
}

.primary--subtle {
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

/* Secondary Items */
.secondary-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.secondary--stacked {
  align-items: flex-start;
}

.secondary--inline {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px 16px;
}

/* Additional Items */
.additional-items {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.additional-items--animated {
  animation: slideDown 0.2s ease-out;
}

/* =============================================================================
   🔄 Expansion Toggle
   ============================================================================= */

.expansion-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  color: #6b7280;
  transition: all 0.15s ease;
  align-self: flex-start;
}

.expansion-toggle:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
}

.toggle--compact {
  padding: 2px 6px;
  font-size: 0.625rem;
}

.toggle--comfortable {
  padding: 4px 8px;
  font-size: 0.75rem;
}

.toggle--active {
  background-color: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.toggle-icon {
  transition: transform 0.15s ease;
  font-size: 0.625rem;
}

.toggle-icon.expanded {
  transform: rotate(0deg);
}

.toggle-text {
  white-space: nowrap;
}

/* =============================================================================
   ⚡ Actions Menu
   ============================================================================= */

.cell-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
}

.actions--floating {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.multi-item-cell-wrapper:hover .actions--floating {
  opacity: 1;
}

.actions--inline {
  opacity: 1;
  position: static;
  margin-top: 4px;
  align-self: flex-end;
}

.action-button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6b7280;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.action-button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.actions-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  z-index: 10;
}

.actions-menu--slide-in {
  animation: slideIn 0.15s ease-out;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  transition: background-color 0.15s ease;
}

.action-item:first-child {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}

.action-item:last-child {
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.action-item:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.action-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon {
  font-size: 0.875rem;
  width: 16px;
  text-align: center;
}

.action-label {
  flex: 1;
}

/* =============================================================================
   🎨 State Variations
   ============================================================================= */

/* Editable state */
.cell--editable {
  cursor: pointer;
}

.cell--editable:hover {
  background-color: #fefce8;
  border-color: #facc15;
}

/* Expanded state */
.cell--expanded {
  background-color: #f8fafc;
  border-color: #3b82f6;
}

/* Compact state */
.cell--compact .primary-item {
  font-size: 0.875rem;
}

.cell--compact .secondary-items {
  gap: 2px;
}

/* =============================================================================
   🎭 Animations
   ============================================================================= */

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 200px;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* =============================================================================
   📱 Responsive Adjustments
   ============================================================================= */

@media (max-width: 768px) {
  .multi-item-cell {
    min-height: 40px;
  }
  
  .comfortable-layout {
    padding: 8px 12px;
    gap: 6px;
  }
  
  .compact-layout {
    padding: 6px 8px;
    gap: 3px;
  }
  
  .secondary--inline {
    flex-direction: column;
    gap: 4px;
  }
  
  .actions--floating {
    opacity: 1; /* Always show on mobile */
  }
  
  .action-button {
    width: 28px;
    height: 28px;
  }
}

/* =============================================================================
   🌙 Dark Mode
   ============================================================================= */

@media (prefers-color-scheme: dark) {
  .multi-item-cell-wrapper {
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .primary--prominent {
    color: #f9fafb;
  }
  
  .primary--subtle {
    color: #d1d5db;
  }
  
  .expansion-toggle {
    background-color: #374151;
    border-color: #4b5563;
    color: #d1d5db;
  }
  
  .expansion-toggle:hover {
    background-color: #4b5563;
    border-color: #6b7280;
    color: #f3f4f6;
  }
  
  .actions-menu {
    background-color: #1f2937;
    border-color: #374151;
  }
  
  .action-item {
    color: #d1d5db;
  }
  
  .action-item:hover:not(:disabled) {
    background-color: #374151;
  }
}
</style>