# 🏗️ BaseTable アーキテクチャ設計書

## 📋 設計概要

BaseSortFilterを核とした、企業レベルのテーブルシステムを構築します。
複数項目表示、動的設定、高パフォーマンスを実現する包括的なソリューションです。

## 🎯 設計目標

1. **🔄 再利用性** - 他のプロジェクトでも使える汎用設計
2. **⚡ パフォーマンス** - 大量データでもサクサク動作
3. **🎨 カスタマイズ性** - 柔軟な見た目とレイアウト調整
4. **♿ アクセシビリティ** - 誰でも使いやすいUI
5. **📱 レスポンシブ** - モバイルからデスクトップまで対応

## 🧩 コンポーネント構成

```
BaseTable/
├── index.ts                    # エクスポート定義
├── types.ts                    # 型定義
├── composables/
│   ├── useTableData.ts         # データ管理
│   ├── useTableConfig.ts       # 設定管理
│   ├── useTablePagination.ts   # ページネーション
│   └── useTableVirtual.ts      # 仮想スクロール
├── components/
│   ├── BaseTable.vue           # メインテーブル
│   ├── TableHeader.vue         # ヘッダー部分
│   ├── TableBody.vue           # ボディ部分
│   ├── TableRow.vue            # データ行
│   ├── MultiItemCell.vue       # 複数項目セル
│   ├── ItemRow.vue             # 項目表示行
│   ├── TablePagination.vue     # ページネーション
│   ├── TableToolbar.vue        # ツールバー
│   ├── ColumnConfig.vue        # カラム設定ツール
│   ├── TableSettings.vue       # テーブル設定
│   └── TablePresets.vue        # プリセット管理
├── utils/
│   ├── columnUtils.ts          # カラム操作
│   ├── dataUtils.ts            # データ操作
│   ├── formatUtils.ts          # フォーマット
│   └── validationUtils.ts      # バリデーション
└── __tests__/
    ├── BaseTable.test.ts
    ├── MultiItemCell.test.ts
    └── integration.test.ts
```

## 📊 データフロー設計

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Raw Data      │───→│   TableData      │───→│  Rendered UI    │
│   (Props)       │    │   (Composable)   │    │   (Template)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        ↕                        │
         │              ┌──────────────────┐               │
         └─────────────→│  BaseSortFilter  │←──────────────┘
                        │   (External)     │
                        └──────────────────┘
                                 ↕
                        ┌──────────────────┐
                        │  TableConfig     │
                        │  (Persistent)    │
                        └──────────────────┘
```

## 🔧 TypeScript型定義

### Core Types

```typescript
// 基本データ型
interface TableItem {
  id: string | number
  [key: string]: any
}

// 項目定義
interface TableItemField {
  key: string                           // データのキー
  label: string                         // 表示ラベル
  type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'url' | 'boolean'
  required?: boolean                    // 必須項目
  sortable?: boolean                    // ソート可能
  filterable?: boolean                  // フィルタ可能
  formatter?: (value: any) => string    // 値のフォーマッタ
  validator?: (value: any) => boolean   // バリデータ
  width?: ColumnWidth                   // 推奨幅
  align?: 'left' | 'center' | 'right'  // 配置
}

// カラム設定
interface TableColumn {
  id: string                            // カラムID
  label: string                         // カラムラベル
  items: TableItemField[]               // このカラムの項目
  visible: boolean                      // 表示/非表示
  width: ColumnWidth                    // カラム幅
  minWidth?: number                     // 最小幅
  maxWidth?: number                     // 最大幅
  resizable: boolean                    // リサイズ可能
  sticky?: 'left' | 'right'            // 固定位置
  sortConfig?: SortConfig               // ソート設定
  filterConfig?: FilterConfig           // フィルタ設定
}

// 幅設定
interface ColumnWidth {
  type: 'fixed' | 'percentage' | 'auto' | 'minmax'
  value?: number                        // 値
  min?: number                          // 最小値 (minmaxの場合)
  max?: number                          // 最大値 (minmaxの場合)
  preset?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto'
}

// テーブル設定
interface TableConfig {
  columns: TableColumn[]                // カラム設定
  pagination: PaginationConfig          // ページネーション
  virtual: VirtualConfig                // 仮想スクロール
  responsive: ResponsiveConfig          // レスポンシブ
  appearance: AppearanceConfig          // 外観設定
  behavior: BehaviorConfig              // 動作設定
}

// ページネーション設定
interface PaginationConfig {
  enabled: boolean                      // 有効/無効
  pageSize: number                      // ページサイズ
  pageSizeOptions: number[]             // サイズ選択肢
  showSizeChanger: boolean              // サイズ変更UI
  showQuickJumper: boolean              // ページジャンプ
  showTotal: boolean                    // 総数表示
  position: 'top' | 'bottom' | 'both'   // 位置
}

// 仮想スクロール設定
interface VirtualConfig {
  enabled: boolean                      // 有効/無効
  itemHeight: number                    // アイテム高さ
  overscan: number                      // オーバースキャン
  threshold: number                     // 有効化閾値
}

// レスポンシブ設定
interface ResponsiveConfig {
  enabled: boolean                      // 有効/無効
  breakpoints: {                        // ブレイクポイント
    xs: number    // ~575px
    sm: number    // 576px~
    md: number    // 768px~
    lg: number    // 992px~
    xl: number    // 1200px~
  }
  mobileMode: 'stack' | 'scroll' | 'cards'  // モバイル表示モード
  hideColumns?: string[]                // 非表示カラム (画面サイズ別)
}

// 外観設定
interface AppearanceConfig {
  size: 'small' | 'default' | 'large'  // サイズ
  bordered: boolean                     // 境界線
  striped: boolean                      // ストライプ
  hoverable: boolean                    // ホバー効果
  theme: 'light' | 'dark' | 'auto'     // テーマ
  density: 'compact' | 'default' | 'comfortable'  // 密度
}

// 動作設定
interface BehaviorConfig {
  selectable: boolean                   // 行選択
  multiSelect: boolean                  // 複数選択
  expandable: boolean                   // 行展開
  editable: boolean                     // インライン編集
  draggable: boolean                    // 行ドラッグ
  clickAction: 'none' | 'select' | 'expand' | 'custom'  // クリック動作
}
```

### BaseSortFilter Integration

```typescript
// ソート・フィルタ統合設定
interface TableSortFilterConfig {
  globalConfig: SortFilterConfig        // 全体設定
  columnConfigs: Map<string, SortFilterConfig>  // カラム別設定
  itemConfigs: Map<string, SortConfig | FilterConfig>  // 項目別設定
}

// テーブル用拡張イベント
interface TableSortFilterEvents {
  'sort-changed': [columnId: string, itemKey: string, config: SortConfig]
  'filter-changed': [columnId: string, itemKey: string, config: FilterConfig]
  'multi-sort-changed': [configs: Array<{columnId: string, itemKey: string, config: SortConfig}>]
  'global-filter-changed': [config: SortFilterConfig]
  'config-reset': [scope: 'column' | 'item' | 'global', target?: string]
}
```

### Data Management

```typescript
// テーブルデータ状態
interface TableDataState {
  originalData: TableItem[]             // 元データ
  processedData: TableItem[]            // 処理済みデータ
  displayData: TableItem[]              // 表示データ
  selectedItems: Set<string | number>   // 選択アイテム
  expandedItems: Set<string | number>   // 展開アイテム
  loading: boolean                      // ローディング状態
  error: string | null                  // エラー状態
}

// データ操作アクション
interface TableDataActions {
  setData: (data: TableItem[]) => void
  appendData: (data: TableItem[]) => void
  updateItem: (id: string | number, item: Partial<TableItem>) => void
  removeItems: (ids: (string | number)[]) => void
  selectItems: (ids: (string | number)[], append?: boolean) => void
  expandItems: (ids: (string | number)[], expand?: boolean) => void
  refreshData: () => Promise<void>
  resetData: () => void
}
```

## 🎨 UI/UX設計

### Layout Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│ TableToolbar                                                │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ 🔍 Filter│ │ ⚙️ Config│ │ 📊 Export│ │ ➕ Action│ │ 🔄 Reload│ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────┤
│ TableHeader                                                 │
│ ┌─────────────────┬─────────────────┬─────────────────────┐ │
│ │ Column 1        │ Column 2        │ Column 3            │ │
│ │ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────────┐ │ │
│ │ │ Item A  🔍📊│ │ │ Item C  🔍📊│ │ │ Item E      🔍📊│ │ │
│ │ │ Item B  🔍📊│ │ │ Item D  🔍📊│ │ │ Item F      🔍📊│ │ │
│ │ └─────────────┘ │ └─────────────┘ │ └─────────────────┘ │ │
│ └─────────────────┴─────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ TableBody                                                   │
│ ┌─────────────────┬─────────────────┬─────────────────────┐ │
│ │ Value A1        │ Value C1        │ Value E1            │ │
│ │ Value B1        │ Value D1        │ Value F1            │ │
│ ├─────────────────┼─────────────────┼─────────────────────┤ │
│ │ Value A2        │ Value C2        │ Value E2            │ │
│ │ Value B2        │ Value D2        │ Value F2            │ │
│ │ ...             │ ...             │ ...                 │ │
│ └─────────────────┴─────────────────┴─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ TablePagination                                             │
│ Total: 1,234 items │ [ ← ] 1 2 [3] 4 5 [ → ] │ 50 / page │ │
└─────────────────────────────────────────────────────────────┘
```

### MultiItemCell Design

```
┌─────────────────────────────────────┐
│ MultiItemCell                       │
│ ┌─────────────────────────────────┐ │
│ │ ItemRow (Primary)               │ │
│ │ 📅 Meeting Date    🔍 📊        │ │
│ │ 2024-11-15                      │ │
│ │─────────────────────────────────│ │
│ │ ItemRow (Secondary)             │ │
│ │ 🏢 Company Name    🔍 📊        │ │
│ │ ジャスミン食品株式会社            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Responsive Breakpoints

```typescript
const responsiveBreakpoints = {
  xs: '0px',          // Mobile (縦向き)
  sm: '576px',        // Mobile (横向き)  
  md: '768px',        // Tablet
  lg: '992px',        // Desktop (小)
  xl: '1200px',       // Desktop (大)
  xxl: '1600px'       // Desktop (超大)
}

// ブレイクポイント別のカラム表示制御
const columnVisibility = {
  xs: 1,              // 1カラムのみ (カード表示)
  sm: 2,              // 2カラムまで
  md: 3,              // 3カラムまで
  lg: 4,              // 4カラムまで
  xl: 6,              // 制限なし
  xxl: 8              // 制限なし
}
```

## ⚡ パフォーマンス戦略

### Virtual Scrolling

```typescript
// 仮想スクロール実装
interface VirtualScrollConfig {
  itemHeight: number              // 固定アイテム高さ
  containerHeight: number         // コンテナ高さ
  overscan: number               // 前後の余剰描画数
  threshold: number              // 有効化閾値
  dynamic: boolean               // 動的高さ対応
}

const useVirtualScroll = (
  items: Ref<any[]>,
  config: VirtualScrollConfig
) => {
  const visibleItems = computed(() => {
    // 可視範囲のアイテムのみ計算
    return calculateVisibleItems(items.value, config)
  })
  
  const scrollStyle = computed(() => {
    // スクロール位置の調整
    return calculateScrollStyle(visibleItems.value)
  })
  
  return { visibleItems, scrollStyle }
}
```

### Data Optimization

```typescript
// メモ化によるパフォーマンス最適化
const optimizedData = computed(() => {
  // 重い処理はメモ化
  return memoize(processTableData)(
    props.data,
    sortConfig.value,
    filterConfig.value
  )
})

// 分割読み込み
const loadDataChunks = async (
  page: number,
  pageSize: number
) => {
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  return await dataLoader.loadChunk(startIndex, endIndex)
}
```

### Bundle Optimization

```typescript
// 動的インポートによる分割
const TableSettings = defineAsyncComponent(
  () => import('./components/TableSettings.vue')
)

const ColumnConfig = defineAsyncComponent(
  () => import('./components/ColumnConfig.vue')
)

// 重いライブラリは必要時のみ読み込み
const loadVirtualScrollPlugin = () => {
  return import('@tanstack/vue-virtual')
}
```

## 🔧 Composable Architecture

### useTableData

```typescript
interface UseTableDataReturn {
  // State
  data: Ref<TableItem[]>
  originalData: Ref<TableItem[]>
  processedData: Ref<TableItem[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  
  // Actions
  setData: (data: TableItem[]) => void
  loadData: (source: DataSource) => Promise<void>
  refreshData: () => Promise<void>
  
  // Computed
  totalItems: ComputedRef<number>
  hasData: ComputedRef<boolean>
  isEmpty: ComputedRef<boolean>
}

export const useTableData = (
  initialData?: TableItem[],
  options?: {
    lazy?: boolean
    transform?: (data: any[]) => TableItem[]
  }
): UseTableDataReturn
```

### useTableConfig

```typescript
interface UseTableConfigReturn {
  // State
  config: Ref<TableConfig>
  columns: Ref<TableColumn[]>
  
  // Actions
  updateConfig: (newConfig: Partial<TableConfig>) => void
  resetConfig: () => void
  saveConfig: (name: string) => void
  loadConfig: (name: string) => void
  
  // Column Management
  addColumn: (column: TableColumn) => void
  removeColumn: (columnId: string) => void
  reorderColumns: (fromIndex: number, toIndex: number) => void
  updateColumn: (columnId: string, updates: Partial<TableColumn>) => void
  
  // Computed
  visibleColumns: ComputedRef<TableColumn[]>
  columnCount: ComputedRef<number>
}

export const useTableConfig = (
  initialConfig?: Partial<TableConfig>,
  options?: {
    persist?: boolean
    validateConfig?: (config: TableConfig) => boolean
  }
): UseTableConfigReturn
```

### useTableSelection

```typescript
interface UseTableSelectionReturn {
  // State
  selectedItems: Ref<Set<string | number>>
  lastSelectedItem: Ref<string | number | null>
  
  // Actions
  selectItem: (id: string | number, append?: boolean) => void
  selectItems: (ids: (string | number)[], append?: boolean) => void
  deselectItem: (id: string | number) => void
  toggleSelection: (id: string | number) => void
  selectAll: () => void
  clearSelection: () => void
  selectRange: (startId: string | number, endId: string | number) => void
  
  // Computed
  selectedCount: ComputedRef<number>
  isAllSelected: ComputedRef<boolean>
  isPartiallySelected: ComputedRef<boolean>
  selectedData: ComputedRef<TableItem[]>
}

export const useTableSelection = (
  data: Ref<TableItem[]>,
  options?: {
    multiSelect?: boolean
    selectableKey?: string
  }
): UseTableSelectionReturn
```

## 🎯 Integration Strategy

### BaseSortFilter Integration

```typescript
// BaseTableでBaseSortFilterを使用
const setupSortFilter = () => {
  const sortFilterConfig = computed(() => 
    createTableSortFilterConfig(props.columns)
  )
  
  const handleSortFilterChange = (
    data: TableItem[],
    config: SortFilterConfig
  ) => {
    processedData.value = data
    updateColumnConfigs(config)
  }
  
  return {
    sortFilterConfig,
    handleSortFilterChange
  }
}

// カラム設定からBaseSortFilter設定を生成
const createTableSortFilterConfig = (
  columns: TableColumn[]
): SortFilterConfig => {
  const sorts = columns.flatMap(column => 
    column.items.map(item => createSortConfig(item.key, {
      label: item.label,
      type: item.type
    }))
  )
  
  const filters = columns.flatMap(column =>
    column.items.map(item => createFilterConfig(item.key, item.type, 'contains', {
      label: item.label
    }))
  )
  
  return createSortFilterConfig(sorts, filters, {
    multiSort: true,
    multiFilter: true,
    filterLogic: 'AND'
  })
}
```

## 🚀 Implementation Plan

### Phase 1: Core Foundation (Week 1)
- [ ] 基本型定義の作成
- [ ] useTableData composable
- [ ] useTableConfig composable  
- [ ] BaseTable基本構造
- [ ] MultiItemCell実装

### Phase 2: Advanced Features (Week 2)
- [ ] BaseSortFilter統合
- [ ] レスポンシブ対応
- [ ] 設定ツールUI
- [ ] プリセット機能

### Phase 3: Optimization (Week 3)
- [ ] 仮想スクロール実装
- [ ] パフォーマンス最適化
- [ ] アクセシビリティ対応
- [ ] 包括的テスト

### Phase 4: Documentation & Polish (Week 4)
- [ ] ドキュメント作成
- [ ] デモアプリケーション
- [ ] 最終調整・バグ修正

これで設計は完璧です！次はいよいよ実装に取りかかりましょう 🚀