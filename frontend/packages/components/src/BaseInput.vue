<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :class="inputClasses"
    @input="handleInput"
    @blur="$emit('blur', $event)"
    @focus="$emit('focus', $event)"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'datetime-local' | 'time'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'error' | 'success'
}

interface Emits {
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  size: 'medium',
  variant: 'default'
})

const emit = defineEmits<Emits>()

// defineModel を使用してv-modelを簡潔に
const modelValue = defineModel<string | number>({ default: '' })

// attrs の継承を無効にする
defineOptions({
  inheritAttrs: false
})

const inputClasses = computed(() => [
  'base-input',
  `base-input--${props.size}`,
  `base-input--${props.variant}`,
  {
    'base-input--disabled': props.disabled,
    'base-input--readonly': props.readonly
  }
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  modelValue.value = value
}
</script>

<style scoped>
.base-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  color: #374151;
  font-family: inherit;
  transition: all 0.2s ease-in-out;
  outline: none;
}

.base-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.base-input::placeholder {
  color: #9ca3af;
}

/* サイズバリエーション */
.base-input--small {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.base-input--medium {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.base-input--large {
  padding: 0.75rem 1.25rem;
  font-size: 1.125rem;
}

/* バリアントバリエーション */
.base-input--default {
  border-color: #d1d5db;
}

.base-input--error {
  border-color: #ef4444;
}

.base-input--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.base-input--success {
  border-color: #10b981;
}

.base-input--success:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* 状態バリエーション */
.base-input--disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.base-input--readonly {
  background-color: #f9fafb;
  cursor: default;
}
</style>