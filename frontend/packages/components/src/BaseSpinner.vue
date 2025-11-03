<template>
  <div :class="spinnerClasses">
    <div v-if="type === 'circular'" class="spinner__circular">
      <svg
        :width="size"
        :height="size"
        viewBox="0 0 50 50"
        class="spinner__svg"
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          :stroke="color"
          stroke-width="4"
          stroke-linecap="round"
          stroke-dasharray="80"
          stroke-dashoffset="60"
          class="spinner__circle"
        />
      </svg>
    </div>

    <div v-else-if="type === 'dots'" class="spinner__dots">
      <div 
        v-for="i in 3" 
        :key="i" 
        class="spinner__dot"
        :style="{ backgroundColor: color, animationDelay: `${(i - 1) * 0.15}s` }"
      />
    </div>

    <div v-else-if="type === 'pulse'" class="spinner__pulse">
      <div 
        class="spinner__pulse-ring"
        :style="{ borderColor: color }"
      />
    </div>

    <div v-if="text" class="spinner__text">
      {{ text }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'circular' | 'dots' | 'pulse'
  size?: number | string
  color?: string
  text?: string
  center?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'circular',
  size: 40,
  color: '#3b82f6',
  center: false
})

const spinnerClasses = computed(() => [
  'spinner',
  {
    'spinner--center': props.center
  }
])

const size = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size
})
</script>

<style scoped>
.spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.spinner--center {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

/* Circular Spinner */
.spinner__svg {
  animation: rotate 2s linear infinite;
}

.spinner__circle {
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 100, 200;
    stroke-dashoffset: -15;
  }
  100% {
    stroke-dasharray: 100, 200;
    stroke-dashoffset: -125;
  }
}

/* Dots Spinner */
.spinner__dots {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.spinner__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pulse Spinner */
.spinner__pulse {
  position: relative;
  width: v-bind(size);
  height: v-bind(size);
}

.spinner__pulse-ring {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px solid transparent;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

/* Text */
.spinner__text {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}
</style>