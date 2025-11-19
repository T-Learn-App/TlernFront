import { useState } from "react"
import "./App.css"

export default function Auth({ onLogin }) {
    const [userId, setUserId] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = (e) => {
        e.preventDefault()
        const id = userId.trim()
        if (!id) {
            setError("Введите Почту")
            return
        }
        setError("")
        if (typeof onLogin === "function") {
            onLogin(id)
        } else {
            // Для разработки: просто логируем, если колбек не передан
            console.log("Logged in as", id)
        }
    }

    return (
        <div className="app">
            <div className="auth-card" role="region" aria-labelledby="auth-title">
                <h1 id="auth-title" className="auth-title">Вход в T-Lern</h1>

                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <label htmlFor="userId" className="visually-hidden"></label>
                    <input
                        id="userId"
                        name="userId"
                        className="auth-input"
                        type="text"
                        placeholder="UserID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        autoFocus
                        aria-invalid={!!error}
                        aria-describedby={error ? "auth-error" : undefined}
                    />

                    <button
                        className="auth-btn"
                        type="submit"
                        title="Войти"
                        aria-label="Войти"
                    >
                        ➜
                    </button>
                </form>

                {error && (
                    <div id="auth-error" style={{ color: "#c53030", marginTop: 12 }} role="alert" aria-live="assertive">
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}
