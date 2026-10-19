export function formatDuration(months: number): string {
  const total = Math.max(0, Math.round(months))
  const years = Math.floor(total / 12)
  const rest = total % 12

  if (years === 0) {
    return `${rest} mois`
  }
  const label = years > 1 ? 'ans' : 'an'
  return rest === 0 ? `${years} ${label}` : `${years} ${label} ${rest} mois`
}
