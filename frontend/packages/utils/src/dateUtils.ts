/**
 * 日付を指定されたフォーマットで文字列に変換する関数
 * @param date - フォーマットする日付
 * @param format - フォーマット文字列（例: 'YYYY-MM-DD', 'YYYY/MM/DD HH:mm:ss'）
 * @returns フォーマットされた日付文字列
 */
export function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 日付文字列をDateオブジェクトに変換する関数
 * @param dateString - 日付文字列
 * @returns Dateオブジェクト
 */
export function parseDate(dateString: string): Date | null {
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

/**
 * 2つの日付の差を日数で計算する関数
 * @param date1 - 日付1
 * @param date2 - 日付2
 * @returns 日数の差
 */
export function daysDifference(date1: Date, date2: Date): number {
  const timeDiff = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
}

/**
 * 指定された日数を日付に加算する関数
 * @param date - 基準日
 * @param days - 加算する日数
 * @returns 新しい日付
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * 指定された月数を日付に加算する関数
 * @param date - 基準日
 * @param months - 加算する月数
 * @returns 新しい日付
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * 指定された年数を日付に加算する関数
 * @param date - 基準日
 * @param years - 加算する年数
 * @returns 新しい日付
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

/**
 * 日付が今日かどうかを判定する関数
 * @param date - 判定する日付
 * @returns 今日かどうか
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * 日付が週末（土日）かどうかを判定する関数
 * @param date - 判定する日付
 * @returns 週末かどうか
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // 0: 日曜日, 6: 土曜日
}

/**
 * 月の最初の日を取得する関数
 * @param date - 基準日
 * @returns 月の最初の日
 */
export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * 月の最後の日を取得する関数
 * @param date - 基準日
 * @returns 月の最後の日
 */
export function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

/**
 * 年の最初の日を取得する関数
 * @param date - 基準日
 * @returns 年の最初の日
 */
export function getStartOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1)
}

/**
 * 年の最後の日を取得する関数
 * @param date - 基準日
 * @returns 年の最後の日
 */
export function getEndOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31)
}

/**
 * 日付の年齢を計算する関数
 * @param birthDate - 生年月日
 * @param referenceDate - 基準日（デフォルト: 今日）
 * @returns 年齢
 */
export function calculateAge(birthDate: Date, referenceDate: Date = new Date()): number {
  let age = referenceDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

/**
 * 相対的な時間を人間に読みやすい形式で返す関数
 * @param date - 基準となる日付
 * @param referenceDate - 比較する日付（デフォルト: 今日）
 * @returns 相対的な時間の文字列
 */
export function getRelativeTime(date: Date, referenceDate: Date = new Date()): string {
  const diffInMilliseconds = referenceDate.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)
  
  if (diffInSeconds < 60) {
    return diffInSeconds <= 0 ? '今' : `${diffInSeconds}秒前`
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`
  } else if (diffInHours < 24) {
    return `${diffInHours}時間前`
  } else if (diffInDays < 7) {
    return `${diffInDays}日前`
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks}週間前`
  } else if (diffInMonths < 12) {
    return `${diffInMonths}ヶ月前`
  } else {
    return `${diffInYears}年前`
  }
}

/**
 * 指定された月の日数を取得する関数
 * @param year - 年
 * @param month - 月（1-12）
 * @returns その月の日数
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * うるう年かどうかを判定する関数
 * @param year - 年
 * @returns うるう年かどうか
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}