/**
 * Curated seed lists for materials / workpiece types.
 * Not a full GOST catalog — common machining grades only.
 */
export const MATERIAL_SEED: Array<{ name: string; category: string }> = [
  // Steel
  { name: 'Ст3', category: 'steel' },
  { name: 'Сталь 20', category: 'steel' },
  { name: 'Сталь 45', category: 'steel' },
  { name: '40Х', category: 'steel' },
  { name: '40ХН', category: 'steel' },
  { name: '30ХГСА', category: 'steel' },
  { name: '18ХГТ', category: 'steel' },
  { name: '20Х', category: 'steel' },
  { name: '65Г', category: 'steel' },
  { name: 'ШХ15', category: 'steel' },
  { name: 'У8А', category: 'steel' },
  { name: 'У10А', category: 'steel' },
  // Stainless
  { name: '12Х18Н10Т', category: 'stainless' },
  { name: '08Х18Н10', category: 'stainless' },
  { name: '10Х17Н13М2', category: 'stainless' },
  { name: '20Х13', category: 'stainless' },
  { name: '40Х13', category: 'stainless' },
  // Cast iron
  { name: 'СЧ15', category: 'cast_iron' },
  { name: 'СЧ20', category: 'cast_iron' },
  { name: 'СЧ25', category: 'cast_iron' },
  { name: 'ВЧ40', category: 'cast_iron' },
  { name: 'ВЧ50', category: 'cast_iron' },
  // Aluminum
  { name: 'АД31', category: 'aluminum' },
  { name: 'АМц', category: 'aluminum' },
  { name: 'Д16Т', category: 'aluminum' },
  { name: 'АМг5', category: 'aluminum' },
  { name: 'АМг6', category: 'aluminum' },
  { name: 'В95', category: 'aluminum' },
  { name: 'АК6', category: 'aluminum' },
  // Copper alloys
  { name: 'Латунь ЛС59', category: 'copper' },
  { name: 'Бронза БрАЖ9-4', category: 'copper' },
  { name: 'Бронза ОЦС5-5-5', category: 'copper' },
  // Titanium / plastic / other
  { name: 'Титан ВТ1-0', category: 'titanium' },
  { name: 'Титан ВТ6', category: 'titanium' },
  { name: 'Капролон', category: 'plastic' },
  { name: 'Фторопласт', category: 'plastic' }
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
