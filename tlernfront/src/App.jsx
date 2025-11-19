import { useState, useEffect, useRef } from 'react'
import './App.css'

import statsIcon from './assets/statistics.svg'
import settingsIcon from './assets/settings.svg'

const API_URL = "https://b753f001-28d3-4584-916d-1b3b8654dd6a.mock.pstmn.io/api/words"


function App() {

    const [currentCard, setCurrentCard] = useState(null)
    const [showAnswer, setShowAnswer] = useState(false)

    const [isDark, setIsDark] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isStatsOpen, setIsStatsOpen] = useState(false)

    const [flipState, setFlipState] = useState("none")

    const settingsRef = useRef(null)
    const statsRef = useRef(null)

    // ----- ЗАГРУЗКА 1-го СЛОВА ПРИ ЗАПУСКЕ -----
    useEffect(() => {
        loadWord()

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

    // ----- ФУНКЦИЯ ЗАГРУЗКИ СЛОВА ----- 
    const loadWord = () => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                setCurrentCard({
                    word: data.word,
                    transcription: data.transcription,
                    pos: data.partOfSpeech,
                    translation: data.translation,
                    categoryName: data.categoryName,
                    isNew: true
                })
            })
            .catch(err => console.error("Ошибка загрузки:", err))
    }

    // ----- ПЕРЕКЛЮЧЕНИЕ КАРТОЧКИ -----
    const changeCard = () => {
        setFlipState("flip-start")

        setTimeout(() => {
            loadWord()
            setShowAnswer(false)

            setFlipState("flip-end")
            setTimeout(() => setFlipState("none"), 250)
        }, 250)
    }

    if (!currentCard) return <div>Загрузка...</div>

    return (
        <div className={`app ${isDark ? 'dark' : ''}`}>
            <div className="container">

                <div className="category">
                    Категория: {currentCard.categoryName}
                </div>

                {/* СПРАВЫЕ КНОПКИ */}
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
                            <div className="dropdown-stats">Будет позже</div>
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
                            <div className="answer">
                                {currentCard.translation}
                            </div>
                        )}
                    </div>
                </div>

                {/* КНОПКИ ВНИЗУ */}
                <div className="bottom-buttons">
                    <button className="yes-btn" onClick={changeCard}>
                        Я знаю это слово
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
