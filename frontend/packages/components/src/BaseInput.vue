<template>
  <div class="input-field">
    <label v-if="label" :for="inputId" class="input-field__label">
      {{ label }}
      <span v-if="required" class="input-field__required">*</span>
    </label>
    
    <div class="input-field__wrapper">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      <span v-if="$slots.suffix" class="input-field__suffix">
        <slot name="suffix" />
      </span>
    </div>
    
    <div v-if="errorMessage || helperText" class="input-field__message">
      <span v-if="errorMessage" class="input-field__error">{{ errorMessage }}</span>
      <span v-else-if="helperText" class="input-field__helper">{{ helperText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  errorMessage?: string
  helperText?: string
  size?: 'small' | 'medium' | 'large'
}

interface Emits {
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  size: 'medium'
})

const emit = defineEmits<Emits>()

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => [
  'input-field__input',
  `input-field__input--${props.size}`,
  {
    'input-field__input--error': props.errorMessage,
    'input-field__input--disabled': props.disabled,
    'input-field__input--readonly': props.readonly
  }
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<style scoped>
.input-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-field__label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.input-field__required {
  color: #ef4444;
}

.input-field__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field__input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background-color: white;
  font-size: 1rem;
  color: #374151;
  transition: all 0.2s ease-in-out;
  outline: none;
}

.input-field__input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field__input::placeholder {
  color: #9ca3af;
}

/* サイズ */
.input-field__input--small {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.input-field__input--medium {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.input-field__input--large {
  padding: 0.75rem 1.25rem;
  font-size: 1.125rem;
}

/* 状態 */
.input-field__input--error {
  border-color: #ef4444;
}

.input-field__input--error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-field__input--disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
}

.input-field__input--readonly {
  background-color: #f9fafb;
  cursor: default;
}

.input-field__suffix {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  color: #6b7280;
}

.input-field__message {
  font-size: 0.875rem;
  line-height: 1.25;
}

.input-field__error {
  color: #ef4444;
}

.input-field__helper {
  color: #6b7280;
}
</style>