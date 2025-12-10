import { useMemo, useState } from "react"
import "./App.css"
import { login, register } from "./services/auth"


export default function Auth({ onAuth }) {
    const [mode, setMode] = useState("login")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const title = useMemo(() => mode === "login" ? "Вход" : "Регистрация", [mode])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!email.trim()) {
            setError("Введите email")
            return
        }
        if (!password.trim()) {
            setError("Введите пароль")
            return
        }
        if (mode === "register" && password !== confirm) {
            setError("Пароли не совпадают")
            return
        }

        setLoading(true)
        try {
            const authData = mode === "login"
                ? await login(email.trim(), password.trim())
                : await register(email.trim(), password.trim())

            if (typeof onAuth === "function") {
                onAuth(authData)
            }
        } catch (err) {
            setError(err?.message || "Не удалось выполнить действие")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app auth-wrapper">
            <div className="auth-card" role="region" aria-labelledby="auth-title">
                <h1 id="auth-title" className="auth-title">T-Learn</h1>

                <div className="auth-tabs" role="tablist" aria-label="Режим авторизации">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "login"}
                        className={`auth-tab ${mode === "login" ? "active" : ""}`}
                        onClick={() => setMode("login")}
                    >
                        Вход
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={mode === "register"}
                        className={`auth-tab ${mode === "register" ? "active" : ""}`}
                        onClick={() => setMode("register")}
                    >
                        Регистрация
                    </button>
                </div>

                <form className="auth-form-column" onSubmit={handleSubmit} noValidate>
                    <label htmlFor="email" className="visually-hidden">Email</label>
                    <input
                        id="email"
                        name="email"
                        className="auth-input full"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        aria-invalid={!!error}
                        aria-describedby={error ? "auth-error" : undefined}
                    />

                    <label htmlFor="password" className="visually-hidden">Пароль</label>
                    <input
                        id="password"
                        name="password"
                        className="auth-input full"
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {mode === "register" && (
                        <>
                            <label htmlFor="confirm" className="visually-hidden">Повторите пароль</label>
                            <input
                                id="confirm"
                                name="confirm"
                                className="auth-input full"
                                type="password"
                                placeholder="Повторите пароль"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                            />
                        </>
                    )}

                    <button
                        className="auth-btn wide"
                        type="submit"
                        title={title}
                        aria-label={title}
                        disabled={loading}
                    >
                        {loading ? "..." : title}
                    </button>
                </form>

                

                {error && (
                    <div id="auth-error" className="auth-error" role="alert" aria-live="assertive">
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}
