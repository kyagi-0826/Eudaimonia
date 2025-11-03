/**
 * 指定されたミリ秒だけ待機するPromiseを返す関数
 * @param ms - 待機時間（ミリ秒）
 * @returns Promise<void>
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 関数の実行を指定時間だけ遅延させるデバウンス関数
 * @param func - 実行する関数
 * @param delay - 遅延時間（ミリ秒）
 * @returns デバウンスされた関数
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * 関数の実行頻度を制限するスロットル関数
 * @param func - 実行する関数
 * @param limit - 実行間隔（ミリ秒）
 * @returns スロットルされた関数
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深いオブジェクトのクローンを作成する関数
 * @param obj - クローンするオブジェクト
 * @returns クローンされたオブジェクト
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as T
  }
  
  const cloned = {} as T
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  
  return cloned
}

/**
 * オブジェクトから指定されたキーを除外する関数
 * @param obj - 元のオブジェクト
 * @param keys - 除外するキーの配列
 * @returns 指定されたキーが除外されたオブジェクト
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

/**
 * オブジェクトから指定されたキーのみを取得する関数
 * @param obj - 元のオブジェクト
 * @param keys - 取得するキーの配列
 * @returns 指定されたキーのみを持つオブジェクト
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * 配列を指定されたサイズのチャンクに分割する関数
 * @param array - 分割する配列
 * @param size - チャンクのサイズ
 * @returns チャンクの配列
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * 配列から重複を除去する関数
 * @param array - 元の配列
 * @returns 重複が除去された配列
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * 配列をランダムにシャッフルする関数
 * @param array - シャッフルする配列
 * @returns シャッフルされた新しい配列
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 指定された範囲の数値配列を生成する関数
 * @param start - 開始値
 * @param end - 終了値
 * @param step - ステップ（デフォルト: 1）
 * @returns 数値配列
 */
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = []
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i)
    }
  } else if (step < 0) {
    for (let i = start; i > end; i += step) {
      result.push(i)
    }
  }
  return result
}

/**
 * ランダムな文字列を生成する関数
 * @param length - 文字列の長さ
 * @param chars - 使用する文字セット
 * @returns ランダムな文字列
 */
export function randomString(
  length: number, 
  chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 文字列をケバブケース（kebab-case）に変換する関数
 * @param str - 変換する文字列
 * @returns ケバブケースの文字列
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
}

/**
 * 文字列をキャメルケース（camelCase）に変換する関数
 * @param str - 変換する文字列
 * @returns キャメルケースの文字列
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^[A-Z]/, c => c.toLowerCase())
}

/**
 * 文字列をパスカルケース（PascalCase）に変換する関数
 * @param str - 変換する文字列
 * @returns パスカルケースの文字列
 */
export function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str)
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1)
}

/**
 * バイト数を人間に読みやすい形式にフォーマットする関数
 * @param bytes - バイト数
 * @param decimals - 小数点以下の桁数（デフォルト: 2）
 * @returns フォーマットされた文字列
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}