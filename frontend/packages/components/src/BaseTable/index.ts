/**
 * @fileoverview BaseTable Index
 * @description BaseTableパッケージのエクスポート定義
 */

// =============================================================================
// 🎯 Core Components
// =============================================================================

// メインコンポーネント
export { default as BaseTable } from './components/BaseTable.vue'
export { default as BaseTableResponsive } from './components/BaseTableResponsive.vue'

// セル関連コンポーネント
export { default as MultiItemCell } from './components/MultiItemCell.vue'
export { default as ItemRow } from './components/ItemRow.vue'

// レスポンシブコンポーネント
export { default as TableStack } from './components/TableStack.vue'
export { default as TableCards } from './components/TableCards.vue'

// UI コンポーネント
export { default as TableHeader } from './components/TableHeader.vue'
export { default as TableBody } from './components/TableBody.vue'
export { default as TablePagination } from './components/TablePagination.vue'
export { default as TableToolbar } from './components/TableToolbar.vue'

// 設定系コンポーネント
export { default as ColumnConfig } from './components/ColumnConfig.vue'
export { default as TableSettings } from './components/TableSettings.vue'
export { default as TablePresets } from './components/TablePresets.vue'

// =============================================================================
// 🔧 Composables
// =============================================================================

export { useTableResponsive, BREAKPOINTS } from './composables/useTableResponsive'
// export { useTableData } from './composables/useTableData'
// export { useTableConfig } from './composables/useTableConfig'

// =============================================================================
// 📊 Types
// =============================================================================

export type * from './types'