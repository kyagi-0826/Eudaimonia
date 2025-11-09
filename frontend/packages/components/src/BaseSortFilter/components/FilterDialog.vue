<template>
  <div class="filter-dialog-overlay" @click="closeDialog">
    <div 
      class="filter-dialog"
      :class="[
        'bg-white rounded-lg shadow-lg border p-6 min-w-[320px] max-w-md',
        'transform transition-all duration-200 ease-in-out'
      ]"
      @click.stop
    >
      <!-- ヘッダー -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">フィルタ設定</h3>
        <button 
          @click="closeDialog"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      <!-- フィルタ設定フォーム -->
      <div class="space-y-4">
        <!-- 有効/無効切り替え -->
        <label class="flex items-center space-x-3">
          <input
            type="checkbox"
            v-model="localConfig.enabled"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="text-sm text-gray-900">フィルタを有効化</span>
        </label>

        <!-- 演算子選択 -->
        <div v-if="localConfig.enabled">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            条件
          </label>
          <select
            v-model="localConfig.operator"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option 
              v-for="operator in availableOperators" 
              :key="operator.value" 
              :value="operator.value"
            >
              {{ operator.label }}
            </option>
          </select>
        </div>

        <!-- 値入力 -->
        <div v-if="localConfig.enabled">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            値
          </label>
          
          <!-- テキスト入力 -->
          <input
            v-if="inputType === 'text'"
            v-model="localConfig.value"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="検索値を入力"
          >

          <!-- 数値入力 -->
          <input
            v-else-if="inputType === 'number'"
            v-model="localConfig.value"
            type="number"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="数値を入力"
          >

          <!-- 日付入力 -->
          <input
            v-else-if="inputType === 'date'"
            v-model="localConfig.value"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >

          <!-- セレクト入力 -->
          <select
            v-else-if="inputType === 'select'"
            v-model="localConfig.value"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">選択してください</option>
            <option 
              v-for="option in options" 
              :key="option" 
              :value="option"
            >
              {{ option }}
            </option>
          </select>

          <!-- 範囲入力 -->
          <div v-else-if="inputType === 'range'" class="space-y-2">
            <input
              v-model="rangeValues.min"
              :type="localConfig.type === 'date' ? 'date' : 'number'"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="最小値"
            >
            <input
              v-model="rangeValues.max"
              :type="localConfig.type === 'date' ? 'date' : 'number'"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="最大値"
            >
          </div>

          <!-- 複数選択 -->
          <div v-else-if="inputType === 'multiple'" class="space-y-2 max-h-32 overflow-y-auto">
            <label 
              v-for="option in options" 
              :key="option"
              class="flex items-center space-x-2"
            >
              <input
                type="checkbox"
                :value="option"
                v-model="multipleValues"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              >
              <span class="text-sm text-gray-900">{{ option }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- フッター -->
      <div class="flex justify-end space-x-3 mt-6">
        <button
          @click="closeDialog"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          キャンセル
        </button>
        <button
          @click="applyFilter"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          適用
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FilterConfig } from '../types'
import CloseIcon from './CloseIcon.vue'

interface Props {
  config: FilterConfig
  options?: any[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:config': [config: FilterConfig]
  'close': []
  'apply': []
}>()

// ローカル設定
const localConfig = ref<FilterConfig>({ ...props.config })

// 範囲入力用
const rangeValues = ref({ min: '', max: '' })

// 複数選択用
const multipleValues = ref<any[]>([])

// 利用可能な演算子
const availableOperators = computed(() => {
  const operatorMap = {
    text: [
      { value: 'equals', label: '等しい' },
      { value: 'contains', label: '含む' },
      { value: 'startsWith', label: 'で始まる' },
      { value: 'endsWith', label: 'で終わる' }
    ],
    number: [
      { value: 'equals', label: '等しい' },
      { value: 'greaterThan', label: 'より大きい' },
      { value: 'lessThan', label: 'より小さい' },
      { value: 'between', label: '範囲' }
    ],
    date: [
      { value: 'equals', label: '等しい' },
      { value: 'greaterThan', label: 'より後' },
      { value: 'lessThan', label: 'より前' },
      { value: 'between', label: '範囲' }
    ],
    select: [
      { value: 'equals', label: '等しい' },
      { value: 'in', label: 'いずれかに一致' }
    ],
    boolean: [
      { value: 'equals', label: '等しい' }
    ]
  }

  return operatorMap[localConfig.value.type] || operatorMap.text
})

// 入力タイプ
const inputType = computed(() => {
  if (localConfig.value.operator === 'between') return 'range'
  if (localConfig.value.operator === 'in') return 'multiple'
  if (localConfig.value.type === 'select') return 'select'
  return localConfig.value.type
})

// ダイアログ閉じる
const closeDialog = () => {
  emit('close')
}

// フィルタ適用
const applyFilter = () => {
  // 範囲の場合
  if (localConfig.value.operator === 'between') {
    localConfig.value.value = [rangeValues.value.min, rangeValues.value.max]
  }
  
  // 複数選択の場合
  if (localConfig.value.operator === 'in') {
    localConfig.value.value = multipleValues.value
  }

  emit('update:config', localConfig.value)
  emit('apply')
}

// 設定変更を監視
watch(localConfig, (newConfig) => {
  emit('update:config', newConfig)
}, { deep: true })

// 既存の値を初期化
watch(() => props.config, (newConfig) => {
  localConfig.value = { ...newConfig }
  
  // 範囲値の初期化
  if (newConfig.operator === 'between' && Array.isArray(newConfig.value)) {
    rangeValues.value.min = newConfig.value[0] || ''
    rangeValues.value.max = newConfig.value[1] || ''
  }
  
  // 複数選択値の初期化
  if (newConfig.operator === 'in' && Array.isArray(newConfig.value)) {
    multipleValues.value = [...newConfig.value]
  }
}, { immediate: true })
</script>

<style scoped>
.filter-dialog-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.filter-dialog {
  @apply relative z-10;
}
</style>