export function formatDate(date: Date | string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getDaysUntilFollowUp(followUpDate: Date | string): number {
  const today = new Date()
  const followUp = new Date(followUpDate)
  
  // Reset time to midnight for accurate day calculation
  today.setHours(0, 0, 0, 0)
  followUp.setHours(0, 0, 0, 0)
  
  const diffTime = followUp.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}
