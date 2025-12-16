// Intérprete mejorado de intents en español para comandos de voz
// Soporta: navegación, carrito, compras, búsquedas, promociones, cuenta, pedidos

const NUMBER_WORDS = {
  'uno': 1, 'una': 1, 'un': 1,
  'dos': 2,
  'tres': 3,
  'cuatro': 4,
  'cinco': 5,
  'seis': 6,
  'siete': 7,
  'ocho': 8,
  'nueve': 9,
  'diez': 10,
  'once': 11,
  'doce': 12,
  'quince': 15,
  'veinte': 20
}

function parseQuantity(text) {
  // x2, por 2, con 2, cantidad 2, 2 unidades, dos, etc
  const xMatch = text.match(/x\s*(\d+)/i)
  if (xMatch) return Number(xMatch[1])

  const numMatch = text.match(/(?:por|con|de|cantidad|son|agrega|añade|anade)?\s*(\d{1,2})\b/)
  if (numMatch) return Number(numMatch[1])

  const word = Object.keys(NUMBER_WORDS).find(w => new RegExp(`\\b${w}\\b`, 'i').test(text))
  if (word) return NUMBER_WORDS[word]

  return 1
}

function cleanProductQuery(text) {
  let q = text
  // Remover verbos y conectores comunes
  const remove = [
    'agrega', 'agregar', 'añade', 'anade', 'añadir', 'sumar', 'pon', 'poner', 'mete',
    'al carrito', 'a carrito', 'carrito',
    'comprar', 'comprar ahora', 'compra', 'pagar', 'checkout',
    'ir a', 'ir al', 'ver', 'buscar', 'busca', 'muestrame', 'muéstrame', 'enséñame', 'ensename'
  ]
  remove.forEach(w => { q = q.replace(new RegExp(w, 'gi'), ' ') })
  // Remover patrones de cantidad
  q = q.replace(/x\s*\d+/gi, ' ')
  q = q.replace(/\b(?:por|con|de|cantidad)\s*\d+\b/gi, ' ')
  // Colapsar espacios
  q = q.replace(/\s+/g, ' ').trim()
  return q
}

export function parseIntent(rawText) {
  const text = (rawText || '').toLowerCase().trim()
  if (!text) return { type: 'unknown' }

  // ========== NAVEGACIÓN ==========
  
  // Inicio / Home
  if (/^(ir a|abrir|ver|volver a|vuelve a|regresar a|regresa a)?\s*(inicio|home|página principal|principal)$/i.test(text)) {
    return { type: 'go_home' }
  }

  // Tienda / Catálogo
  if (/^(ir a|abrir|ver|mostrar)?\s*(la\s*)?(tienda|catálogo|catalogo|shop|productos|todos los productos)$/i.test(text)) {
    return { type: 'go_catalog' }
  }

  // Promociones
  if (/^(ir a|abrir|ver|mostrar)?\s*(las\s*)?(promociones|promos|ofertas|descuentos)$/i.test(text)) {
    return { type: 'go_promos' }
  }

  // Carrito
  if (/^(ir a|abrir|ver|mostrar|revisar)?\s*(mi\s*)?(carrito|carro|cesta)$/i.test(text)) {
    return { type: 'go_cart' }
  }

  // Pedidos / Compras
  if (/^(ir a|abrir|ver|mostrar|revisar)?\s*(mis\s*)?(pedidos|compras|órdenes|ordenes|historial)$/i.test(text)) {
    return { type: 'go_orders' }
  }

  // Cuenta / Perfil
  if (/^(ir a|abrir|ver|mostrar)?\s*(mi\s*)?(cuenta|perfil|datos|información|info)$/i.test(text)) {
    return { type: 'go_account' }
  }

  // Checkout / Pagar
  if (/^(ir a|abrir)?\s*(checkout|pagar|finalizar compra|proceder al pago|proceder pago|comprar)$/i.test(text)) {
    return { type: 'go_checkout' }
  }

  // ========== ACCIONES DE CARRITO ==========
  
  // Vaciar carrito
  if (/vaciar|limpiar|vacía|limpia|elimina todo|borra todo|borrar todo/.test(text) && /carrito|carro|cesta/.test(text)) {
    return { type: 'clear_cart' }
  }

  // Agregar al carrito
  if (/agrega|agregar|añade|anade|añadir|mete|meter|pon|poner|suma|sumar/.test(text) && (/carrito|carro|cesta/.test(text) || /al\s*carrito/.test(text))) {
    const qty = parseQuantity(text)
    const query = cleanProductQuery(text)
    return { type: 'add_to_cart', quantity: qty, query }
  }

  // Atajo agregar: "agrega coca cola x2" (sin decir carrito explícitamente)
  if (/^(agrega|añade|anade|añadir|mete|meter|pon|poner)\b/.test(text) && !/(carrito|carro|cesta)/.test(text)) {
    const qty = parseQuantity(text)
    const query = cleanProductQuery(text)
    if (query.length > 2) { // Solo si hay algo que agregar
      return { type: 'add_to_cart', quantity: qty, query }
    }
  }

  // Remover del carrito
  if (/(quitar|eliminar|sacar|remover|borrar)/.test(text) && (/carrito|carro|cesta/.test(text) || /del\s*carrito/.test(text))) {
    const qty = parseQuantity(text)
    const query = cleanProductQuery(text)
    return { type: 'remove_from_cart', quantity: qty, query }
  }

  // ========== BÚSQUEDA ==========
  
  // Buscar producto
  if (/^(buscar|busca|buscar en la tienda|búsqueda|encontrar|encuentra)\b/.test(text)) {
    const query = cleanProductQuery(text)
    return { type: 'search', query }
  }

  // Mostrar / Ver producto
  if (/^(mostrar|muestra|muestrame|muéstrame|ver|enseñar|enséñame|ensename)\b/.test(text)) {
    const query = cleanProductQuery(text)
    return { type: 'search', query }
  }

  // ========== COMPRA DIRECTA ==========
  
  // Comprar directo: "comprar [2] [producto]"
  if (/^(comprar|compra|adquirir)\b/.test(text)) {
    const qty = parseQuantity(text)
    const query = cleanProductQuery(text)
    return { type: 'buy', quantity: qty, query }
  }

  // ========== AYUDA / INFO ==========
  
  // Ayuda
  if (/^(ayuda|ayúdame|help|qué puedo decir|que puedo decir|comandos)$/i.test(text)) {
    return { type: 'help' }
  }

  return { type: 'unknown' }
}


