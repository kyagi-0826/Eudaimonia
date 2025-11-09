<template>
  <div class="filter-icon" :class="iconClasses">
    <svg 
      class="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false
})

const iconClasses = computed(() => [
  'transition-colors duration-200',
  {
    'text-blue-600': props.active,
    'text-gray-500': !props.active
  }
])
</script>

<style scoped>
.filter-icon {
  @apply flex items-center justify-center;
}
</style>