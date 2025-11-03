declare module 'components' {
  import type { DefineComponent } from 'vue'
  
  // コンポーネントの型定義
  export const BaseButton: DefineComponent<any, any, any>
  export const BaseCard: DefineComponent<any, any, any>
  export const BaseInput: DefineComponent<any, any, any>
  export const BaseModal: DefineComponent<any, any, any>
  export const BaseSpinner: DefineComponent<any, any, any>
  
  // 型エクスポート
  export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  export type ButtonSize = 'small' | 'medium' | 'large'
  export type CardShadow = 'none' | 'small' | 'medium' | 'large'
  export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen'
  export type SpinnerType = 'circular' | 'dots' | 'pulse'
}