export default function SortSelect({ value, onChange, className = '' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={[
        'input rounded-lg text-xs sm:text-sm px-3 py-2.5 sm:py-2 font-medium cursor-pointer',
        className,
      ].join(' ')}
    >
      <option value="-fecha_creacion">Más recientes</option>
      <option value="nombre">Nombre (A-Z)</option>
      <option value="precio">Precio: menor a mayor</option>
      <option value="-precio">Precio: mayor a menor</option>
    </select>
  )
}
