import { Link } from 'react-router-dom'
import { Lock, ShoppingBag } from 'lucide-react'

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function Account({ customer, onLogout }) {
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
            <span className="hidden text-sm text-slate-500 sm:block">
              {customer.email}
            </span>
            <Link
              to="/carrito"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Mi carrito</span>
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">
          Mi cuenta / Mis compras
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Hola, {customer.name}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Administra tu cuenta y revisa el historial de tus pedidos.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-sm font-black text-slate-950">
                {getInitials(customer.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">
                  {customer.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {customer.email}
                </p>
              </div>
            </div>

            <nav className="mt-6 space-y-1 text-sm font-semibold">
              <span className="flex items-center gap-2.5 rounded-xl bg-amber-50 px-3 py-2.5 text-amber-700">
                <ShoppingBag className="h-4 w-4" />
                Mis compras
              </span>
              <Link
                to="/carrito"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <ShoppingBag className="h-4 w-4" />
                Mi carrito
              </Link>
              <span className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-slate-400">
                <Lock className="h-4 w-4" />
                Cuenta protegida
              </span>
            </nav>

            <button
              type="button"
              onClick={onLogout}
              className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Cerrar sesión
            </button>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-2 border-b border-slate-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Mis compras
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Historial de pedidos asociados a tu cuenta.
                </p>
              </div>
              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                0 pedidos
              </span>
            </div>

            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Aún no tienes compras
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Cuando realices tu primer pedido, aparecerá aquí con su estado y
                los detalles de entrega.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Account
