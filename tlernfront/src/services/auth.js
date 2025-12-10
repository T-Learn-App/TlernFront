const TOKEN_KEY = 'tlern_auth_token'
const USER_KEY = 'tlern_auth_email'
const USERS_KEY = 'tlern_registered_users'

const DEFAULT_USERS = [
    { email: 'admin', password: '4341nvNV' }
]

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

const createFakeJwt = (payload) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const body = btoa(JSON.stringify(payload))
    // подпись не проверяем, нам важна структура и exp
    return `${header}.${body}.signed`
}

const loadUsers = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
        const merged = [...DEFAULT_USERS]

        let changed = false
        parsed.forEach(u => {
            const exists = merged.some(m => m.email === u.email)
            if (!exists) {
                merged.push(u)
                changed = true
            }
        })

        if (changed || parsed.length === 0) {
            saveUsers(merged)
        }

        return merged
    } catch {
        saveUsers(DEFAULT_USERS)
        return [...DEFAULT_USERS]
    }
}

const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const issueToken = (email) => {
    const expiresAt = Date.now() + THIRTY_DAYS_MS
    const token = createFakeJwt({
        sub: email,
        exp: Math.floor(expiresAt / 1000),
        iat: Math.floor(Date.now() / 1000)
    })

    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, email)

    return { token, email, expiresAt }
}

export const getStoredAuth = () => {
    try {
        const token = localStorage.getItem(TOKEN_KEY)
        const email = localStorage.getItem(USER_KEY)
        if (!token || !email) return null

        const [, payloadPart] = token.split('.')
        const payload = JSON.parse(atob(payloadPart || ''))

        const expMs = (payload.exp ?? 0) * 1000
        if (Date.now() > expMs) {
            clearAuth()
            return null
        }

        return { token, email, expiresAt: expMs }
    } catch {
        clearAuth()
        return null
    }
}

export const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

export const register = async (email, password) => {
    const users = loadUsers()
    const existing = users.find(u => u.email === email)
    if (existing) {
        throw new Error('Пользователь уже существует')
    }

    users.push({ email, password })
    saveUsers(users)

    return issueToken(email)
}

export const login = async (email, password) => {
    const users = loadUsers()
    const user = users.find(u => u.email === email)

    if (!user || user.password !== password) {
        throw new Error('Неверный email или пароль')
    }

    return issueToken(email)
}

