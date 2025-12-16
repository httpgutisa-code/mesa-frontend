export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t-2 border-[hsl(var(--primary))]/10 bg-gradient-to-b from-transparent via-[hsl(var(--primary))]/[0.02] to-[hsl(var(--primary))]/[0.05] pwa-safe-bottom">
      <div className="container-responsive flex flex-col items-center justify-between gap-4 sm:gap-6 py-8 sm:py-10 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-lg">
            <span className="text-white font-black text-lg">S</span>
          </div>
          <div>
            <p className="font-black text-base gradient-text">SmartSales</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">© {year} Todos los derechos reservados</p>
          </div>
        </div>
        <nav className="flex items-center gap-6 sm:gap-8 text-sm text-gray-600 dark:text-gray-400">
          <a href="#" className="font-semibold hover:text-[hsl(var(--primary))] hover:underline underline-offset-4 transition-all">Privacidad</a>
          <a href="#" className="font-semibold hover:text-[hsl(var(--primary))] hover:underline underline-offset-4 transition-all">Términos</a>
          <a href="#" className="font-semibold hover:text-[hsl(var(--primary))] hover:underline underline-offset-4 transition-all">Contacto</a>
        </nav>
      </div>
    </footer>
  )
}
