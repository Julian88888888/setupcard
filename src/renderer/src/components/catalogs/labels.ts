import type { MaterialCategory } from '../../../../shared/schemas'

/**
 * Українські назви груп ISO 513 (заготовка / застосування пластин).
 * P також покриває мартенситні/феритні нержавіючі; M — переважно аустеніт/дуплекс.
 * N — незалізні метали та пластики/композити.
 */
export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  P: 'Сталь',
  M: 'Нержавіюча сталь',
  K: 'Чавун',
  N: 'Кольорові метали / пластики',
  S: 'Жароміцні сплави / титан',
  H: 'Загартовані матеріали'
}

/** Кольори як на упаковці пластин */
export const MATERIAL_CATEGORY_DEFAULT_COLORS: Record<MaterialCategory, string> = {
  P: '#1E5AA8',
  M: '#E8B923',
  K: '#C62828',
  N: '#2E7D32',
  S: '#8D4E2A',
  H: '#424242'
}

/** Темний текст на світлому фоні (жовтий M) */
export const MATERIAL_CATEGORY_TEXT_ON_COLOR: Record<MaterialCategory, string> = {
  P: '#FFFFFF',
  M: '#1A1A1A',
  K: '#FFFFFF',
  N: '#FFFFFF',
  S: '#FFFFFF',
  H: '#FFFFFF'
}

export const MATERIAL_CATEGORIES = Object.keys(MATERIAL_CATEGORY_LABELS) as MaterialCategory[]

export function materialGroupTitle(category: MaterialCategory): string {
  return `${category} — ${MATERIAL_CATEGORY_LABELS[category]}`
}
