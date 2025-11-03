/**
 * 値が文字列かどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 値が数値かどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 値が真偽値かどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 値がnullかどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is null
 */
export function isNull(value: unknown): value is null {
  return value === null
}

/**
 * 値がundefinedかどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is undefined
 */
export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

/**
 * 値がnullまたはundefinedかどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is null | undefined
 */
export function isNullish(value: unknown): value is null | undefined {
  return value == null
}

/**
 * 値がオブジェクトかどうかをチェックする型ガード関数（nullを除く）
 * @param value - チェックする値
 * @returns value is Record<string, unknown>
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 値が配列かどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is unknown[]
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

/**
 * 値が関数かどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is Function
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

/**
 * 値がDateオブジェクトかどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is Date
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime())
}

/**
 * 値がRegExpオブジェクトかどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is RegExp
 */
export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp
}

/**
 * 値がErrorオブジェクトかどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

/**
 * 値がPromiseかどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @returns value is Promise<unknown>
 */
export function isPromise(value: unknown): value is Promise<unknown> {
  return value instanceof Promise || 
    (isObject(value) && isFunction((value as any).then))
}

/**
 * 値が空の文字列かどうかをチェックする関数
 * @param value - チェックする値
 * @returns boolean
 */
export function isEmpty(value: unknown): boolean {
  if (isString(value)) return value.length === 0
  if (isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return isNullish(value)
}

/**
 * 値が空でないかどうかをチェックする関数
 * @param value - チェックする値
 * @returns boolean
 */
export function isNotEmpty(value: unknown): boolean {
  return !isEmpty(value)
}

/**
 * 値が有効な数値（文字列を含む）かどうかをチェックする関数
 * @param value - チェックする値
 * @returns boolean
 */
export function isNumeric(value: unknown): boolean {
  if (isNumber(value)) return true
  if (isString(value)) {
    return !isNaN(Number(value)) && !isNaN(parseFloat(value))
  }
  return false
}

/**
 * 値が有効なEmailアドレスかどうかをチェックする関数
 * @param value - チェックする値
 * @returns boolean
 */
export function isEmail(value: unknown): boolean {
  if (!isString(value)) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value)
}

/**
 * 値が有効なURLかどうかをチェックする関数
 * @param value - チェックする値
 * @returns boolean
 */
export function isUrl(value: unknown): boolean {
  if (!isString(value)) return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

/**
 * 値が指定した型のオブジェクトかどうかをチェックする型ガード関数
 * @param value - チェックする値
 * @param keys - チェックするキーの配列
 * @returns boolean
 */
export function hasKeys<T extends string>(
  value: unknown, 
  keys: readonly T[]
): value is Record<T, unknown> {
  if (!isObject(value)) return false
  return keys.every(key => key in value)
}

/**
 * 配列の全要素が指定した型かどうかをチェックする型ガード関数
 * @param value - チェックする配列
 * @param guard - 型ガード関数
 * @returns boolean
 */
export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T
): value is T[] {
  return isArray(value) && value.every(guard)
}