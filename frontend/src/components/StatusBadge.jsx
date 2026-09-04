const STYLES = {
  PENDING_REVIEW: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  APPROVED: "bg-green-500/10 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
  CONFIRMED: "bg-green-500/10 text-green-400 border-green-500/30",
  COMPLETED: "bg-[var(--color-muted)]/10 text-[var(--color-muted)] border-[var(--color-border)]",
}

const LABELS = {
  PENDING_REVIEW: "Pending Review",
  APPROVED: "Live",
  REJECTED: "Rejected",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
        STYLES[status] || "border-[var(--color-border)] text-[var(--color-muted)]"
      }`}
    >
      {LABELS[status] || status}
    </span>
  )
}
