export default function Button({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) {
  const base = 'inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold focus-visible:outline-none active:scale-[0.98] transition-all min-h-[48px]';
  const variants = {
    primary: 'btn-primary shadow-[0_8px_24px_rgba(0,128,255,0.35)] hover:shadow-[0_12px_32px_rgba(0,128,255,0.45)]',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  }
  const cls = [
    base, 
    variants[variant] || variants.primary, 
    disabled ? 'opacity-60 cursor-not-allowed active:scale-100 hover:shadow-none' : '', 
    className
  ].join(' ')
  
  return (
    <button className={cls} disabled={disabled} {...props}>
      {children}
    </button>
  )
}
