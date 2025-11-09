// BaseSortFilter パッケージ用型定義

// ソートの設定
export interface SortConfig {
  key: string                     // ソート対象のキー
  direction: 'asc' | 'desc' | null // ソート方向
  label?: string                  // 表示ラベル
  type?: 'text' | 'number' | 'date' | 'boolean'  // データ型
}

// 絞り込みの設定
export interface FilterConfig {
  key: string                     // 絞り込み対象のキー
  label?: string                  // 表示ラベル
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  operator: FilterOperator        // 演算子
  value: any                      // 絞り込み値
  enabled: boolean               // 有効/無効
}

// 絞り込み演算子
export type FilterOperator = 
  | 'equals'          // 等しい
  | 'contains'        // 含む
  | 'startsWith'      // で始まる
  | 'endsWith'        // で終わる
  | 'greaterThan'     // より大きい
  | 'lessThan'        // より小さい
  | 'between'         // 範囲
  | 'in'              // いずれかに一致

// ソート+絞り込み統合設定
export interface SortFilterConfig {
  sorts: SortConfig[]             // ソート設定配列
  filters: FilterConfig[]         // 絞り込み設定配列
  multiSort: boolean             // 複数列ソート有効
  multiFilter: boolean           // 複数条件絞り込み有効
  filterLogic: 'AND' | 'OR'      // 絞り込み条件の論理演算
}

// コンポーネント共通Props
export interface BaseSortFilterProps {
  data: any[]                    // 対象データ
  disabled?: boolean             // 無効化
  size?: 'small' | 'medium' | 'large'  // サイズ
  theme?: 'light' | 'dark'       // テーマ
}

// ソートコンポーネントProps
export interface SortProps extends BaseSortFilterProps {
  config: SortConfig             // ソート設定
}

// 絞り込みコンポーネントProps  
export interface FilterProps extends BaseSortFilterProps {
  config: FilterConfig           // 絞り込み設定
}

// 統合コンポーネントProps
export interface SortFilterProps extends BaseSortFilterProps {
  config: SortFilterConfig       // 統合設定
}

// コンポーネントEmits
export interface SortEmits {
  'sort-changed': [data: any[], config: SortConfig]
  'update:data': [data: any[]]
  'update:config': [config: SortConfig]
}

export interface FilterEmits {
  'filter-changed': [data: any[], config: FilterConfig]
  'update:data': [data: any[]]
  'update:config': [config: FilterConfig]
}

export interface SortFilterEmits {
  'data-changed': [data: any[], config: SortFilterConfig]
  'update:data': [data: any[]]
  'update:config': [config: SortFilterConfig]
}