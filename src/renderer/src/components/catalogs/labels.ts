import type { MaterialCategory } from '../../../../shared/schemas'

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  steel: 'Сталь',
  stainless: 'Нержавіюча сталь',
  aluminum: 'Алюміній',
  cast_iron: 'Чавун',
  copper: 'Мідь / сплави',
  titanium: 'Титан',
  plastic: 'Пластик',
  other: 'Інше'
}

export const MATERIAL_CATEGORIES = Object.keys(MATERIAL_CATEGORY_LABELS) as MaterialCategory[]
