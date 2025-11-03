// コンポーネントのエクスポート
export { default as BaseButton } from './BaseButton.vue'
export { default as BaseCard } from './BaseCard.vue'
export { default as BaseInput } from './BaseInput.vue'
export { default as BaseModal } from './BaseModal.vue'
export { default as BaseSpinner } from './BaseSpinner.vue'

// 型定義のエクスポート
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
export type ButtonSize = 'small' | 'medium' | 'large'
export type CardShadow = 'none' | 'small' | 'medium' | 'large'
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen'
export type SpinnerType = 'circular' | 'dots' | 'pulse'