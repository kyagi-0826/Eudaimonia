<template>
  <div class="sort-icon" :class="iconClasses">
    <svg 
      class="w-4 h-4" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path v-if="direction === 'asc'" 
        d="M7 14l5-5 5 5z"
      />
      <path v-else-if="direction === 'desc'" 
        d="M7 10l5 5 5-5z"
      />
      <path v-else 
        d="M7 14l5-5 5 5zM7 10l5 5 5-5z" 
        opacity="0.3"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  direction: 'asc' | 'desc' | null
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false
})

const iconClasses = computed(() => [
  'transition-colors duration-200',
  {
    'text-blue-600': props.active && props.direction !== null,
    'text-gray-400': !props.active || props.direction === null,
    'rotate-180': props.direction === 'desc'
  }
])
</script>

<style scoped>
.sort-icon {
  @apply flex items-center justify-center;
}
</style>