---
name: skill-vue-typescript-patterns
description: Справочник TypeScript-паттернов для Vue 3 / Nuxt 3 — типизация props, emits, slots, composables, Pinia stores
---

# Vue TypeScript Patterns

## Назначение

Справочник TypeScript-паттернов для Vue 3 / Nuxt 3. Охватывает типизацию props, emits, slots, composables, Pinia stores и utility types. Используется как reference при написании типизированного Vue-кода.

---

## Самопроверка при подключении

При подключении вывести:

```
**Vue TypeScript Patterns подключён**

Ключевые принципы:
- Props: defineProps<T>() с interface, не type
- Emits: defineEmits<T>() с call signatures
- Composables: явная типизация return type
- Generics: <script setup lang="ts" generic="T">
```

---

## Типизация Props

### Базовая типизация

```vue
<script setup lang="ts">
// Предпочтительно: interface с defineProps<T>()
interface Props {
  title: string
  count?: number
  items: string[]
  status: 'active' | 'inactive' | 'pending'
}

const props = defineProps<Props>()
</script>
```

### Props с default values

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  variant?: 'primary' | 'secondary'
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  variant: 'primary'
})
</script>
```

### Props с валидацией (runtime)

```vue
<script setup lang="ts">
// Когда нужна runtime-валидация
const props = defineProps({
  email: {
    type: String,
    required: true,
    validator: (value: string) => value.includes('@')
  },
  age: {
    type: Number,
    default: 18,
    validator: (value: number) => value >= 0 && value <= 120
  }
})
</script>
```

### Complex props types

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

interface Props {
  user: User
  users: User[]
  userMap: Record<string, User>
  callback: (user: User) => void
  asyncCallback: (id: number) => Promise<User>
}

const props = defineProps<Props>()
</script>
```

---

## Типизация Emits

### Type-based declaration (рекомендуется)

```vue
<script setup lang="ts">
// Call signatures — самый строгий способ
interface Emits {
  (e: 'update', id: number): void
  (e: 'delete', id: number, confirm: boolean): void
  (e: 'submit', payload: { title: string; content: string }): void
}

const emit = defineEmits<Emits>()

// Использование
emit('update', 123)
emit('delete', 123, true)
emit('submit', { title: 'Hello', content: 'World' })
</script>
```

### Shorthand syntax (Vue 3.3+)

```vue
<script setup lang="ts">
// Более компактный синтаксис
const emit = defineEmits<{
  update: [id: number]
  delete: [id: number, confirm: boolean]
  submit: [payload: { title: string; content: string }]
}>()
</script>
```

### v-model с custom emit

```vue
<script setup lang="ts">
interface Props {
  modelValue: string
  count: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:count': [value: number]
}>()

// Computed для v-model
const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
```

---

## Типизация Slots

### Typed slots

```vue
<script setup lang="ts">
interface Slots {
  default: (props: { message: string }) => any
  header: (props: { title: string; subtitle?: string }) => any
  footer?: () => any
}

defineSlots<Slots>()
</script>

<template>
  <div>
    <header>
      <slot name="header" title="Page Title" subtitle="Subtitle" />
    </header>
    <main>
      <slot :message="currentMessage" />
    </main>
    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>
```

### useSlots с типизацией

```vue
<script setup lang="ts">
import type { Slots } from 'vue'

const slots = useSlots()

// Проверка наличия слота
const hasHeader = computed(() => !!slots.header)
const hasFooter = computed(() => !!slots.footer)
</script>
```

---

## Generic Components

### Базовый generic component

```vue
<script setup lang="ts" generic="T">
interface Props {
  items: T[]
  selected?: T
}

interface Emits {
  (e: 'select', item: T): void
  (e: 'update:selected', item: T): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function selectItem(item: T) {
  emit('select', item)
  emit('update:selected', item)
}
</script>

<template>
  <ul>
    <li
      v-for="(item, index) in items"
      :key="index"
      @click="selectItem(item)"
    >
      <slot :item="item" />
    </li>
  </ul>
</template>
```

### Generic с constraints

```vue
<script setup lang="ts" generic="T extends { id: number; name: string }">
interface Props {
  items: T[]
  selectedId?: number
}

const props = defineProps<Props>()

const selectedItem = computed(() =>
  props.items.find(item => item.id === props.selectedId)
)
</script>
```

### Multiple generics

```vue
<script setup lang="ts" generic="TKey extends string | number, TValue">
interface Props {
  options: Record<TKey, TValue>
  selectedKey?: TKey
}

interface Emits {
  (e: 'select', key: TKey, value: TValue): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
</script>
```

---

## Типизация Composables

### Базовый composable

```ts
// composables/useCounter.ts
interface UseCounterOptions {
  initial?: number
  min?: number
  max?: number
}

interface UseCounterReturn {
  count: Ref<number>
  increment: () => void
  decrement: () => void
  reset: () => void
  isMin: ComputedRef<boolean>
  isMax: ComputedRef<boolean>
}

export function useCounter(options: UseCounterOptions = {}): UseCounterReturn {
  const { initial = 0, min = -Infinity, max = Infinity } = options

  const count = ref(initial)

  const isMin = computed(() => count.value <= min)
  const isMax = computed(() => count.value >= max)

  function increment() {
    if (count.value < max) count.value++
  }

  function decrement() {
    if (count.value > min) count.value--
  }

  function reset() {
    count.value = initial
  }

  return {
    count,
    increment,
    decrement,
    reset,
    isMin,
    isMax
  }
}
```

### Generic composable

```ts
// composables/useSelection.ts
interface UseSelectionOptions<T> {
  items: MaybeRef<T[]>
  initialSelected?: T[]
  keyFn?: (item: T) => string | number
}

interface UseSelectionReturn<T> {
  selected: Ref<T[]>
  isSelected: (item: T) => boolean
  toggle: (item: T) => void
  selectAll: () => void
  deselectAll: () => void
  selectedCount: ComputedRef<number>
}

export function useSelection<T>(
  options: UseSelectionOptions<T>
): UseSelectionReturn<T> {
  const { items, initialSelected = [], keyFn = (item) => JSON.stringify(item) } = options

  const selected = ref<T[]>(initialSelected) as Ref<T[]>

  const selectedKeys = computed(() => new Set(selected.value.map(keyFn)))

  function isSelected(item: T): boolean {
    return selectedKeys.value.has(keyFn(item))
  }

  function toggle(item: T) {
    if (isSelected(item)) {
      selected.value = selected.value.filter(i => keyFn(i) !== keyFn(item))
    } else {
      selected.value = [...selected.value, item]
    }
  }

  function selectAll() {
    selected.value = [...toValue(items)]
  }

  function deselectAll() {
    selected.value = []
  }

  const selectedCount = computed(() => selected.value.length)

  return {
    selected,
    isSelected,
    toggle,
    selectAll,
    deselectAll,
    selectedCount
  }
}
```

### Async composable

```ts
// composables/useFetchData.ts
interface UseFetchDataOptions<T> {
  immediate?: boolean
  transform?: (data: unknown) => T
}

interface UseFetchDataReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  pending: Ref<boolean>
  execute: () => Promise<void>
  refresh: () => Promise<void>
}

export function useFetchData<T>(
  url: MaybeRef<string>,
  options: UseFetchDataOptions<T> = {}
): UseFetchDataReturn<T> {
  const { immediate = true, transform } = options

  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const pending = ref(false)

  async function execute() {
    pending.value = true
    error.value = null

    try {
      const response = await fetch(toValue(url))
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const json = await response.json()
      data.value = transform ? transform(json) : json
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      pending.value = false
    }
  }

  if (immediate) {
    execute()
  }

  // Watch URL changes
  if (isRef(url)) {
    watch(url, execute)
  }

  return {
    data,
    error,
    pending,
    execute,
    refresh: execute
  }
}
```

---

## Типизация Pinia Stores

### Options API store

```ts
// stores/user.ts
import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

interface UserState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    user: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    isAdmin: (state): boolean => state.user?.role === 'admin',
    userName: (state): string => state.user?.name ?? 'Guest'
  },

  actions: {
    async login(email: string, password: string): Promise<void> {
      this.loading = true
      try {
        const user = await authService.login(email, password)
        this.user = user
        this.isAuthenticated = true
      } finally {
        this.loading = false
      }
    },

    logout(): void {
      this.user = null
      this.isAuthenticated = false
    }
  }
})
```

### Setup store (Composition API)

```ts
// stores/cart.ts
import { defineStore } from 'pinia'

interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const loading = ref(false)

  // Getters
  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  // Actions
  function addItem(product: { id: number; name: string; price: number }) {
    const existing = items.value.find(item => item.productId === product.id)
    if (existing) {
      existing.quantity++
    } else {
      items.value.push({
        id: Date.now(),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      })
    }
  }

  function removeItem(itemId: number) {
    const index = items.value.findIndex(item => item.id === itemId)
    if (index !== -1) {
      items.value.splice(index, 1)
    }
  }

  function updateQuantity(itemId: number, quantity: number) {
    const item = items.value.find(item => item.id === itemId)
    if (item) {
      item.quantity = Math.max(0, quantity)
      if (item.quantity === 0) {
        removeItem(itemId)
      }
    }
  }

  function clear() {
    items.value = []
  }

  return {
    // State
    items,
    loading,
    // Getters
    totalItems,
    totalPrice,
    isEmpty,
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clear
  }
})

// Type export для использования вне компонентов
export type CartStore = ReturnType<typeof useCartStore>
```

### Store с persist и plugins

```ts
// stores/settings.ts
import { defineStore } from 'pinia'
import type { PiniaPluginContext } from 'pinia'

interface Settings {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: boolean
}

export const useSettingsStore = defineStore('settings', {
  state: (): Settings => ({
    theme: 'system',
    language: 'ru',
    notifications: true
  }),

  actions: {
    setTheme(theme: Settings['theme']) {
      this.theme = theme
    },
    setLanguage(language: string) {
      this.language = language
    }
  },

  // pinia-plugin-persistedstate
  persist: {
    key: 'app-settings',
    storage: localStorage,
    pick: ['theme', 'language']
  }
})
```

---

## Utility Types для Vue

### MaybeRef / MaybeRefOrGetter

```ts
import type { MaybeRef, MaybeRefOrGetter } from 'vue'

// Принимает и ref, и обычное значение
function useTitle(title: MaybeRef<string>) {
  const titleRef = toRef(title)

  watchEffect(() => {
    document.title = titleRef.value
  })
}

// Принимает ref, значение или getter
function useMediaQuery(query: MaybeRefOrGetter<string>) {
  const matches = ref(false)

  watchEffect(() => {
    const mediaQuery = window.matchMedia(toValue(query))
    matches.value = mediaQuery.matches
  })

  return matches
}
```

### ComponentPublicInstance

```ts
import type { ComponentPublicInstance } from 'vue'

// Типизация template ref для компонента
const formRef = ref<ComponentPublicInstance<typeof MyForm> | null>(null)

// Типизация template ref для элемента
const inputRef = ref<HTMLInputElement | null>(null)

// Exposed methods
interface FormExposed {
  validate: () => Promise<boolean>
  reset: () => void
}

const formRef = ref<ComponentPublicInstance & FormExposed | null>(null)

async function submitForm() {
  if (await formRef.value?.validate()) {
    // submit
  }
}
```

### ExtractPropTypes

```ts
import type { ExtractPropTypes, PropType } from 'vue'

const buttonProps = {
  variant: {
    type: String as PropType<'primary' | 'secondary' | 'danger'>,
    default: 'primary'
  },
  size: {
    type: String as PropType<'sm' | 'md' | 'lg'>,
    default: 'md'
  },
  disabled: Boolean
}

// Извлечение типа props
type ButtonProps = ExtractPropTypes<typeof buttonProps>
// { variant: 'primary' | 'secondary' | 'danger', size: 'sm' | 'md' | 'lg', disabled: boolean }
```

### Custom utility types

```ts
// types/vue-utils.ts

// Превращает props interface в тип с опциональными свойствами
type OptionalProps<T> = {
  [K in keyof T]?: T[K]
}

// Извлекает payload type из emit
type EmitPayload<T, E extends keyof T> = T[E] extends (e: E, ...args: infer P) => void
  ? P
  : never

// Типизированный provide/inject
interface InjectionKey<T> extends Symbol {}

function createInjectionKey<T>(description: string): InjectionKey<T> {
  return Symbol(description) as InjectionKey<T>
}

// Использование
const userKey = createInjectionKey<User>('user')
provide(userKey, currentUser)
const user = inject(userKey) // User | undefined
```

---

## Типизация provide/inject

### Typed injection keys

```ts
// injection-keys.ts
import type { InjectionKey, Ref } from 'vue'

interface Theme {
  primary: string
  secondary: string
  mode: 'light' | 'dark'
}

interface AppConfig {
  apiUrl: string
  version: string
}

export const themeKey: InjectionKey<Ref<Theme>> = Symbol('theme')
export const configKey: InjectionKey<AppConfig> = Symbol('config')
export const toastKey: InjectionKey<{
  show: (message: string) => void
  error: (message: string) => void
}> = Symbol('toast')
```

### Provider component

```vue
<!-- App.vue -->
<script setup lang="ts">
import { themeKey, configKey } from './injection-keys'

const theme = ref<Theme>({
  primary: '#3b82f6',
  secondary: '#6b7280',
  mode: 'light'
})

const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
  version: '1.0.0'
}

provide(themeKey, theme)
provide(configKey, config)
</script>
```

### Consumer component

```vue
<script setup lang="ts">
import { themeKey, configKey } from './injection-keys'

// С default value
const theme = inject(themeKey, ref({
  primary: '#000',
  secondary: '#666',
  mode: 'light' as const
}))

// Без default — может быть undefined
const config = inject(configKey)
if (!config) {
  throw new Error('Config not provided')
}

// Non-null assertion (когда уверен что provide есть)
const requiredConfig = inject(configKey)!
</script>
```

---

## Паттерны типизации

### Discriminated unions для props

```vue
<script setup lang="ts">
// Кнопка может быть либо link, либо button
type ButtonProps = {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
} & (
  | { as: 'a'; href: string; target?: '_blank' | '_self' }
  | { as?: 'button'; type?: 'button' | 'submit' | 'reset' }
)

const props = defineProps<ButtonProps>()
</script>

<template>
  <a v-if="props.as === 'a'" :href="props.href" :target="props.target">
    <slot />
  </a>
  <button v-else :type="props.type ?? 'button'">
    <slot />
  </button>
</template>
```

### Conditional props

```vue
<script setup lang="ts">
// Если loading=true, то loadingText обязателен
type Props = {
  title: string
} & (
  | { loading: true; loadingText: string }
  | { loading?: false; loadingText?: never }
)

const props = defineProps<Props>()
</script>
```

### Строгая типизация событий

```ts
// types/events.ts
interface AppEvents {
  'user:login': { userId: number; timestamp: Date }
  'user:logout': { userId: number }
  'cart:add': { productId: number; quantity: number }
  'cart:remove': { productId: number }
}

// composables/useEventBus.ts
import mitt from 'mitt'

const emitter = mitt<AppEvents>()

export function useEventBus() {
  return {
    emit: emitter.emit,
    on: emitter.on,
    off: emitter.off
  }
}

// Использование
const { emit, on } = useEventBus()
emit('user:login', { userId: 123, timestamp: new Date() })
on('cart:add', (payload) => {
  // payload типизирован как { productId: number; quantity: number }
})
```

---

## Правила

### Выбор синтаксиса

- ВСЕГДА использовать `<script setup lang="ts">` для компонентов
- ЕСЛИ нужны generics → `<script setup lang="ts" generic="T">`
- ЕСЛИ нужна runtime-валидация → defineProps с объектом вместо type-based

### Props

- ВСЕГДА использовать `interface` для props, не `type`
- ЕСЛИ есть defaults → использовать `withDefaults()`
- НИКОГДА не мутировать props напрямую

### Emits

- ВСЕГДА использовать call signatures или shorthand syntax
- ВСЕГДА типизировать payload для каждого события
- ЕСЛИ v-model → именовать `update:modelValue`

### Composables

- ВСЕГДА явно типизировать return type
- ВСЕГДА экспортировать interface для options и return type
- ЕСЛИ generic → указывать constraints где возможно

### Stores

- ПРЕДПОЧИТАТЬ setup stores (Composition API) для сложной логики
- ВСЕГДА экспортировать type store: `type MyStore = ReturnType<typeof useMyStore>`
- НИКОГДА не обращаться к store вне setup() без проверки

---

## Примеры

### Пример 1: Типизированный модальный компонент

**Задача:** Создать типизированный Modal с slots, emits и expose.

**Решение:**

```vue
<!-- components/Modal.vue -->
<script setup lang="ts">
interface Props {
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
}

interface Slots {
  default: () => any
  header?: (props: { title: string; close: () => void }) => any
  footer?: () => any
}

interface Emits {
  (e: 'close'): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

interface Exposed {
  open: () => void
  close: () => void
  isOpen: Ref<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true
})

defineSlots<Slots>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
  emit('close')
}

// Expose methods
defineExpose<Exposed>({
  open,
  close,
  isOpen
})
</script>
```

**Использование:**

```vue
<script setup lang="ts">
const modalRef = ref<InstanceType<typeof Modal> | null>(null)

function showModal() {
  modalRef.value?.open()
}
</script>

<template>
  <Modal ref="modalRef" title="Confirm Action">
    <p>Are you sure?</p>
    <template #footer>
      <button @click="modalRef?.close()">Cancel</button>
      <button @click="onConfirm">Confirm</button>
    </template>
  </Modal>
</template>
```

### Пример 2: Generic DataTable

**Задача:** Создать типизированную таблицу с сортировкой.

**Решение:**

```vue
<!-- components/DataTable.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
interface Column<TRow> {
  key: keyof TRow & string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: TRow[keyof TRow], row: TRow) => string
}

interface Props {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyText?: string
}

interface Emits {
  (e: 'sort', key: keyof T & string, direction: 'asc' | 'desc'): void
  (e: 'row-click', row: T, index: number): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  emptyText: 'No data'
})

const emit = defineEmits<Emits>()

const sortKey = ref<keyof T & string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function handleSort(column: Column<T>) {
  if (!column.sortable) return

  if (sortKey.value === column.key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column.key
    sortDir.value = 'asc'
  }

  emit('sort', column.key, sortDir.value)
}
</script>

<template>
  <table>
    <thead>
      <tr>
        <th
          v-for="column in columns"
          :key="column.key"
          :style="{ width: column.width }"
          @click="handleSort(column)"
        >
          {{ column.label }}
          <span v-if="column.sortable && sortKey === column.key">
            {{ sortDir === 'asc' ? '↑' : '↓' }}
          </span>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="loading">
        <td :colspan="columns.length">Loading...</td>
      </tr>
      <tr v-else-if="data.length === 0">
        <td :colspan="columns.length">{{ emptyText }}</td>
      </tr>
      <tr
        v-else
        v-for="(row, index) in data"
        :key="index"
        @click="emit('row-click', row, index)"
      >
        <td v-for="column in columns" :key="column.key">
          {{ column.render ? column.render(row[column.key], row) : row[column.key] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

**Использование:**

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

const columns: Column<User>[] = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString()
  }
]

const users = ref<User[]>([])

function handleSort(key: keyof User, direction: 'asc' | 'desc') {
  // Sort logic
}

function handleRowClick(user: User, index: number) {
  navigateTo(`/users/${user.id}`)
}
</script>

<template>
  <DataTable
    :data="users"
    :columns="columns"
    @sort="handleSort"
    @row-click="handleRowClick"
  />
</template>
```

---

## Что НЕ входит в scope

- Общие TypeScript-паттерны (не специфичные для Vue)
- Типизация API-ответов (см. skill-strapi-api-integration)
- Настройка TypeScript (tsconfig.json)
- Тестирование типов
- Миграция с JavaScript на TypeScript
