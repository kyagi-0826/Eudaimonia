declare module 'components' {
  import type { Component } from 'vue'
  
  // Props の型定義
  interface BaseButtonProps {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }
  
  interface BaseCardProps {
    title?: string
    subtitle?: string
    shadow?: 'none' | 'small' | 'medium' | 'large'
    border?: boolean
    hoverable?: boolean
    padding?: 'none' | 'small' | 'medium' | 'large'
  }
  
  interface BaseInputProps {
    modelValue?: string | number
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    error?: string
    label?: string
  }
  
  interface BaseModalProps {
    modelValue: boolean
    title?: string
    size?: 'small' | 'medium' | 'large' | 'fullscreen'
    closable?: boolean
    closeOnOverlay?: boolean
    persistent?: boolean
  }
  
  interface BaseSpinnerProps {
    type?: 'circular' | 'dots' | 'pulse'
    size?: 'small' | 'medium' | 'large'
    color?: string
  }
  
  // コンポーネントの型定義 - シンプルなComponent型を使用
  export const BaseButton: Component<BaseButtonProps>
  export const BaseCard: Component<BaseCardProps>
  export const BaseInput: Component<BaseInputProps>
  export const BaseModal: Component<BaseModalProps>
  export const BaseSpinner: Component<BaseSpinnerProps>
  
  // 型エクスポート
  export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  export type ButtonSize = 'small' | 'medium' | 'large'
  export type CardShadow = 'none' | 'small' | 'medium' | 'large'
  export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen'
  export type SpinnerType = 'circular' | 'dots' | 'pulse'
}