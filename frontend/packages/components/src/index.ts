// コンポーネントのエクスポート
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseCard } from './BaseCard.vue'
export { default as BaseInput } from './BaseInput.vue'
export { default as BasePassword } from './BasePassword.vue'
export { default as BaseModal } from './BaseModal.vue'
export { default as BaseSpinner } from './BaseSpinner.vue'

// BaseTable システムのエクスポート
export {
  // メインコンポーネント
  // BaseTable,  // 一時的にコメントアウト
  BaseTableResponsive,
  
  // セル関連コンポーネント
  MultiItemCell,
  ItemRow,
  
  // レスポンシブコンポーネント
  TableStack,
  TableCards,
  
  // UI コンポーネント
  TableHeader,
  TableBody,
  TablePagination,
  TableToolbar,
  
  // 設定系コンポーネント
  ColumnConfig,
  TableSettings,
  TablePresets,
  
  // Composables
  useTableResponsive,
  BREAKPOINTS
} from './BaseTable'

// 型定義のエクスポート
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
export type ButtonSize = 'small' | 'medium' | 'large'
export type CardShadow = 'none' | 'small' | 'medium' | 'large'
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
export type InputVariant = 'default' | 'error' | 'success'
export type InputSize = 'small' | 'medium' | 'large'
export type PasswordAutocomplete = 'current-password' | 'new-password' | 'off'
export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen'
export type SpinnerType = 'circular' | 'dots' | 'pulse'

// BaseTable システムの型エクスポート
export type {
  // Core Data Types
  TableItem,
  TableItemField,
  TableColumn,
  
  // Configuration Types
  ColumnWidth,
  PaginationConfig,
  VirtualConfig,
  ResponsiveConfig,
  AppearanceConfig,
  BehaviorConfig,
  TableConfig,
  
  // Responsive Types
  BreakpointKey,
  ResponsiveValue,
  BreakpointCondition,
  
  // Component Props
  BaseTableProps,
  MultiItemCellProps,
  ColumnConfigOptions,
  
  // Data Management
  TableDataState,
  TableDataActions,
  ExportOptions,
  
  // Events
  TableEvents,
  TableSortFilterEvents,
  
  // Settings & Presets
  ITableSettings,
  TablePreset,
  ColumnStats,
  
  // Validation & Accessibility
  ValidationConfig,
  ValidationRule,
  AccessibilityConfig,
  PerformanceConfig,
  
  // Integration Types
  TableSortFilterConfig,
  
  // Re-exported from BaseSortFilter
  SortConfig,
  FilterConfig,
  SortFilterConfig,
  FilterOperator
} from './BaseTable'