import ProductCard from './ProductCard'
import { toArray } from '../../utils/data'

export default function ProductGrid({ products, onAdd }) {
  const list = toArray(products)
  if (!list.length) {
    return <div className="card-surface p-4 sm:p-6 text-center text-sm sm:text-base text-gray-600 dark:text-gray-400">No hay productos para mostrar.</div>
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {list.map((p) => (
        <ProductCard key={p.id || p.slug || p.name} product={p} onAdd={onAdd} />
      ))}
    </div>
  )
}
