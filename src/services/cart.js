import { PRODUCTS } from '../data/products'

export const CART_KEY = 'dayshop:cart'

export function findProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId) ?? null
}

function normalizeCart(rawItems) {
  if (!Array.isArray(rawItems)) {
    return []
  }

  const quantities = new Map()

  rawItems.forEach((item) => {
    if (!item || typeof item.productId !== 'string') {
      return
    }

    const product = findProduct(item.productId)
    const quantity = Number(item.quantity)

    if (!product || product.stock <= 0 || !Number.isFinite(quantity)) {
      return
    }

    const safeQuantity = Math.min(
      product.stock,
      Math.max(1, Math.floor(quantity)),
    )
    const currentQuantity = quantities.get(product.id) ?? 0

    quantities.set(
      product.id,
      Math.min(product.stock, currentQuantity + safeQuantity),
    )
  })

  return Array.from(quantities, ([productId, quantity]) => ({
    productId,
    quantity,
  }))
}

export function readCart() {
  try {
    const stored = window.localStorage.getItem(CART_KEY)

    return stored ? normalizeCart(JSON.parse(stored)) : []
  } catch {
    return []
  }
}

export function writeCart(items) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(normalizeCart(items)))
  } catch {
    return
  }
}

export function addToCart(items, productId, quantity = 1) {
  const product = findProduct(productId)
  const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 0))

  if (!product || product.stock <= 0) {
    return items
  }

  const currentLine = items.find((item) => item.productId === productId)
  const currentQuantity = currentLine ? currentLine.quantity : 0
  const nextQuantity = Math.min(product.stock, currentQuantity + safeQuantity)

  if (nextQuantity === currentQuantity) {
    return items
  }

  if (!currentLine) {
    return [...items, { productId, quantity: nextQuantity }]
  }

  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: nextQuantity } : item,
  )
}

export function updateQuantity(items, productId, quantity) {
  const product = findProduct(productId)

  if (!product || product.stock <= 0) {
    return removeFromCart(items, productId)
  }

  const safeQuantity = Math.min(
    product.stock,
    Math.max(0, Math.floor(Number(quantity) || 0)),
  )

  if (safeQuantity === 0) {
    return removeFromCart(items, productId)
  }

  return items.map((item) =>
    item.productId === productId ? { ...item, quantity: safeQuantity } : item,
  )
}

export function removeFromCart(items, productId) {
  return items.filter((item) => item.productId !== productId)
}

export function getCartSummary(items) {
  const lines = items.flatMap((item) => {
    const product = findProduct(item.productId)

    if (!product) {
      return []
    }

    return [
      {
        ...item,
        product,
        lineTotal: product.price * item.quantity,
      },
    ]
  })

  const itemCount = lines.reduce((total, line) => total + line.quantity, 0)
  const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0)
  const shipping = 0

  return {
    lines,
    itemCount,
    subtotal,
    shipping,
    total: subtotal + shipping,
  }
}
