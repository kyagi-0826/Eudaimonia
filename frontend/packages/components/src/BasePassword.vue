<template>
  <div class="base-password">
    <BaseInput
      v-model="modelValue"
      :type="currentInputType"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :size="size"
      :variant="variant"
      :autocomplete="autocomplete"
      :class="{ 'base-password__input--toggleable': toggleable }"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
      v-bind="$attrs"
    />
    <button
      v-if="toggleable"
      type="button"
      class="base-password__toggle"
      :disabled="disabled"
      @click="togglePasswordVisibility"
      :aria-label="isPasswordVisible ? 'パスワードを隠す' : 'パスワードを表示する'"
    >
      <span class="base-password__icon">
        {{ isPasswordVisible ? '🙈' : '👁️' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseInput from './BaseInput.vue'

interface Props {
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'default' | 'error' | 'success'
  toggleable?: boolean
  autocomplete?: 'current-password' | 'new-password' | 'off'
}

interface Emits {
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'パスワードを入力',
  disabled: false,
  readonly: false,
  size: 'medium',
  variant: 'default',
  toggleable: true,
  autocomplete: 'current-password'
})

const emit = defineEmits<Emits>()

// defineModel を使用してv-modelを簡潔に
const modelValue = defineModel<string>({ default: '' })

// attrs の継承を無効にする（BaseInputに直接適用するため）
defineOptions({
  inheritAttrs: false
})

// パスワード表示/非表示の状態
const isPasswordVisible = ref(false)

// リアクティブなinputタイプ
const currentInputType = computed(() => {
  return isPasswordVisible.value ? 'text' : 'password'
})

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
  console.log('Password visibility toggled:', isPasswordVisible.value, 'Type:', currentInputType.value)
}
</script>

<style scoped>
.base-password {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
}

/* BaseInputにトグルボタンのスペースを確保 */
.base-password :deep(.base-input.base-password__input--toggleable) {
  padding-right: 2.5rem !important;
}

.base-password :deep(.base-input.base-password__input--toggleable.base-input--small) {
  padding-right: 2.25rem !important;
}

.base-password :deep(.base-input.base-password__input--toggleable.base-input--large) {
  padding-right: 3rem !important;
}

/* トグルボタン */
.base-password__toggle {
  position: absolute;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s ease-in-out;
  padding: 0.25rem;
  border-radius: 4px;
  z-index: 1;
}

.base-password__toggle:hover:not(:disabled) {
  color: #374151;
  background-color: #f3f4f6;
}

.base-password__toggle:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.base-password__icon {
  font-size: 1rem;
  line-height: 1;
  user-select: none;
}
</style>