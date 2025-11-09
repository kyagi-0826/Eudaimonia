/**
 * @fileoverview useTableData Composable
 * @description テーブルデータの包括的状態管理
 * 🔥 高機能データ管理：リアクティブデータ、CRUD操作、選択、展開、エラー処理
 */

import { ref, reactive, computed, toRefs, watch, nextTick } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { 
  TableItem, 
  TableDataState, 
  TableDataActions,
  ExportOptions 
} from '../types'

// =============================================================================
// 🎯 Interface Definitions
// =============================================================================

export interface UseTableDataOptions {
  lazy?: boolean                           // 遅延読み込み
  transform?: (data: any[]) => TableItem[] // データ変換関数
  persistSelection?: boolean               // 選択状態の永続化
  validateData?: (data: TableItem[]) => boolean  // データ検証
  autoRefresh?: number                     // 自動更新間隔（ms）
  batchSize?: number                       // バッチ処理サイズ
  enableUndo?: boolean                     // アンドゥ機能
}

export interface UseTableDataReturn {
  // 🔄 Reactive State
  state: {
    data: Ref<TableItem[]>
    originalData: Ref<TableItem[]>
    processedData: Ref<TableItem[]>
    loading: Ref<boolean>
    error: Ref<string | null>
    selectedItems: Ref<Set<string | number>>
    expandedItems: Ref<Set<string | number>>
    editingItems: Ref<Set<string | number>>
    lastUpdated: Ref<Date | null>
  }

  // 📊 Computed Properties
  computed: {
    totalItems: ComputedRef<number>
    hasData: ComputedRef<boolean>
    isEmpty: ComputedRef<boolean>
    selectedCount: ComputedRef<number>
    selectedData: ComputedRef<TableItem[]>
    isAllSelected: ComputedRef<boolean>
    isPartiallySelected: ComputedRef<boolean>
  }

  // ⚡ Actions
  actions: TableDataActions & {
    // Selection Management
    selectAll: (filtered?: boolean) => void
    deselectAll: () => void
    invertSelection: () => void
    selectRange: (startId: string | number, endId: string | number) => void
    
    // Expansion Management
    expandAll: () => void
    collapseAll: () => void
    
    // Edit Management
    startEdit: (id: string | number) => void
    cancelEdit: (id: string | number) => void
    saveEdit: (id: string | number, data: Partial<TableItem>) => Promise<void>
    
    // Advanced Operations
    duplicateItem: (id: string | number) => void
    moveItems: (fromIndex: number, toIndex: number, count?: number) => void
    batchUpdate: (updates: Array<{id: string | number, data: Partial<TableItem>}>) => Promise<void>
    
    // History (Undo/Redo)
    undo: () => void
    redo: () => void
    canUndo: ComputedRef<boolean>
    canRedo: ComputedRef<boolean>
  }
}

// =============================================================================
// 📚 History Management
// =============================================================================

interface HistoryEntry {
  timestamp: Date
  action: string
  data: TableItem[]
  metadata?: any
}

class TableHistory {
  private history: HistoryEntry[] = []
  private currentIndex = -1
  private readonly maxSize = 50

  push(action: string, data: TableItem[], metadata?: any) {
    // Remove any entries after current index
    this.history = this.history.slice(0, this.currentIndex + 1)
    
    // Add new entry
    this.history.push({
      timestamp: new Date(),
      action,
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      metadata
    })

    // Limit size
    if (this.history.length > this.maxSize) {
      this.history.shift()
    } else {
      this.currentIndex++
    }
  }

  undo(): TableItem[] | null {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return JSON.parse(JSON.stringify(this.history[this.currentIndex].data))
    }
    return null
  }

  redo(): TableItem[] | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      return JSON.parse(JSON.stringify(this.history[this.currentIndex].data))
    }
    return null
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  clear() {
    this.history = []
    this.currentIndex = -1
  }
}

// =============================================================================
// 🚀 Main Composable
// =============================================================================

export function useTableData(
  initialData: TableItem[] = [],
  options: UseTableDataOptions = {}
): UseTableDataReturn {
  
  const {
    lazy = false,
    transform,
    persistSelection = false,
    validateData,
    autoRefresh,
    batchSize = 100,
    enableUndo = true
  } = options

  // =============================================================================
  // 📊 Reactive State
  // =============================================================================

  const state = reactive<TableDataState>({
    originalData: [...initialData],
    processedData: [...initialData],
    displayData: [...initialData],
    selectedItems: new Set<string | number>(),
    expandedItems: new Set<string | number>(),
    editingItems: new Set<string | number>(),
    loading: false,
    error: null,
    lastUpdated: null,
    totalCount: initialData.length,
    filteredCount: initialData.length
  })

  // Data refs (for external binding)
  const data = ref<TableItem[]>([...initialData])
  const originalData = ref<TableItem[]>([...initialData])
  const processedData = ref<TableItem[]>([...initialData])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedItems = ref<Set<string | number>>(new Set())
  const expandedItems = ref<Set<string | number>>(new Set())
  const editingItems = ref<Set<string | number>>(new Set())
  const lastUpdated = ref<Date | null>(null)

  // History management
  const history = enableUndo ? new TableHistory() : null

  // =============================================================================
  // 🔄 Computed Properties
  // =============================================================================

  const totalItems = computed(() => data.value.length)
  const hasData = computed(() => data.value.length > 0)
  const isEmpty = computed(() => data.value.length === 0)
  const selectedCount = computed(() => selectedItems.value.size)
  
  const selectedData = computed(() => 
    data.value.filter(item => selectedItems.value.has(item.id))
  )

  const isAllSelected = computed(() => 
    hasData.value && selectedItems.value.size === totalItems.value
  )

  const isPartiallySelected = computed(() => 
    selectedItems.value.size > 0 && selectedItems.value.size < totalItems.value
  )

  // History computed
  const canUndo = computed(() => history?.canUndo() ?? false)
  const canRedo = computed(() => history?.canRedo() ?? false)

  // =============================================================================
  // 🛠️ Core Data Operations
  // =============================================================================

  const updateInternalState = (newData: TableItem[], action?: string) => {
    data.value = [...newData]
    processedData.value = [...newData]
    state.processedData = [...newData]
    state.totalCount = newData.length
    state.filteredCount = newData.length
    lastUpdated.value = new Date()
    state.lastUpdated = lastUpdated.value

    // Save to history
    if (history && action) {
      history.push(action, newData)
    }

    // Update error state
    if (error.value) {
      error.value = null
      state.error = null
    }
  }

  const setData = (newData: TableItem[]) => {
    try {
      loading.value = true
      state.loading = true

      // Validation
      if (validateData && !validateData(newData)) {
        throw new Error('データの検証に失敗しました')
      }

      // Transform data if needed
      const transformedData = transform ? transform(newData) : newData

      originalData.value = [...transformedData]
      state.originalData = [...transformedData]
      updateInternalState(transformedData, 'setData')

      console.log(`✅ テーブルデータ設定完了: ${newData.length} items`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'データの設定中にエラーが発生しました'
      error.value = errorMessage
      state.error = errorMessage
      console.error('❌ テーブルデータ設定エラー:', err)
    } finally {
      loading.value = false
      state.loading = false
    }
  }

  const appendData = (newData: TableItem[]) => {
    const currentData = [...data.value]
    const mergedData = [...currentData, ...newData]
    updateInternalState(mergedData, 'appendData')
  }

  const prependData = (newData: TableItem[]) => {
    const currentData = [...data.value]
    const mergedData = [...newData, ...currentData]
    updateInternalState(mergedData, 'prependData')
  }

  const updateItem = (id: string | number, updates: Partial<TableItem>) => {
    const currentData = [...data.value]
    const index = currentData.findIndex(item => item.id === id)
    
    if (index !== -1) {
      currentData[index] = { ...currentData[index], ...updates }
      updateInternalState(currentData, 'updateItem')
    }
  }

  const updateItems = (updates: Array<{id: string | number, item: Partial<TableItem>}>) => {
    const currentData = [...data.value]
    
    updates.forEach(({ id, item }) => {
      const index = currentData.findIndex(dataItem => dataItem.id === id)
      if (index !== -1) {
        currentData[index] = { ...currentData[index], ...item }
      }
    })
    
    updateInternalState(currentData, 'updateItems')
  }

  const removeItems = (ids: (string | number)[]) => {
    const currentData = data.value.filter(item => !ids.includes(item.id))
    updateInternalState(currentData, 'removeItems')
    
    // Remove from selection if selected
    ids.forEach(id => selectedItems.value.delete(id))
  }

  // =============================================================================
  // 🎯 Selection Management
  // =============================================================================

  const selectItems = (ids: (string | number)[], append = false) => {
    if (!append) {
      selectedItems.value.clear()
    }
    
    ids.forEach(id => {
      const exists = data.value.some(item => item.id === id)
      if (exists) {
        selectedItems.value.add(id)
      }
    })

    state.selectedItems = new Set(selectedItems.value)
  }

  const selectAll = (filtered = false) => {
    const targetData = filtered ? processedData.value : data.value
    selectedItems.value = new Set(targetData.map(item => item.id))
    state.selectedItems = new Set(selectedItems.value)
  }

  const deselectAll = () => {
    selectedItems.value.clear()
    state.selectedItems = new Set()
  }

  const invertSelection = () => {
    const allIds = new Set(data.value.map(item => item.id))
    const newSelection = new Set<string | number>()
    
    allIds.forEach(id => {
      if (!selectedItems.value.has(id)) {
        newSelection.add(id)
      }
    })
    
    selectedItems.value = newSelection
    state.selectedItems = new Set(selectedItems.value)
  }

  const selectRange = (startId: string | number, endId: string | number) => {
    const startIndex = data.value.findIndex(item => item.id === startId)
    const endIndex = data.value.findIndex(item => item.id === endId)
    
    if (startIndex !== -1 && endIndex !== -1) {
      const [minIndex, maxIndex] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)]
      
      for (let i = minIndex; i <= maxIndex; i++) {
        selectedItems.value.add(data.value[i].id)
      }
      
      state.selectedItems = new Set(selectedItems.value)
    }
  }

  // =============================================================================
  // 📂 Expansion Management
  // =============================================================================

  const expandItems = (ids: (string | number)[], expand = true) => {
    ids.forEach(id => {
      if (expand) {
        expandedItems.value.add(id)
      } else {
        expandedItems.value.delete(id)
      }
    })
    
    state.expandedItems = new Set(expandedItems.value)
  }

  const expandAll = () => {
    expandedItems.value = new Set(data.value.map(item => item.id))
    state.expandedItems = new Set(expandedItems.value)
  }

  const collapseAll = () => {
    expandedItems.value.clear()
    state.expandedItems = new Set()
  }

  // =============================================================================
  // ✏️ Edit Management
  // =============================================================================

  const startEdit = (id: string | number) => {
    editingItems.value.add(id)
    state.editingItems = new Set(editingItems.value)
  }

  const cancelEdit = (id: string | number) => {
    editingItems.value.delete(id)
    state.editingItems = new Set(editingItems.value)
  }

  const saveEdit = async (id: string | number, newData: Partial<TableItem>) => {
    try {
      updateItem(id, newData)
      editingItems.value.delete(id)
      state.editingItems = new Set(editingItems.value)
    } catch (err) {
      console.error('❌ 保存エラー:', err)
      throw err
    }
  }

  // =============================================================================
  // 🚀 Advanced Operations
  // =============================================================================

  const duplicateItem = (id: string | number) => {
    const item = data.value.find(item => item.id === id)
    if (item) {
      const newItem = { 
        ...item, 
        id: `${item.id}_copy_${Date.now()}`,
      }
      appendData([newItem])
    }
  }

  const moveItems = (fromIndex: number, toIndex: number, count = 1) => {
    const currentData = [...data.value]
    const movedItems = currentData.splice(fromIndex, count)
    currentData.splice(toIndex, 0, ...movedItems)
    updateInternalState(currentData, 'moveItems')
  }

  const batchUpdate = async (updates: Array<{id: string | number, data: Partial<TableItem>}>) => {
    try {
      loading.value = true
      
      // Process in batches
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize)
        updateItems(batch.map(u => ({ id: u.id, item: u.data })))
        
        // Allow UI to update
        await nextTick()
      }
    } finally {
      loading.value = false
    }
  }

  // =============================================================================
  // 🔄 Lifecycle Operations
  // =============================================================================

  const refreshData = async () => {
    // Placeholder for refresh logic
    // This would typically call an external API
    console.log('🔄 データを再読み込みしています...')
    setData([...originalData.value])
  }

  const resetData = () => {
    setData([...originalData.value])
    deselectAll()
    collapseAll()
    editingItems.value.clear()
    
    if (history) {
      history.clear()
    }
  }

  const exportData = async (format: 'csv' | 'excel' | 'json', options: ExportOptions = {}): Promise<void> => {
    const {
      selectedOnly = false,
      visibleColumnsOnly = false,
      includeHeaders = true,
      filename = `table_data_${new Date().toISOString().split('T')[0]}`
    } = options

    const exportDataItems = selectedOnly ? selectedData.value : data.value
    
    // This is a placeholder - actual implementation would depend on export libraries
    console.log(`📊 ${format}形式でエクスポート中:`, {
      itemCount: exportDataItems.length,
      filename,
      options
    })
    
    // Return blob for download
    const blob = new Blob([JSON.stringify(exportDataItems, null, 2)], {
      type: 'application/json'
    })
    
    // Trigger download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.${format === 'json' ? 'json' : 'csv'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // =============================================================================
  // 📚 History Operations
  // =============================================================================

  const undo = () => {
    if (history) {
      const previousData = history.undo()
      if (previousData) {
        data.value = previousData
        processedData.value = [...previousData]
        console.log('↶ アンドゥ実行')
      }
    }
  }

  const redo = () => {
    if (history) {
      const nextData = history.redo()
      if (nextData) {
        data.value = nextData
        processedData.value = [...nextData]
        console.log('↷ リドゥ実行')
      }
    }
  }

  // =============================================================================
  // 🔄 Watchers & Initialization
  // =============================================================================

  // Auto-refresh setup
  let refreshTimer: number | null = null
  if (autoRefresh && autoRefresh > 0) {
    refreshTimer = setInterval(refreshData, autoRefresh)
  }

  // Cleanup function
  const cleanup = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer)
    }
  }

  // =============================================================================
  // 📤 Return Interface
  // =============================================================================

  return {
    // State
    state: {
      data,
      originalData,
      processedData,
      loading,
      error,
      selectedItems,
      expandedItems,
      editingItems,
      lastUpdated
    },

    // Computed
    computed: {
      totalItems,
      hasData,
      isEmpty,
      selectedCount,
      selectedData,
      isAllSelected,
      isPartiallySelected
    },

    // Actions
    actions: {
      // Core data operations
      setData,
      appendData,
      prependData,
      updateItem,
      updateItems,
      removeItems,
      
      // Selection
      selectItems,
      selectAll,
      deselectAll,
      invertSelection,
      selectRange,
      
      // Expansion
      expandItems,
      expandAll,
      collapseAll,
      
      // Editing
      startEdit,
      cancelEdit,
      saveEdit,
      
      // Advanced
      duplicateItem,
      moveItems,
      batchUpdate,
      
      // Lifecycle
      refreshData,
      resetData,
      exportData,
      
      // History
      undo,
      redo,
      canUndo,
      canRedo
    }
  }
}