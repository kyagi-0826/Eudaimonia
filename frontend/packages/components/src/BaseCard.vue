<template>
  <div :class="cardClasses">
    <header v-if="$slots.header || title" class="card__header">
      <slot name="header">
        <h3 class="card__title">{{ title }}</h3>
        <p v-if="subtitle" class="card__subtitle">{{ subtitle }}</p>
      </slot>
    </header>

    <div class="card__body">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  shadow?: 'none' | 'small' | 'medium' | 'large'
  border?: boolean
  hoverable?: boolean
  padding?: 'none' | 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'medium',
  border: true,
  hoverable: false,
  padding: 'medium'
})

// Vue 3.3+のスロット型定義
const slots = defineSlots<{
  default(props: {}): any
  header?(props: {}): any
  footer?(props: {}): any
}>()

const cardClasses = computed(() => [
  'card',
  `card--shadow-${props.shadow}`,
  `card--padding-${props.padding}`,
  {
    'card--border': props.border,
    'card--hoverable': props.hoverable
  }
])
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
  overflow: hidden;
}

/* シャドウ */
.card--shadow-none {
  box-shadow: none;
}

.card--shadow-small {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

.card--shadow-medium {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card--shadow-large {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* ボーダー */
.card--border {
  border: 1px solid #e1e5e9;
}

/* ホバー効果 */
.card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* パディング */
.card--padding-none .card__body {
  padding: 0;
}

.card--padding-small .card__body {
  padding: 1rem;
}

.card--padding-medium .card__body {
  padding: 1.5rem;
}

.card--padding-large .card__body {
  padding: 2rem;
}

/* ヘッダー */
.card__header {
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 1.5rem;
}

.card--padding-small .card__header {
  padding: 1rem 1rem 0;
  margin-bottom: 1rem;
}

.card--padding-large .card__header {
  padding: 2rem 2rem 0;
  margin-bottom: 2rem;
}

.card__title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.card__subtitle {
  margin: 0;
  font-size: 0.875rem;
  color: #6c757d;
  line-height: 1.5;
}

/* フッター */
.card__footer {
  padding: 0 1.5rem 1.5rem;
  border-top: 1px solid #f0f0f0;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
}

.card--padding-small .card__footer {
  padding: 0 1rem 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
}

.card--padding-large .card__footer {
  padding: 0 2rem 2rem;
  margin-top: 2rem;
  padding-top: 2rem;
}

/* パディングなしの場合のヘッダー・フッター調整 */
.card--padding-none .card__header {
  padding: 1.5rem;
  margin-bottom: 0;
}

.card--padding-none .card__footer {
  padding: 1.5rem;
  margin-top: 0;
}
</style>