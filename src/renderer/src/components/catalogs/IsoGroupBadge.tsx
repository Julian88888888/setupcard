import type { MaterialCategory } from '../../../../shared/schemas'
import {
  MATERIAL_CATEGORY_DEFAULT_COLORS,
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_CATEGORY_TEXT_ON_COLOR,
  materialGroupTitle
} from './labels'

interface IsoGroupBadgeProps {
  category: MaterialCategory
  size?: 'sm' | 'md'
  /** Показати українську назву поруч: «Сталь» */
  showLabel?: boolean
  /** Показати повний підпис: «P — Сталь» */
  showFullLabel?: boolean
}

/**
 * Кольоровий квадрат з літерою ISO (як на упаковці пластин).
 * Колір завжди береться з групи — не з кастомного поля матеріалу.
 */
export function IsoGroupBadge({
  category,
  size = 'sm',
  showLabel = false,
  showFullLabel = false
}: IsoGroupBadgeProps): JSX.Element {
  const bg = MATERIAL_CATEGORY_DEFAULT_COLORS[category]
  const fg = MATERIAL_CATEGORY_TEXT_ON_COLOR[category]
  const box = size === 'md' ? 'h-8 min-w-8 px-1.5 text-sm' : 'h-6 min-w-6 px-1 text-xs'

  return (
    <span className="inline-flex items-center gap-2" title={materialGroupTitle(category)}>
      <span
        className={`inline-flex ${box} shrink-0 items-center justify-center rounded font-bold leading-none`}
        style={{ backgroundColor: bg, color: fg }}
      >
        {category}
      </span>
      {showFullLabel && (
        <span className="text-sm text-ink">
          <span className="font-semibold">{category}</span>
          <span className="text-ink-faint"> — </span>
          <span className="text-ink-muted">{MATERIAL_CATEGORY_LABELS[category]}</span>
        </span>
      )}
      {!showFullLabel && showLabel && (
        <span className="text-sm text-ink-muted">{MATERIAL_CATEGORY_LABELS[category]}</span>
      )}
    </span>
  )
}
