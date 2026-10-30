import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Backpack,
  CircleAlert,
  CircleCheck,
  Coffee,
  Footprints,
  Headphones,
  Lamp,
  Milk,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Volleyball,
  Watch,
} from 'lucide-react'
import { PRODUCTS } from '../data/products'
import {
  addToCart,
  getCartSummary,
  readCart,
  removeFromCart,
  updateQuantity,
  writeCart,
} from '../services/cart'

const priceFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function formatPrice(value) {
  return priceFormatter.format(value)
}

function formatUnits(count) {
  return count === 1 ? '1 unidad' : `${count} unidades`
}

function Carrito({ customer }) {
  const [items, setItems] = useState(readCart)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    writeCart(items)
  }, [items])

  useEffect(() => {
    if (!notice) {
      return undefined
    }

    const timer = window.setTimeout(() => setNotice(null), 4500)
    return () => window.clearTimeout(timer)
  }, [notice])

  const summary = getCartSummary(items)
  const cartQuantities = new Map(
    items.map((item) => [item.productId, item.quantity]),
  )

  function showNotice(message, tone = 'success') {
    setNotice({ message, tone })
  }

  function handleAdd(product) {
    const currentQuantity = cartQuantities.get(product.id) ?? 0

    if (product.stock <= 0) {
      showNotice(`${product.name} no tiene unidades disponibles.`, 'error')
      return
    }

    if (currentQuantity >= product.stock) {
      showNotice(
        `Solo hay ${formatUnits(product.stock)} disponibles de ${product.name}.`,
        'error',
      )
      return
    }

    setItems((current) => addToCart(current, product.id, 1))
    showNotice(`${product.name} se agregó a tu carrito.`)
  }

  function handleIncrease(line) {
    if (line.quantity >= line.product.stock) {
      showNotice(
        `Solo hay ${formatUnits(line.product.stock)} disponibles de ${line.product.name}.`,
        'error',
      )
      return
    }

    setItems((current) =>
      updateQuantity(current, line.productId, line.quantity + 1),
    )
  }

  function handleDecrease(line) {
    setItems((current) =>
      updateQuantity(current, line.productId, line.quantity - 1),
    )
  }

  function handleRemove(line) {
    setItems((current) => removeFromCart(current, line.productId))
    showNotice(`${line.product.name} se eliminó del carrito.`)
  }

  function handleConfirm() {
    if (summary.itemCount === 0) {
      return
    }

    setItems([])
    showNotice('Pedido confirmado. Gracias por comprar en DayShop.')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-lg font-black tracking-tight text-slate-950"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-amber-400">
              <ShoppingBag className="h-5 w-5" />
            </span>
            DayShop
          </Link>

          <div className="flex items-center gap-3">
            {customer && (
              <span className="hidden text-sm text-slate-500 sm:block">
                {customer.name}
              </span>
            )}
            <Link
              to={customer ? '/mi-cuenta' : '/login'}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              {customer ? 'Mi cuenta' : 'Iniciar sesión'}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">
              Mi carrito
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Revisa tu pedido
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
              Ajusta las cantidades, elimina productos y confirma el costo total
              antes de finalizar tu compra.
            </p>
          </div>
          <span className="w-fit rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
            {formatUnits(summary.itemCount)} en el carrito
          </span>
        </div>

        {notice && (
          <div
            role="status"
            aria-live="polite"
            className={`mt-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
              notice.tone === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {notice.tone === 'error' ? (
              <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <CircleCheck className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <p>{notice.message}</p>
          </div>
        )}

        <section className="mt-10">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Agrega productos
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Disponibilidad actualizada según el stock de cada producto.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={cartQuantities.get(product.id) ?? 0}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </section>

        <section
          id="carrito"
          className="mt-12 grid scroll-mt-6 gap-6 lg:grid-cols-[1fr_360px]"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Detalle del carrito
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Revisa cada producto antes de confirmar.
                </p>
              </div>
              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {formatUnits(summary.itemCount)}
              </span>
            </div>

            {summary.lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  Tu carrito está vacío
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                  Agrega productos del catálogo para ver aquí el detalle y el
                  total de tu compra.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {summary.lines.map((line) => (
                  <CartLine
                    key={line.productId}
                    line={line}
                    onIncrease={handleIncrease}
                    onDecrease={handleDecrease}
                    onRemove={handleRemove}
                  />
                ))}
              </ul>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-lg font-black text-slate-950">
              Resumen del pedido
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Los precios incluyen impuestos.
            </p>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 text-slate-600">
                <dt>Subtotal ({formatUnits(summary.itemCount)})</dt>
                <dd className="font-semibold text-slate-900">
                  {formatPrice(summary.subtotal)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 text-slate-600">
                <dt>Envío</dt>
                <dd className="font-semibold text-emerald-600">Gratis</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                <dt className="text-base font-black text-slate-950">Total</dt>
                <dd className="text-xl font-black text-slate-950">
                  {formatPrice(summary.total)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={summary.itemCount === 0}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 px-4 py-3 text-sm font-black text-slate-950 shadow-lg shadow-orange-500/20 transition hover:from-amber-200 hover:to-orange-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              Confirmar pedido
            </button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
              Puedes ajustar las cantidades antes de confirmar tu pedido.
            </p>
            <Link
              to="/"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Seguir comprando
            </Link>
          </aside>
        </section>
      </main>
    </div>
  )
}

function ProductCard({ product, cartQuantity, onAdd }) {
  const unavailable = product.stock === 0
  const atLimit = cartQuantity >= product.stock && product.stock > 0

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`flex aspect-[4/3] items-center justify-center rounded-xl bg-gradient-to-br ${product.accent} text-slate-900/70`}
        aria-hidden="true"
      >
        <ProductIcon name={product.icon} className="h-14 w-14" />
      </div>

      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">
        {product.category}
      </p>
      <h3 className="mt-1 text-sm font-black text-slate-900">{product.name}</h3>
      <p className="mt-1 flex-1 text-xs leading-relaxed text-slate-500">
        {product.description}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-base font-black text-slate-950">
          {formatPrice(product.price)}
        </span>
        <StockBadge stock={product.stock} />
      </div>

      <button
        type="button"
        onClick={() => onAdd(product)}
        disabled={unavailable || atLimit}
        className="mt-4 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
      >
        {unavailable
          ? 'Sin stock'
          : atLimit
            ? 'Máximo en carrito'
            : 'Agregar al carrito'}
      </button>

      <p className="mt-2 min-h-4 text-center text-xs font-semibold text-emerald-600">
        {cartQuantity > 0 ? `${formatUnits(cartQuantity)} en tu carrito` : ''}
      </p>
    </article>
  )
}

function CartLine({ line, onIncrease, onDecrease, onRemove }) {
  return (
    <li className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${line.product.accent} text-slate-900/70`}
        aria-hidden="true"
      >
        <ProductIcon name={line.product.icon} className="h-9 w-9" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">
              {line.product.category}
            </p>
            <h3 className="mt-1 truncate text-sm font-bold text-slate-900">
              {line.product.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {formatPrice(line.product.price)} c/u · quedan{' '}
              {formatUnits(line.product.stock)}
            </p>
          </div>
          <p className="shrink-0 text-sm font-black text-slate-950">
            {formatPrice(line.lineTotal)}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => onDecrease(line)}
              disabled={line.quantity <= 1}
              aria-label={`Reducir cantidad de ${line.product.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-l-xl text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span
              aria-live="polite"
              className="w-10 text-center text-sm font-bold text-slate-900"
            >
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrease(line)}
              disabled={line.quantity >= line.product.stock}
              aria-label={`Aumentar cantidad de ${line.product.name}`}
              className="flex h-9 w-9 items-center justify-center rounded-r-xl text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(line)}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>
    </li>
  )
}

function StockBadge({ stock }) {
  if (stock === 0) {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600">
        Sin stock
      </span>
    )
  }

  if (stock <= 3) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
        Quedan {stock}
      </span>
    )
  }

  return (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
      {stock} disponibles
    </span>
  )
}

function ProductIcon({ name, className }) {
  const icons = {
    headphones: Headphones,
    watch: Watch,
    backpack: Backpack,
    bottle: Milk,
    lamp: Lamp,
    mugs: Coffee,
    shoes: Footprints,
    ball: Volleyball,
  }

  const Icon = icons[name] ?? Volleyball

  return <Icon className={className} strokeWidth={1.6} aria-hidden="true" />
}

export default Carrito
