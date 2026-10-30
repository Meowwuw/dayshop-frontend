const ATTEMPTS_KEY = 'dayshop:login-attempts'
const AUTH_DELAY_MS = 700

export const MAX_ATTEMPTS = 5
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000
export const DEMO_CREDENTIALS = {
  email: 'cliente@dayshop.com',
  password: 'DayShop2026!',
}

function normalizeEmail(email) {
  return email.trim().toLowerCase()
}

function readAttempts() {
  try {
    const stored = window.localStorage.getItem(ATTEMPTS_KEY)
    const parsed = stored ? JSON.parse(stored) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAttempts(attempts) {
  try {
    window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts))
  } catch {
    return
  }
}

export function getFailureState(email) {
  const key = normalizeEmail(email)
  const record = readAttempts()[key]

  if (!record || typeof record.attempts !== 'number') {
    return { attempts: 0, lockedUntil: 0 }
  }

  return {
    attempts: record.attempts,
    lockedUntil:
      typeof record.lockedUntil === 'number' ? record.lockedUntil : 0,
  }
}

export function registerFailure(email) {
  const key = normalizeEmail(email)
  const attempts = readAttempts()
  const current = getFailureState(key)
  const activeAttempts =
    current.lockedUntil > 0 && current.lockedUntil <= Date.now()
      ? 0
      : current.attempts
  const nextAttempts = activeAttempts + 1
  const lockedUntil =
    nextAttempts >= MAX_ATTEMPTS
      ? Date.now() + LOCKOUT_DURATION_MS
      : 0

  attempts[key] = { attempts: nextAttempts, lockedUntil }
  writeAttempts(attempts)

  return { attempts: nextAttempts, lockedUntil }
}

export function clearFailures(email) {
  const key = normalizeEmail(email)
  const attempts = readAttempts()

  if (key in attempts) {
    delete attempts[key]
    writeAttempts(attempts)
  }
}

export async function authenticate(email, password) {
  await new Promise((resolve) => window.setTimeout(resolve, AUTH_DELAY_MS))

  const isValid =
    normalizeEmail(email) === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password

  if (!isValid) {
    throw new Error('INVALID_CREDENTIALS')
  }

  return {
    id: 'demo-customer',
    name: 'Cliente DayShop',
    email: DEMO_CREDENTIALS.email,
  }
}
