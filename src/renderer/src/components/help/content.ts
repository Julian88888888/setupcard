import {
  MATERIAL_CATEGORIES,
  MATERIAL_CATEGORY_DEFAULT_COLORS,
  MATERIAL_CATEGORY_LABELS,
  materialGroupTitle
} from '../catalogs/labels'

export type HelpBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'note'; text: string }

export interface HelpSection {
  id: string
  title: string
  blocks: HelpBlock[]
}

/** Static help content — edit this file to add values and explanations. */
export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'iso',
    title: 'Групи ISO 513',
    blocks: [
      {
        type: 'paragraph',
        text: 'Група матеріалу задає колір (як на упаковці твердосплавних пластин) і використовується для каталогу матеріалів та карток деталей.'
      },
      {
        type: 'table',
        headers: ['Код', 'Назва', 'Колір'],
        rows: MATERIAL_CATEGORIES.map((c) => [
          c,
          MATERIAL_CATEGORY_LABELS[c],
          MATERIAL_CATEGORY_DEFAULT_COLORS[c]
        ])
      },
      {
        type: 'note',
        text: 'У меню «Матеріали» можна шукати за маркою або групою та фільтрувати кліком по квадрату легенди.'
      }
    ]
  },
  {
    id: 'materials',
    title: 'Матеріали',
    blocks: [
      {
        type: 'paragraph',
        text: 'Довідник марок металу. Кожна марка належить до однієї групи ISO.'
      },
      {
        type: 'bullets',
        items: [
          'Марка — назва (напр. Сталь 45, Д16Т, 40Х).',
          `Група — ${MATERIAL_CATEGORIES.map((c) => materialGroupTitle(c)).join('; ')}.`,
          'Колір береться з групи; окремий вибір кольору не потрібен.',
          'Видалити марку можна лише якщо вона не використовується в деталях.'
        ]
      }
    ]
  },
  {
    id: 'workpieces',
    title: 'Типи заготовок',
    blocks: [
      {
        type: 'paragraph',
        text: 'Каталог форм заготовки (пруток, лист, плита тощо). Прив’язується до деталі опційно.'
      },
      {
        type: 'bullets',
        items: [
          'Назва має бути унікальною.',
          'Видалення блокується, якщо тип уже вказано в картках деталей.'
        ]
      }
    ]
  },
  {
    id: 'parts',
    title: 'Деталі',
    blocks: [
      {
        type: 'paragraph',
        text: 'Картка деталі — основний облік: номер, назва, матеріал, заготовка, фото.'
      },
      {
        type: 'bullets',
        items: [
          'У списку та на сторінці деталі: спочатку номер (код), під ним назва — однаковий розмір і колір.',
          'Матеріал показується з бейджем групи ISO і українською назвою групи (напр. N — Кольорові метали).',
          'Можна додати кілька фото; у списку видно перше як мініатюру.'
        ]
      }
    ]
  },
  {
    id: 'machines',
    title: 'Верстати',
    blocks: [
      {
        type: 'paragraph',
        text: 'Реєстр обладнання: інвентарний номер, тип, шпиндель, магазин, стіл, фото тощо.'
      },
      {
        type: 'bullets',
        items: [
          'Пошук працює за назвою та інвентарним номером.',
          'Фото зберігається локально; у базі лише відносний шлях.'
        ]
      }
    ]
  },
  {
    id: 'photos',
    title: 'Фото',
    blocks: [
      {
        type: 'paragraph',
        text: 'Зображення не кладуться в PostgreSQL як BLOB. Файли на диску, у БД — відносний шлях.'
      },
      {
        type: 'table',
        headers: ['Що', 'Де'],
        rows: [
          ['На диску', 'userData/images/machines/… або …/parts/…'],
          ['У БД', 'machines/….jpg або parts/….jpg'],
          ['У інтерфейсі', 'media://local/<відносний шлях>'],
          ['Формати', 'jpg, jpeg, png, webp, gif, bmp']
        ]
      }
    ]
  },
  {
    id: 'backup',
    title: 'Резервна копія',
    blocks: [
      {
        type: 'paragraph',
        text: 'Експорт/імпорт у Налаштуваннях. Архів ZIP містить логічний дамп БД і папку з фото.'
      },
      {
        type: 'bullets',
        items: [
          'У ZIP: dump.sql + images/.',
          'pg_dump на комп’ютері не потрібен — дамп будує сам додаток.',
          'Після імпорту дані таблиць і фото замінюються вмістом архіву.'
        ]
      }
    ]
  },
  {
    id: 'values',
    title: 'Довідкові значення',
    blocks: [
      {
        type: 'paragraph',
        text: 'Сюди можна додавати робочі константи, позначення та шпаргалки для цеху. Редагуйте файл content.ts у репозиторії.'
      },
      {
        type: 'table',
        headers: ['Позначення', 'Значення', 'Примітка'],
        rows: [
          ['—', '—', 'Додайте рядки під ваші норми'],
          ['—', '—', 'Напр. рекомендовані режими, допуски']
        ]
      },
      {
        type: 'note',
        text: 'Поки контент статичний у коді: зміни потрапляють у наступну збірку додатку.'
      }
    ]
  }
]
