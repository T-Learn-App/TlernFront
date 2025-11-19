import { useState, useEffect, useRef } from 'react'
import './App.css'

import statsIcon from './assets/statistics.svg'
import settingsIcon from './assets/settings.svg'
import exitIcon from './assets/exit.svg'

const cards = [
    {
        word: 'Card',
        transcription: '[kaːrd]',
        pos: 'Noun',
        isNew: true,
        translation: 'карта; открытка'
    },
    {
        word: 'Table',
        transcription: '[ˈteɪbəl]',
        pos: 'Noun',
        isNew: false,
        translation: 'стол; таблица'
    }
]

function App({ userId, onLogout }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)

    const [isDark, setIsDark] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isStatsOpen, setIsStatsOpen] = useState(false)

    const [flipState, setFlipState] = useState("none")

    const settingsRef = useRef(null)
    const statsRef = useRef(null)

    const total = cards.length
    const currentCard = cards[currentIndex]

    useEffect(() => {
        const handleClick = (e) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target)) {
                setIsSettingsOpen(false)
            }
            if (statsRef.current && !statsRef.current.contains(e.target)) {
                setIsStatsOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const changeCard = () => {
        setFlipState("flip-start")

        setTimeout(() => {
            const next = (currentIndex + 1) % total
            setCurrentIndex(next)
            setShowAnswer(false)
            setFlipState("flip-end")

            setTimeout(() => setFlipState("none"), 300)
        }, 300)
    }

    return (
        <div className={`app ${isDark ? 'dark' : ''}`}>
            <div className="container">
                <div className="category">Категория: Простые слова</div>

                {/* КНОПКИ СПРАВА */}
                <div className="top-buttons">

                    {/* Статистика */}
                    <div ref={statsRef} style={{ position: "relative" }}>
                        <button
                            className="icon-btn"
                            onClick={() => setIsStatsOpen((p) => !p)}
                        >
                            <img src={statsIcon} className="icon-img" alt="stats" />
                        </button>

                        {isStatsOpen && (
                            <div className="dropdown-stats">
                                Будет позже
                            </div>
                        )}
                    </div>

                    {/* Настройки */}
                    <div ref={settingsRef} style={{ position: "relative" }}>
                        <button
                            className="icon-btn"
                            onClick={() => setIsSettingsOpen((p) => !p)}
                        >
                            <img src={settingsIcon} className="icon-img" alt="settings" />
                        </button>

                        {isSettingsOpen && (
                            <div className="dropdown-settings">
                                <div className="dropdown-item">
                                    <span>Тёмная тема</span>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={isDark}
                                            onChange={() => setIsDark((p) => !p)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Выход (иконка как у настроек) */}
                    <div style={{ position: "relative" }}>
                        <button
                            className="icon-btn"
                            onClick={() => { if (typeof onLogout === 'function') onLogout() }}
                            title="Выйти"
                            aria-label="Выйти"
                        >
                            <img src={exitIcon} className="icon-img" alt="exit" />
                        </button>
                    </div>

                </div>

                {/* КАРТОЧКА */}
                <div className={`card flip-${flipState}`}>
                    <div className="card-header">
                        <div>
                            <div className="word">{currentCard.word}</div>
                            <div className="transcr">{currentCard.transcription}</div>
                            <div className="pos">{currentCard.pos}</div>
                        </div>

                        {currentCard.isNew && <div className="new-word-dot" />}
                    </div>

                    {currentCard.isNew && (
                        <div className="new-word-label">Новое слово</div>
                    )}

                    <div className="show-area">
                        {!showAnswer ? (
                            <button
                                className="show-btn"
                                onClick={() => setShowAnswer(true)}
                            >
                                <span className="show-icon">👁</span>
                                <span>Показать</span>
                            </button>
                        ) : (
                            <div className="answer">{currentCard.translation}</div>
                        )}
                    </div>

                    <div className="pagination">
                        {currentIndex + 1} / {total}
                    </div>
                </div>

                <div className="bottom-buttons">
                    <button className="yes-btn" onClick={changeCard}>
                        Я уже знаю это слово
                    </button>
                    <button className="no-btn" onClick={changeCard}>
                        Я не знаю это слово
                    </button>
                </div>

            </div>
        </div>
    )
}

export default App
