<template>
  <!-- 固定位置でモーダル表示 -->
  <Transition name="modal">
    <div 
      v-if="modelValue" 
      class="modal-overlay" 
      @click="handleOverlayClick" 
      style="
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background-color: rgba(0, 0, 0, 0.5) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 9999 !important;
        padding: 1rem !important;
      "
    >
      <div
        :class="modalClasses"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @click.stop
        style="
          background: white !important; 
          border-radius: 8px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          display: flex !important;
          flex-direction: column !important;
          max-height: 90vh !important;
          overflow: hidden !important;
        "
      >
        <header v-if="$slots.header || title" class="modal__header">
          <slot name="header">
            <h2 :id="titleId" class="modal__title">{{ title }}</h2>
          </slot>
          <button
            v-if="closable"
            class="modal__close"
            type="button"
            aria-label="閉じる"
            @click="handleClose"
          >
            ✕
          </button>
        </header>

        <div class="modal__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'small' | 'medium' | 'large' | 'fullscreen'
  closable?: boolean
  closeOnOverlay?: boolean
  persistent?: boolean
}

interface Emits {
  'update:modelValue': [value: boolean]
  close: []
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  closable: true,
  closeOnOverlay: true,
  persistent: false
})

const emit = defineEmits<Emits>()

// Vue 3.3+のスロット型定義
const slots = defineSlots<{
  default(props: {}): any
  header?(props: {}): any
  footer?(props: {}): any
}>()

const titleId = ref(`modal-title-${Math.random().toString(36).substr(2, 9)}`)

const modalClasses = computed(() => [
  'modal',
  `modal--${props.size}`
])

const handleClose = () => {
  if (!props.persistent) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    handleClose()
  }
}

// ESCキーでモーダルを閉じる
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    handleClose()
  }
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      document.addEventListener('keydown', handleKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeydown)
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: hidden;
}

/* サイズ */
.modal--small {
  width: 100%;
  max-width: 400px;
}

.modal--medium {
  width: 100%;
  max-width: 600px;
}

.modal--large {
  width: 100%;
  max-width: 800px;
}

.modal--fullscreen {
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  border-radius: 0;
}

.modal__header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.modal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal__close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.modal__close:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.modal__body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal__footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* トランジション */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.9) translateY(-50px);
}

/* レスポンシブ */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
  }
  
  .modal--small,
  .modal--medium,
  .modal--large {
    width: 100vw;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
  }
  
  .modal__header,
  .modal__body,
  .modal__footer {
    padding: 1rem;
  }
}
</style>