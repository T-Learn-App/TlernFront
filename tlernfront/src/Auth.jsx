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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="3 3 16 16"
                            fill="currentColor"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path fill="#000000" d="M10.707 6.293a1 1 0 0 0-1.414 1.414L13.586 12l-4.293 4.293a1 1 0 1 0 1.414 1.414L15 13.414a2 2 0 0 0 0-2.828l-4.293-4.293Z" />
                        </svg>
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
