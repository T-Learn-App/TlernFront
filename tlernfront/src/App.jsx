import { useState, useEffect, useRef } from 'react'
import './App.css'

import statsIcon from './assets/statistics.svg'
import settingsIcon from './assets/settings.svg'
import exitIcon from './assets/exit.svg'

const API_URL = "https://b753f001-28d3-4584-916d-1b3b8654dd6a.mock.pstmn.io/api/words" 

function App({ onLogout } = {}) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)

    const [isDark, setIsDark] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isStatsOpen, setIsStatsOpen] = useState(false)

    const [flipState, setFlipState] = useState("none")

    // добавлены состояния/переменные, которых не хватало
    const [currentCard, setCurrentCard] = useState(null)
    const [device, setDevice] = useState('desktop')

    const settingsRef = useRef(null)
    const statsRef = useRef(null)

    // определение device по ширине окна
    useEffect(() => {
        const updateDevice = () => setDevice(window.innerWidth < 600 ? 'mobile' : 'desktop')
        updateDevice()
        window.addEventListener('resize', updateDevice)
        return () => window.removeEventListener('resize', updateDevice)
    }, [])

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

        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    // ----- ФУНКЦИЯ ЗАГРУЗКИ СЛОВА ----- 
    const loadWord = () => {
        fetch(API_URL)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json()
            })
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
        setFlipState('flip-start')

        setTimeout(() => {
            loadWord()
            setShowAnswer(false)
            setFlipState("flip-end")

            setTimeout(() => setFlipState('none'), 300)
        }, 300)
    }

    if (!currentCard) return <div>Загрузка...</div>

    return (
        <div className={`app ${isDark ? 'dark' : ''} device-${device}`}>
            <div className="container">

                {/* ВЕРХНИЙ РЯД: категория + иконки */}
                <div className="top-row">
                    <div className="category">
                        Простые слова
                    </div>

                    <div className="top-buttons">
                        {/* Статистика */}
                        <div ref={statsRef}>
                            <button
                                className="icon-btn"
                                onClick={() => setIsStatsOpen(p => !p)}
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
                        <div ref={settingsRef}>
                            <button
                                className="icon-btn"
                                onClick={() => setIsSettingsOpen(p => !p)}
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
                                                onChange={() => setIsDark(p => !p)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Выход (рендерится только если передан обработчик) */}
                        {typeof onLogout === 'function' && (
                            <div>
                                <button
                                    className="icon-btn"
                                    onClick={() => onLogout()}
                                    title="Выйти"
                                    aria-label="Выйти"
                                >
                                    <img src={exitIcon} className="icon-img" alt="exit" />
                                </button>
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
                                <span className="show-icon" />
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
