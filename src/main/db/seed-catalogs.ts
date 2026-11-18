/**
 * Curated seed lists for materials / workpiece types.
 * Categories follow ISO 513: P M K N S H.
 * Applied once at startup when materials table is empty.
 */

export const ISO_CATEGORY_COLORS: Record<string, string> = {
  P: '#1E5AA8',
  M: '#E8B923',
  K: '#C62828',
  N: '#2E7D32',
  S: '#8D4E2A',
  H: '#424242'
}

export const MATERIAL_SEED: Array<{ name: string; category: string }> = [
  // P — Сталь
  { name: 'Ст3', category: 'P' },
  { name: 'Сталь 20', category: 'P' },
  { name: 'Сталь 45', category: 'P' },
  { name: '40Х', category: 'P' },
  { name: '40ХН', category: 'P' },
  { name: '30ХГСА', category: 'P' },
  { name: '18ХГТ', category: 'P' },
  { name: '20Х', category: 'P' },
  { name: '65Г', category: 'P' },
  { name: 'ШХ15', category: 'P' },
  { name: 'У8А', category: 'P' },
  { name: 'У10А', category: 'P' },
  // M — Нержавіюча сталь
  { name: '12Х18Н10Т', category: 'M' },
  { name: '08Х18Н10', category: 'M' },
  { name: '10Х17Н13М2', category: 'M' },
  { name: '20Х13', category: 'M' },
  { name: '40Х13', category: 'M' },
  // K — Чавун
  { name: 'СЧ15', category: 'K' },
  { name: 'СЧ20', category: 'K' },
  { name: 'СЧ25', category: 'K' },
  { name: 'ВЧ40', category: 'K' },
  { name: 'ВЧ50', category: 'K' },
  // N — Кольорові метали
  { name: 'АД31', category: 'N' },
  { name: 'АМц', category: 'N' },
  { name: 'Д16Т', category: 'N' },
  { name: 'АМг5', category: 'N' },
  { name: 'АМг6', category: 'N' },
  { name: 'В95', category: 'N' },
  { name: 'АК6', category: 'N' },
  { name: 'Латунь ЛС59', category: 'N' },
  { name: 'Бронза БрАЖ9-4', category: 'N' },
  { name: 'Бронза ОЦС5-5-5', category: 'N' },
  { name: 'Капролон', category: 'N' },
  { name: 'Фторопласт', category: 'N' },
  // S — Жароміцні / титан
  { name: 'Титан ВТ1-0', category: 'S' },
  { name: 'Титан ВТ6', category: 'S' }
]

export const WORKPIECE_TYPE_SEED: string[] = [
  'Пруток',
  'Лист',
  'Плита',
  'Труба',
  'Поковка',
  'Виливок',
  'Штамповка',
  'Заготовка довільна'
]
