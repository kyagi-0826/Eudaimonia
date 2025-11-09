<template>
  <button
    class="filter-button"
    :class="[
      'relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
      sizeClasses,
      buttonClasses
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <!-- フィルタアイコン -->
    <FilterIcon :active="active" />
    
    <!-- ラベル -->
    <span class="text-sm font-medium">フィルタ</span>
    
    <!-- カウントバッジ -->
    <span
      v-if="active && count > 0"
      class="count-badge"
      :class="[
        'px-2 py-1 text-xs font-bold rounded-full',
        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      ]"
    >
      {{ count }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FilterIcon from './FilterIcon.vue'

interface Props {
  active?: boolean
  count?: number
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  count: 0,
  disabled: false,
  size: 'medium'
})

defineEmits<{
  'click': []
}>()

const sizeClasses = computed(() => {
  const sizeMap = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-2',
    large: 'text-base px-4 py-3'
  }
  return sizeMap[props.size]
})

const buttonClasses = computed(() => [
  props.active ? 
    'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' :
    'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
  {
    'opacity-50 cursor-not-allowed': props.disabled,
    'cursor-pointer': !props.disabled
  }
])
</script>

<style scoped>
.filter-button[disabled] {
  @apply pointer-events-none;
}

.count-badge {
  @apply min-w-[20px] text-center;
}
</style>