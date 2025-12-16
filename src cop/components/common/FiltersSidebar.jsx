export default function FiltersSidebar({ categories = [], selectedCategoria, onChange }) {
  return (
    <>
      {/* Versión móvil - Select compacto */}
      <div className="lg:hidden">
        <label className="block mb-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Filtrar por categoría</label>
        <select
          value={selectedCategoria || ''}
          onChange={(e) => onChange?.({ categoria: e.target.value || undefined })}
          className="input rounded-lg text-xs sm:text-sm px-3 py-2.5 font-medium cursor-pointer w-full"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Versión desktop - Sidebar con radio buttons */}
      <aside className="hidden w-64 shrink-0 space-y-4 rounded-xl card-surface p-4 lg:block">
        <div>
          <h3 className="mb-3 text-sm font-semibold">Categorías</h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <label className="flex cursor-pointer items-center gap-2 hover:text-[hsl(var(--primary))] transition-colors">
              <input
                type="radio"
                name="categoria"
                checked={!selectedCategoria}
                onChange={() => onChange?.({ categoria: undefined })}
                className="cursor-pointer"
              />
              Todas
            </label>
            {categories.map((cat) => (
              <label key={cat.id} className="flex cursor-pointer items-center gap-2 hover:text-[hsl(var(--primary))] transition-colors">
                <input
                  type="radio"
                  name="categoria"
                  checked={String(selectedCategoria || '') === String(cat.id)}
                  onChange={() => onChange?.({ categoria: cat.id })}
                  className="cursor-pointer"
                />
                {cat.nombre}
              </label>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}
