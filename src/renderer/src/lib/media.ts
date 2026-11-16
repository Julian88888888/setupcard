/**
 * Build a media:// URL for a relative path stored in the DB.
 * Example: "machines/abc.jpg" → "media://local/machines/abc.jpg"
 */
export function mediaUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null
  const cleaned = relativePath.replace(/^[/\\]+/, '').replace(/\\/g, '/')
  if (!cleaned) return null
  return `media://local/${cleaned}`
}
