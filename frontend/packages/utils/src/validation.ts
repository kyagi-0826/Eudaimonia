import { isString, isNumber, isEmail, isUrl, isNumeric } from './typeGuards'

/**
 * バリデーション結果の型定義
 */
export interface ValidationResult {
  isValid: boolean
  message?: string
}

/**
 * 必須チェックを行う関数
 * @param value - チェックする値
 * @param fieldName - フィールド名
 * @returns ValidationResult
 */
export function validateRequired(value: unknown, fieldName = 'フィールド'): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return {
      isValid: false,
      message: `${fieldName}は必須です`
    }
  }
  return { isValid: true }
}

/**
 * 文字列の最小長チェックを行う関数
 * @param value - チェックする値
 * @param minLength - 最小長
 * @param fieldName - フィールド名
 * @returns ValidationResult
 */
export function validateMinLength(
  value: unknown, 
  minLength: number, 
  fieldName = 'フィールド'
): ValidationResult {
  if (!isString(value)) {
    return {
      isValid: false,
      message: `${fieldName}は文字列である必要があります`
    }
  }
  
  if (value.length < minLength) {
    return {
      isValid: false,
      message: `${fieldName}は${minLength}文字以上である必要があります`
    }
  }
  
  return { isValid: true }
}

/**
 * 文字列の最大長チェックを行う関数
 * @param value - チェックする値
 * @param maxLength - 最大長
 * @param fieldName - フィールド名
 * @returns ValidationResult
 */
export function validateMaxLength(
  value: unknown, 
  maxLength: number, 
  fieldName = 'フィールド'
): ValidationResult {
  if (!isString(value)) {
    return {
      isValid: false,
      message: `${fieldName}は文字列である必要があります`
    }
  }
  
  if (value.length > maxLength) {
    return {
      isValid: false,
      message: `${fieldName}は${maxLength}文字以下である必要があります`
    }
  }
  
  return { isValid: true }
}

/**
 * 数値の範囲チェックを行う関数
 * @param value - チェックする値
 * @param min - 最小値
 * @param max - 最大値
 * @param fieldName - フィールド名
 * @returns ValidationResult
 */
export function validateRange(
  value: unknown, 
  min: number, 
  max: number, 
  fieldName = 'フィールド'
): ValidationResult {
  if (!isNumber(value) && !isNumeric(value)) {
    return {
      isValid: false,
      message: `${fieldName}は数値である必要があります`
    }
  }
  
  const numValue = typeof value === 'string' ? Number(value) : value as number
  
  if (numValue < min || numValue > max) {
    return {
      isValid: false,
      message: `${fieldName}は${min}から${max}の間である必要があります`
    }
  }
  
  return { isValid: true }
}

/**
 * Emailアドレスのバリデーションを行う関数
 * @param value - チェックする値
 * @param fieldName - フィールド名
 * @returns ValidationResult
 */
export function validateEmail(value: unknown, fieldName = 'メールアドレス'): ValidationResult {
  if (!isString(value)) {
    return {
      isValid: false,
      message: `${fieldName}は文字列である必要があります`
    }
  }
  
  if (!isEmail(value)) {
    return {
      isValid: false,
      message: `${fieldName}の形式が正しくありません`
    }
  }
  
  return { isValid: true }
}

/**
 * URLのバリデーションを行う関数
 * @param value - チェックする値
 * @param fieldName - フィールド名
 * @returns ValidationResult
 */
export function validateUrl(value: unknown, fieldName = 'URL'): ValidationResult {
  if (!isString(value)) {
    return {
      isValid: false,
      message: `${fieldName}は文字列である必要があります`
    }
  }
  
  if (!isUrl(value)) {
    return {
      isValid: false,
      message: `${fieldName}の形式が正しくありません`
    }
  }
  
  return { isValid: true }
}

/**
 * 正規表現パターンマッチングのバリデーションを行う関数
 * @param value - チェックする値
 * @param pattern - 正規表現パターン
 * @param fieldName - フィールド名
 * @param errorMessage - エラーメッセージ
 * @returns ValidationResult
 */
export function validatePattern(
  value: unknown, 
  pattern: RegExp, 
  fieldName = 'フィールド',
  errorMessage?: string
): ValidationResult {
  if (!isString(value)) {
    return {
      isValid: false,
      message: `${fieldName}は文字列である必要があります`
    }
  }
  
  if (!pattern.test(value)) {
    return {
      isValid: false,
      message: errorMessage || `${fieldName}の形式が正しくありません`
    }
  }
  
  return { isValid: true }
}

/**
 * パスワードの強度チェックを行う関数
 * @param value - チェックする値
 * @param fieldName - フィールド名
 * @returns ValidationResult
 */
export function validatePassword(value: unknown, fieldName = 'パスワード'): ValidationResult {
  if (!isString(value)) {
    return {
      isValid: false,
      message: `${fieldName}は文字列である必要があります`
    }
  }
  
  // 最低8文字
  if (value.length < 8) {
    return {
      isValid: false,
      message: `${fieldName}は8文字以上である必要があります`
    }
  }
  
  // 英数字を含む
  if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
    return {
      isValid: false,
      message: `${fieldName}は英字と数字を含む必要があります`
    }
  }
  
  return { isValid: true }
}

/**
 * 複数のバリデーション関数を組み合わせて実行する関数
 * @param value - チェックする値
 * @param validators - バリデーション関数の配列
 * @returns ValidationResult
 */
export function validateMultiple(
  value: unknown, 
  validators: Array<(value: unknown) => ValidationResult>
): ValidationResult {
  for (const validator of validators) {
    const result = validator(value)
    if (!result.isValid) {
      return result
    }
  }
  return { isValid: true }
}

/**
 * オブジェクトの複数フィールドを一括でバリデーションする関数
 * @param obj - バリデーション対象のオブジェクト
 * @param rules - バリデーションルール
 * @returns フィールド名をキーとしたValidationResultのマップ
 */
export function validateObject<T extends Record<string, unknown>>(
  obj: T,
  rules: Partial<Record<keyof T, (value: unknown) => ValidationResult>>
): Record<keyof T, ValidationResult> {
  const results = {} as Record<keyof T, ValidationResult>
  
  for (const [field, validator] of Object.entries(rules)) {
    if (validator) {
      results[field as keyof T] = validator(obj[field as keyof T])
    }
  }
  
  return results
}