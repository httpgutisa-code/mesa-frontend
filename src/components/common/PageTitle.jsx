export default function PageTitle({
  icon,
  title,
  subtitle,
  eyebrow,
  actions,
  className = ''
}) {
  const classes = ['mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white shadow-[0_12px_30px_rgba(0,128,255,0.25)]">
            {typeof icon === 'string'
              ? <span className="text-xl font-bold">{icon}</span>
              : icon}
          </div>
        )}
        <div>
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-gray-500">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[clamp(2rem,4vw,3rem)] font-black leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap gap-3 sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  )
}
