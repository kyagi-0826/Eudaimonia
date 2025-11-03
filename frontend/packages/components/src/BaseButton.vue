<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="loading-spinner">⏳</span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  outlined?: boolean
  block?: boolean
}

interface Emits {
  click: [event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  type: 'button',
  outlined: false,
  block: false
})

const emit = defineEmits<Emits>()

const buttonClasses = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.size}`,
  {
    'btn--outlined': props.outlined,
    'btn--loading': props.loading,
    'btn--disabled': props.disabled,
    'btn--block': props.block
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid transparent;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-family: inherit;
  outline: none;
  position: relative;
}

.btn:focus-visible {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* サイズ */
.btn--small {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.btn--medium {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  line-height: 1.5;
}

.btn--large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
  line-height: 1.5;
}

/* カラーバリエーション */
.btn--primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.btn--primary:hover:not(.btn--disabled):not(.btn--loading) {
  background-color: #0056b3;
  border-color: #004085;
}

.btn--secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn--secondary:hover:not(.btn--disabled):not(.btn--loading) {
  background-color: #545b62;
  border-color: #4e555b;
}

.btn--success {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.btn--success:hover:not(.btn--disabled):not(.btn--loading) {
  background-color: #1e7e34;
  border-color: #1c7430;
}

.btn--danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn--danger:hover:not(.btn--disabled):not(.btn--loading) {
  background-color: #c82333;
  border-color: #bd2130;
}

.btn--warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
}

.btn--warning:hover:not(.btn--disabled):not(.btn--loading) {
  background-color: #e0a800;
  border-color: #d39e00;
}

/* アウトライン */
.btn--outlined {
  background-color: transparent;
}

.btn--outlined.btn--primary {
  color: #007bff;
}

.btn--outlined.btn--primary:hover:not(.btn--disabled):not(.btn--loading) {
  background-color: #007bff;
  color: white;
}

.btn--outlined.btn--secondary {
  color: #6c757d;
}

.btn--outlined.btn--secondary:hover:not(.btn--disabled):not(.btn--loading) {
  background-color: #6c757d;
  color: white;
}

.btn--outlined.btn--success {
  color: #28a745;
}

.btn--outlined.btn--success:hover:not(.btn--disabled):not(.btn--loading) {
  background-color: #28a745;
  color: white;
}

.btn--outlined.btn--danger {
  color: #dc3545;
}

.btn--outlined.btn--danger:hover:not(.btn--disabled):not(.btn--loading) {
  background-color: #dc3545;
  color: white;
}

.btn--outlined.btn--warning {
  color: #ffc107;
}

.btn--outlined.btn--warning:hover:not(.btn--disabled):not(.btn--loading) {
  background-color: #ffc107;
  color: #212529;
}

/* ブロック */
.btn--block {
  width: 100%;
  display: flex;
}

/* 状態 */
.btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn--loading {
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>