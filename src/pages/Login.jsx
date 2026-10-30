import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Check,
  CircleAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  Mail,
  ShoppingBag,
} from 'lucide-react'
import {
  DEMO_CREDENTIALS,
  MAX_ATTEMPTS,
  authenticate,
  clearFailures,
  getFailureState,
  registerFailure,
} from '../services/auth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate({ email, password }) {
  const errors = {}
  const normalizedEmail = email.trim()

  if (!normalizedEmail) {
    errors.email = 'El correo electrónico es obligatorio.'
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = 'Ingresa un correo válido, por ejemplo usuario@dominio.com.'
  }

  if (!password) {
    errors.password = 'La contraseña es obligatoria.'
  } else if (password.length < 12) {
    errors.password = 'La contraseña debe tener al menos 12 caracteres.'
  }

  return errors
}

function formatCountdown(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function Login({ onLogin }) {
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lockedUntil, setLockedUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  const isLocked = lockedUntil > now
  const remainingMs = Math.max(lockedUntil - now, 0)
  const lockMessage = isLocked
    ? `Por seguridad, bloqueamos nuevos intentos. Vuelve a intentarlo en ${formatCountdown(remainingMs)}.`
    : ''
  const errorMessage = lockMessage || authError

  useEffect(() => {
    if (!isLocked) {
      return undefined
    }

    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [isLocked])

  function handleChange(event) {
    const { name, value } = event.target

    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
    setAuthError('')

    if (name === 'email') {
      const failureState = getFailureState(value)
      setNow(Date.now())
      setLockedUntil(
        failureState.lockedUntil > Date.now() ? failureState.lockedUntil : 0,
      )
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting || isLocked) {
      return
    }

    const validationErrors = validate(values)
    setErrors(validationErrors)
    setAuthError('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    const email = values.email.trim()
    const failureState = getFailureState(email)

    if (failureState.lockedUntil > Date.now()) {
      setNow(Date.now())
      setLockedUntil(failureState.lockedUntil)
      return
    }

    if (failureState.lockedUntil > 0) {
      clearFailures(email)
    }

    setIsSubmitting(true)

    try {
      const customer = await authenticate(email, values.password)
      clearFailures(email)
      setLockedUntil(0)
      setIsSubmitting(false)
      onLogin(customer)
    } catch {
      const failure = registerFailure(email)
      setNow(Date.now())
      setIsSubmitting(false)

      if (failure.lockedUntil > 0) {
        setLockedUntil(failure.lockedUntil)
        return
      }

      const remainingAttempts = Math.max(MAX_ATTEMPTS - failure.attempts, 0)
      setAuthError(
        remainingAttempts === 1
          ? 'Correo o contraseña incorrectos. Te queda 1 intento.'
          : `Correo o contraseña incorrectos. Te quedan ${remainingAttempts} intentos.`,
      )
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-orange-600/20 blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-xl lg:grid-cols-[1.05fr_1fr]">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 p-10 text-slate-950 lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-amber-300 shadow-lg shadow-black/20">
                <ShoppingBag className="h-6 w-6" />
              </span>
              <span className="text-2xl font-black tracking-tight">DayShop</span>
            </div>

            <h1 className="mt-16 text-4xl font-black leading-tight tracking-tight">
              Vamos a comprar
            </h1>
            <p className="mt-4 max-w-sm text-sm font-medium leading-relaxed text-slate-900/70">
              Inicia sesión para revisar tus compras, seguir tus pedidos y
              gestionar tu cuenta de forma segura.
            </p>
          </div>

          <ul className="space-y-3 text-sm font-semibold text-slate-900/80">
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950/10">
                <Check className="h-3.5 w-3.5" />
              </span>
              Compras protegidas.
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950/10">
                <Check className="h-3.5 w-3.5" />
              </span>
              Seguimiento claro de tus compras
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950/10">
                <Check className="h-3.5 w-3.5" />
              </span>
              Tu cuenta, siempre bajo tu control
            </li>
          </ul>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <span className="text-xl font-black tracking-tight">DayShop</span>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Mi cuenta
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Ingresa con tu correo electrónico y contraseña.
          </p>

          <form noValidate onSubmit={handleSubmit} className="mt-8 space-y-5">
            {errorMessage && (
              <div
                role="alert"
                aria-live="assertive"
                className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-200"
              >
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="usuario@dominio.com"
                  value={values.email}
                  onChange={handleChange}
                  aria-invalid={errors.email ? 'true' : undefined}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  className={`w-full rounded-xl border bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-2 ${
                    errors.email
                      ? 'border-red-400/70 focus:border-red-400 focus:ring-red-400/20'
                      : 'border-white/10 focus:border-amber-400 focus:ring-amber-400/20'
                  }`}
                />
              </div>
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="mt-2 text-xs font-medium text-red-300"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Contraseña
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Mínimo 12 caracteres"
                  value={values.password}
                  onChange={handleChange}
                  aria-invalid={errors.password ? 'true' : undefined}
                  aria-describedby="password-help"
                  className={`w-full rounded-xl border bg-slate-950/60 py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-2 ${
                    errors.password
                      ? 'border-red-400/70 focus:border-red-400 focus:ring-red-400/20'
                      : 'border-white/10 focus:border-amber-400 focus:ring-amber-400/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  aria-pressed={showPassword}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p
                  id="password-help"
                  role="alert"
                  className="mt-2 text-xs font-medium text-red-300"
                >
                  {errors.password}
                </p>
              ) : (
                <p
                  id="password-help"
                  className="mt-2 text-xs text-slate-500"
                >
                  La contraseña debe tener al menos 12 caracteres.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLocked}
              aria-busy={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 px-5 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-orange-500/20 transition hover:from-amber-200 hover:to-orange-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Verificando…
                </>
              ) : isLocked ? (
                'Acceso bloqueado'
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-slate-400">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <p>
                Después de {MAX_ATTEMPTS} intentos fallidos consecutivos, la
                cuenta se bloquea temporalmente durante 15 minutos.
              </p>
            </div>

            {import.meta.env.DEV && (
              <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs text-amber-100/80">
                <span className="font-bold text-amber-200">
                  Acceso de demostración:
                </span>{' '}
                <span className="font-mono">{DEMO_CREDENTIALS.email}</span>
                {' · '}
                <span className="font-mono">{DEMO_CREDENTIALS.password}</span>
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  )
}

export default Login
