/**
 * @fileoverview BaseTable Core Type Definitions
 * @description 企業レベルのテーブルシステムの包括的型定義
 */

// BaseSortFilterからインポートする型
import type {
  SortConfig,
  FilterConfig,
  SortFilterConfig,
  FilterOperator
} from '../../BaseSortFilter/types'

// =============================================================================
// ✨ Core Data Types
// =============================================================================

/**
 * テーブルの基本データアイテム
 * - 必須のid以外は任意のプロパティを持てる柔軟な設計
 */
export interface TableItem {
  id: string | number           // 一意識別子（必須）
  [key: string]: any           // 任意のデータフィールド
}

/**
 * テーブル項目のフィールド定義
 * - データ型、表示、操作の詳細な設定
 */
export interface TableItemField {
  key: string                                  // データアクセスキー
  label: string                               // 表示ラベル
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'url' | 'boolean' | 'image' | 'link'
  required?: boolean                          // 必須項目フラグ
  sortable?: boolean                         // ソート可能フラグ
  filterable?: boolean                       // フィルタ可能フラグ
  formatter?: (value: any) => string         // カスタムフォーマッタ
  validator?: (value: any) => boolean        // バリデータ関数
  width?: ColumnWidth                        // 推奨表示幅
  align?: 'left' | 'center' | 'right'      // テキスト配置
  priority?: 'high' | 'medium' | 'low'      // 表示優先度（レスポンシブ対応）
  editable?: boolean                         // インライン編集可能
  linkTemplate?: string                      // リンク型の場合のURLテンプレート
  placeholder?: string                       // 空値時のプレースホルダー
  prefix?: string                           // 表示プレフィックス（例：¥、#）
  suffix?: string                           // 表示サフィックス（例：円、%）
}

// =============================================================================
// 🏗️ Column Configuration
// =============================================================================

/**
 * カラム幅の設定
 * - 固定、パーセンテージ、自動、範囲指定をサポート
 */
export interface ColumnWidth {
  type: 'fixed' | 'percentage' | 'auto' | 'minmax'
  value?: number                            // 基本値
  min?: number                              // 最小値（minmaxの場合）
  max?: number                              // 最大値（minmaxの場合）
  preset?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto'  // プリセット幅
}

/**
 * テーブルカラムの設定
 * - 1カラムに複数項目を配置可能な設計
 */
export interface TableColumn {
  id: string                                // カラム一意識別子
  label: string                            // カラムヘッダーラベル
  items: TableItemField[]                  // このカラム内の項目リスト
  visible: boolean                         // 表示/非表示フラグ
  width: ColumnWidth                       // カラム幅設定
  minWidth?: number                        // 最小幅（px）
  maxWidth?: number                        // 最大幅（px）
  resizable: boolean                       // リサイズ可能フラグ
  sticky?: 'left' | 'right'               // 固定位置（左右）
  sortConfig?: SortConfig                  // カラムレベルのソート設定
  filterConfig?: FilterConfig              // カラムレベルのフィルタ設定
  className?: string                       // カスタムCSSクラス
  headerClassName?: string                 // ヘッダー専用CSSクラス
  cellClassName?: string                   // セル専用CSSクラス
  tooltip?: string                         // ツールチップテキスト
  hideOn?: BreakpointKey[]                // 非表示にする画面サイズ
  showOnlyOn?: BreakpointKey[]            // 表示する画面サイズ限定
}

// =============================================================================
// ⚙️ Configuration Types
// =============================================================================

/**
 * ページネーション設定
 * - 詳細な表示オプションとカスタマイズ
 */
export interface PaginationConfig {
  enabled: boolean                         // ページネーション有効化
  pageSize: number                         // 1ページのアイテム数
  pageSizeOptions: number[]                // ページサイズ選択肢
  showSizeChanger: boolean                 // ページサイズ変更UI表示
  showQuickJumper: boolean                 // ページジャンプ機能表示
  showTotal: boolean                       // 総数表示
  position: 'top' | 'bottom' | 'both'     // ページネーション位置
  maxPagesToShow: number                   // 最大ページ番号表示数
  layout: string[]                         // ページネーション要素の配置
}

/**
 * 仮想スクロール設定
 * - 大量データ対応のための設定
 */
export interface VirtualConfig {
  enabled: boolean                         // 仮想スクロール有効化
  itemHeight: number                       // アイテム高さ（px）
  overscan: number                         // 前後の余剰描画数
  threshold: number                        // 有効化閾値（アイテム数）
  dynamicHeight?: boolean                  // 動的高さ対応
  estimatedItemHeight?: number             // 推定アイテム高さ
}

/**
 * レスポンシブ設定
 * - 画面サイズ別の表示制御
 */
export type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

export interface ResponsiveConfig {
  enabled: boolean                         // レスポンシブ有効化
  breakpoints: Record<BreakpointKey, number>  // ブレイクポイント定義（px）
  mobileMode: 'stack' | 'scroll' | 'cards' | 'accordion'  // モバイル表示モード
  hideColumns?: string[]                   // 自動非表示カラムID
  stackOrder?: 'priority' | 'original' | 'reverse'  // スタック時の並び順
  cardTemplate?: string                    // カードモード時のテンプレート
}

/**
 * 外観設定
 * - テーマ、サイズ、視覚効果の詳細制御
 */
export interface AppearanceConfig {
  size: 'small' | 'default' | 'large'     // 基本サイズ
  bordered: boolean                        // 境界線表示
  striped: boolean                         // ストライプ表示
  hoverable: boolean                       // ホバー効果
  theme: 'light' | 'dark' | 'auto'        // カラーテーマ
  density: 'compact' | 'default' | 'comfortable'  // 表示密度
  borderRadius?: number                    // 角丸の半径（px）
  cellPadding?: [number, number]          // セル内余白 [vertical, horizontal]
  headerStyle?: 'default' | 'minimal' | 'bold'  // ヘッダースタイル
  zebraStripe?: boolean                    // 縞模様表示
  shadowLevel?: 0 | 1 | 2 | 3             // 影の深度
}

/**
 * 動作設定
 * - ユーザーインタラクションとデータ操作
 */
export interface BehaviorConfig {
  selectable: boolean                      // 行選択機能
  multiSelect: boolean                     // 複数行選択
  expandable: boolean                      // 行展開機能
  editable: boolean                        // インライン編集
  draggable: boolean                       // 行ドラッグ移動
  clickAction: 'none' | 'select' | 'expand' | 'custom' | 'edit'  // クリック動作
  doubleClickAction?: 'none' | 'edit' | 'expand' | 'custom'  // ダブルクリック動作
  keyboardNavigation: boolean             // キーボードナビゲーション
  autoSave: boolean                       // 自動保存機能
  confirmDelete?: boolean                 // 削除確認ダイアログ
  rowHeight?: 'auto' | 'fixed'           // 行高さモード
  loadingState?: boolean                  // ローディング状態表示
}

// =============================================================================
// 🔧 Integration Types
// =============================================================================

/**
 * BaseSortFilterとの統合設定
 * - 既存のBaseSortFilterコンポーネントとの連携
 */
export interface TableSortFilterConfig {
  globalConfig: SortFilterConfig           // 全体設定
  columnConfigs: Map<string, SortFilterConfig>  // カラム別設定
  itemConfigs: Map<string, SortConfig | FilterConfig>  // 項目別設定
  multiSortEnabled: boolean               // 複数項目ソート有効
  globalFilterEnabled: boolean            // グローバル検索有効
}

/**
 * テーブル用拡張イベント
 * - BaseSortFilterとの連携イベント
 */
export interface TableSortFilterEvents {
  'sort-changed': [columnId: string, itemKey: string, config: SortConfig]
  'filter-changed': [columnId: string, itemKey: string, config: FilterConfig]
  'multi-sort-changed': [configs: Array<{columnId: string, itemKey: string, config: SortConfig}>]
  'global-filter-changed': [config: SortFilterConfig]
  'config-reset': [scope: 'column' | 'item' | 'global', target?: string]
}

// =============================================================================
// 📊 Data Management
// =============================================================================

/**
 * テーブルデータの状態管理
 * - リアクティブなデータ状態の定義
 */
export interface TableDataState {
  originalData: TableItem[]                // 元の生データ
  processedData: TableItem[]               // 処理済みデータ（ソート・フィルタ後）
  displayData: TableItem[]                 // 実際の表示データ（ページング後）
  selectedItems: Set<string | number>      // 選択されたアイテムID
  expandedItems: Set<string | number>      // 展開されたアイテムID
  editingItems: Set<string | number>       // 編集中のアイテムID
  loading: boolean                         // ローディング状態
  error: string | null                     // エラー状態
  lastUpdated: Date | null                 // 最終更新時刻
  totalCount: number                       // 総アイテム数
  filteredCount: number                    // フィルタ後のアイテム数
}

/**
 * データ操作アクション
 * - データCRUD操作のインターフェース
 */
export interface TableDataActions {
  // Data Manipulation
  setData: (data: TableItem[]) => void
  appendData: (data: TableItem[]) => void
  prependData: (data: TableItem[]) => void
  updateItem: (id: string | number, item: Partial<TableItem>) => void
  updateItems: (updates: Array<{id: string | number, item: Partial<TableItem>}>) => void
  removeItems: (ids: (string | number)[]) => void
  
  // Selection Management
  selectItems: (ids: (string | number)[], append?: boolean) => void
  selectAll: (filtered?: boolean) => void
  deselectAll: () => void
  invertSelection: () => void
  
  // Expansion Management
  expandItems: (ids: (string | number)[], expand?: boolean) => void
  expandAll: () => void
  collapseAll: () => void
  
  // Data Lifecycle
  refreshData: () => Promise<void>
  resetData: () => void
  exportData: (format: 'csv' | 'excel' | 'json', options?: ExportOptions) => Promise<void>
}

/**
 * データエクスポート設定
 */
export interface ExportOptions {
  filename?: string                        // ファイル名
  selectedOnly?: boolean                   // 選択項目のみ
  visibleColumnsOnly?: boolean            // 表示カラムのみ
  includeHeaders?: boolean                // ヘッダー含む
  formatters?: Record<string, (value: any) => string>  // 項目別フォーマッタ
  dateFormat?: string                     // 日付フォーマット
  encoding?: 'utf-8' | 'shift-jis'       // 文字エンコーディング
}

// =============================================================================
// 🎯 Main Configuration
// =============================================================================

/**
 * テーブル全体の設定
 * - すべての機能を統合した包括的な設定
 */
export interface TableConfig {
  // Core Configuration
  columns: TableColumn[]                   // カラム設定
  pagination: PaginationConfig             // ページネーション設定
  virtual: VirtualConfig                   // 仮想スクロール設定
  responsive: ResponsiveConfig             // レスポンシブ設定
  appearance: AppearanceConfig             // 外観設定
  behavior: BehaviorConfig                 // 動作設定
  
  // Integration
  sortFilter?: TableSortFilterConfig       // ソート・フィルタ統合設定
  
  // Advanced Features
  presets?: Record<string, Partial<TableConfig>>  // 設定プリセット
  validation?: ValidationConfig           // データ検証設定
  accessibility?: AccessibilityConfig     // アクセシビリティ設定
  performance?: PerformanceConfig         // パフォーマンス設定
}

/**
 * データ検証設定
 */
export interface ValidationConfig {
  enabled: boolean                        // 検証有効化
  validateOnEdit: boolean                 // 編集時検証
  validateOnSave: boolean                 // 保存時検証
  showValidationErrors: boolean           // エラー表示
  validationRules: Record<string, ValidationRule[]>  // フィールド別ルール
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any                             // ルール値
  message: string                         // エラーメッセージ
  validator?: (value: any) => boolean     // カスタム検証関数
}

/**
 * アクセシビリティ設定
 */
export interface AccessibilityConfig {
  enabled: boolean                        // アクセシビリティ機能有効化
  announceChanges: boolean               // 変更のアナウンス
  keyboardNavigation: boolean            // キーボードナビゲーション
  screenReaderSupport: boolean           // スクリーンリーダー対応
  highContrast?: boolean                 // ハイコントラストモード
  reducedMotion?: boolean                // アニメーション軽減
  ariaLabels: Record<string, string>     // ARIAラベル設定
}

/**
 * パフォーマンス設定
 */
export interface PerformanceConfig {
  debounceMs: number                     // デバウンス時間（ms）
  throttleMs: number                     // スロットル時間（ms）
  memoizeResults: boolean                // 結果のメモ化
  lazyLoading: boolean                   // 遅延読み込み
  chunkSize: number                      // チャンク処理サイズ
  maxRenderItems: number                 // 最大描画アイテム数
}

// =============================================================================
// 🔄 Event Types
// =============================================================================

/**
 * テーブルイベント
 * - 全てのテーブル操作に対するイベント定義
 */
export interface TableEvents {
  // Data Events
  'data-loaded': [data: TableItem[]]
  'data-changed': [data: TableItem[]]
  'data-error': [error: Error]
  
  // Selection Events
  'item-selected': [item: TableItem, selected: boolean]
  'selection-changed': [selectedItems: TableItem[]]
  'select-all': [items: TableItem[]]
  
  // Interaction Events
  'item-click': [item: TableItem, event: MouseEvent]
  'item-double-click': [item: TableItem, event: MouseEvent]
  'item-context-menu': [item: TableItem, event: MouseEvent]
  
  // Edit Events
  'edit-start': [item: TableItem, field: string]
  'edit-cancel': [item: TableItem, field: string]
  'edit-save': [item: TableItem, field: string, newValue: any]
  'edit-error': [item: TableItem, field: string, error: Error]
  
  // Configuration Events
  'config-changed': [config: Partial<TableConfig>]
  'column-resized': [column: TableColumn, newWidth: number]
  'column-reordered': [from: number, to: number]
  'column-visibility-changed': [column: TableColumn, visible: boolean]
  
  // Navigation Events
  'page-changed': [page: number, pageSize: number]
  'page-size-changed': [pageSize: number]
  
  // Sort & Filter Events (extends BaseSortFilter)
  'sort-changed': [sorts: SortConfig[]]
  'filter-changed': [filters: FilterConfig[]]
  'search-changed': [query: string]
  
  // Advanced Events
  'export-started': [format: string, options: ExportOptions]
  'export-completed': [file: Blob, options: ExportOptions]
  'preset-applied': [presetName: string, config: TableConfig]
}

// =============================================================================
// 🎨 UI Component Props
// =============================================================================

/**
 * BaseTableコンポーネントのProps
 */
export interface BaseTableProps {
  // Core Props
  data: TableItem[]                       // テーブルデータ
  config: TableConfig                     // テーブル設定
  loading?: boolean                       // ローディング状態
  
  // Optional Props
  height?: string | number                // テーブル高さ
  maxHeight?: string | number             // 最大高さ
  stickyHeader?: boolean                 // ヘッダー固定
  stickyFooter?: boolean                 // フッター固定
  
  // Customization
  rowKey?: string | ((item: TableItem) => string | number)  // 行キー取得関数
  emptyText?: string                     // 空データ時のテキスト
  loadingText?: string                   // ローディングテキスト
  errorText?: string                     // エラーテキスト
  
  // Advanced Props
  serverSide?: boolean                   // サーバーサイド処理
  totalItems?: number                    // サーバーサイド時の総数
  remoteSorting?: boolean                // リモートソート
  remoteFiltering?: boolean              // リモートフィルタ
  remotePagination?: boolean             // リモートページネーション
}

/**
 * MultiItemCellコンポーネントのProps
 */
export interface MultiItemCellProps {
  items: TableItemField[]                // セル内の項目リスト
  data: TableItem                        // 行データ
  column: TableColumn                    // カラム設定
  rowIndex: number                       // 行インデックス
  editable?: boolean                     // 編集可能フラグ
  compact?: boolean                      // コンパクト表示
}

/**
 * ColumnConfigコンポーネントのオプション
 */
export interface ColumnConfigOptions {
  searchable?: boolean                   // カラム検索機能
  reorderable?: boolean                  // カラム並び替え機能
  resizable?: boolean                    // カラムリサイズ機能
  showStats?: boolean                    // カラム統計情報表示
  maxPagesToShow?: number               // 表示する最大ページ数
}

/**
 * カラム統計情報
 */
export interface ColumnStats {
  count: number                         // データ数
  unique?: number                       // ユニーク数
  nullCount?: number                   // NULL値数
  avgLength?: number                   // 平均文字数
}

/**
 * テーブル設定インターフェース
 */
export interface TableSettings {
  // Display Settings
  size: 'compact' | 'default' | 'comfortable'
  rowHeight: number
  borderStyle: 'none' | 'horizontal' | 'vertical' | 'all'
  zebraStripes: boolean
  hoverEffect: boolean
  stickyHeader: boolean
  showColumnLines: boolean
  resizableColumns: boolean

  // Performance Settings
  virtualScrolling: boolean
  bufferSize: number
  lazyLoading: boolean
  searchDebounce: number
  cacheEnabled: boolean

  // Export Settings
  defaultExportFormat: 'csv' | 'excel' | 'json' | 'pdf'
  includeHeaders: boolean
  includeFilters: boolean
  includeHiddenColumns: boolean
  csvDelimiter: string
  filenameTemplate: string

  // Accessibility Settings
  highContrast: boolean
  reducedMotion: boolean
  screenReaderOptimized: boolean
  enhancedKeyboardNav: boolean
  focusStyle: 'default' | 'enhanced' | 'thick' | 'colorful'
}

/**
 * テーブルプリセットインターフェース
 */
export interface TablePreset {
  id: string                            // プリセット一意識別子
  name: string                          // プリセット名
  description?: string                  // 説明
  category: 'system' | 'user' | 'team'  // カテゴリ
  isDefault: boolean                    // デフォルトプリセットフラグ
  shared: boolean                       // 共有フラグ
  createdAt: string                     // 作成日時
  modifiedAt?: string                   // 更新日時
  usageCount?: number                   // 使用回数
  config: {                             // 保存された設定
    columns?: TableColumn[]             // カラム設定
    filters?: Record<string, any>       // フィルタ設定
    sortConfig?: SortConfig             // ソート設定
    settings?: TableSettings            // 表示設定
    pagination?: PaginationConfig       // ページネーション設定
  }
}

// =============================================================================
// 📱 Responsive Utilities
// =============================================================================

/**
 * レスポンシブユーティリティ型
 */
export type ResponsiveValue<T> = T | Partial<Record<BreakpointKey, T>>

/**
 * ブレイクポイント条件
 */
export interface BreakpointCondition {
  min?: number                           // 最小幅
  max?: number                           // 最大幅
  orientation?: 'portrait' | 'landscape' // 画面向き
}

// =============================================================================
// 🚀 Export All Types
// =============================================================================

// BaseSortFilterからインポートする型（再エクスポート）
export type {
  SortConfig,
  FilterConfig,
  SortFilterConfig,
  FilterOperator
} from '../../BaseSortFilter/types'