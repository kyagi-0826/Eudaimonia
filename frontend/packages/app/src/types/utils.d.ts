declare module 'utils' {
  // 型ガード関数
  export function isString(value: unknown): value is string
  export function isNumber(value: unknown): value is number
  export function isBoolean(value: unknown): value is boolean
  export function isArray(value: unknown): value is unknown[]
  export function isObject(value: unknown): value is Record<string, unknown>
  export function isFunction(value: unknown): value is Function
  export function isUndefined(value: unknown): value is undefined
  export function isNull(value: unknown): value is null
  export function isDate(value: unknown): value is Date
  export function isRegExp(value: unknown): value is RegExp
  export function isEmpty(value: unknown): boolean
  export function isNotEmpty(value: unknown): boolean

  // バリデーション関数
  export function isRequired(value: unknown): boolean
  export function isEmail(value: string): boolean
  export function isURL(value: string): boolean
  export function isPhoneNumber(value: string): boolean
  export function isMinLength(value: string, min: number): boolean
  export function isMaxLength(value: string, max: number): boolean
  export function isNumeric(value: string): boolean
  export function isAlpha(value: string): boolean
  export function isAlphaNumeric(value: string): boolean

  // ヘルパー関数
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void
  export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void
  export function deepClone<T>(obj: T): T
  export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T
  export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>
  export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>
  export function capitalize(str: string): string
  export function camelCase(str: string): string
  export function kebabCase(str: string): string
  export function snakeCase(str: string): string
  export function truncate(str: string, length: number, suffix?: string): string
  export function slugify(str: string): string
  export function randomString(length: number): string
  export function randomNumber(min: number, max: number): number
  export function uuid(): string
  export function formatBytes(bytes: number, decimals?: number): string
  export function formatNumber(num: number, locale?: string): string

  // 日付ユーティリティ
  export function formatDate(date: Date | string, format?: string): string
  export function parseDate(dateString: string): Date
  export function addDays(date: Date, days: number): Date
  export function addMonths(date: Date, months: number): Date
  export function addYears(date: Date, years: number): Date
  export function startOfDay(date: Date): Date
  export function endOfDay(date: Date): Date
  export function startOfWeek(date: Date): Date
  export function endOfWeek(date: Date): Date
  export function startOfMonth(date: Date): Date
  export function endOfMonth(date: Date): Date
  export function isSameDay(date1: Date, date2: Date): boolean
  export function isSameWeek(date1: Date, date2: Date): boolean
  export function isSameMonth(date1: Date, date2: Date): boolean
  export function isSameYear(date1: Date, date2: Date): boolean
  export function isToday(date: Date): boolean
  export function isYesterday(date: Date): boolean
  export function isTomorrow(date: Date): boolean
  export function isWeekend(date: Date): boolean
  export function isLeapYear(year: number): boolean
  export function getDaysInMonth(year: number, month: number): number
  export function getWeekNumber(date: Date): number
  export function timeAgo(date: Date): string
  export function duration(start: Date, end: Date): string
}