import { useState, useEffect, useRef } from 'react'
import './App.css'

import statsIcon from './assets/statistics.svg'
import settingsIcon from './assets/settings.svg'
import exitIcon from './assets/exit.svg'
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const API_URL = "https://49bc691e-65d3-4b10-9f27-c7de532f01f6.mock.pstmn.io/api/words" 

function App({ auth, onLogout } = {}) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)

    const [isDark, setIsDark] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isStatsOpen, setIsStatsOpen] = useState(false)

    const [flipState, setFlipState] = useState("none")

    const [words, setWords] = useState([])
    const [currentCard, setCurrentCard] = useState(null)
    const [device, setDevice] = useState('desktop')
    const [error, setError] = useState("")
    const [stats, setStats] = useState({ total: 0, byDate: {} })
    const settingsRef = useRef(null)
    const statsRef = useRef(null)

    const STATS_KEY = 'tlern_stats'
    const getLocalDateKey = (date = new Date()) => {
        const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        return shifted.toISOString().slice(0, 10)
    }

    // определение device по ширине окна
    useEffect(() => {
        const updateDevice = () => setDevice(window.innerWidth < 600 ? 'mobile' : 'desktop')
        updateDevice()
        window.addEventListener('resize', updateDevice)
        return () => window.removeEventListener('resize', updateDevice)
    }, [])

    // ----- ЗАГРУЗКА 1-го СЛОВА ПРИ ЗАПУСКЕ -----
    useEffect(() => {
        loadWords()
        loadStats()

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
    const mapWord = (word) => ({
        word: word.word,
        transcription: word.transcription,
        pos: word.partOfSpeech || word.pos,
        translation: word.translation,
        categoryName: word.category ?? word.categoryName,
        isNew: true
    })

    const loadStats = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(STATS_KEY) || '{}')
            setStats({
                total: saved.total || 0,
                byDate: saved.byDate || {}
            })
        } catch {
            setStats({ total: 0, byDate: {} })
        }
    }

    const saveStats = (nextStats) => {
        setStats(nextStats)
        try {
            localStorage.setItem(STATS_KEY, JSON.stringify(nextStats))
        } catch {
            // ignore storage errors
        }
    }

    const addKnownWord = () => {
        const key = getLocalDateKey()
        const nextByDate = { ...stats.byDate, [key]: (stats.byDate[key] || 0) + 1 }
        const nextStats = { total: stats.total + 1, byDate: nextByDate }
        saveStats(nextStats)
    }

    const loadWords = () => {
        setError("")
        fetch(API_URL)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.json()
            })
            .then(data => {
                const incoming = Array.isArray(data?.words) ? data.words : Array.isArray(data) ? data : []
                if (!incoming.length) throw new Error("Список слов пуст")
                const mapped = incoming.map(mapWord)
                setWords(mapped)
                setCurrentIndex(0)
                setCurrentCard(mapped[0])
            })
            .catch(err => {
                console.error("Ошибка загрузки:", err)
                setError("Не удалось загрузить слова. Проверьте API_URL или сеть.")
                setCurrentCard(null)
            })
    }

    // ----- ПЕРЕКЛЮЧЕНИЕ КАРТОЧКИ -----
    const changeCard = () => {
        if (!words.length) {
            loadWords()
            return
        }

        const nextIndex = (currentIndex + 1) % words.length
        setFlipState('flip-start')

        setTimeout(() => {
            setCurrentIndex(nextIndex)
            setCurrentCard(words[nextIndex])
            setShowAnswer(false)
            setFlipState("flip-end")

            setTimeout(() => setFlipState('none'), 300)
        }, 300)
    }

    const handleKnown = () => {
        addKnownWord()
        changeCard()
    }

    const handleUnknown = () => {
        changeCard()
    }

    const getLast7DaysStats = () => {
        const result = []
        const today = new Date()
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(today.getDate() - i)
            const key = getLocalDateKey(d)
            result.push({
                label: key.slice(5), // MM-DD
                value: stats.byDate[key] || 0
            })
        }
        return result
    }

    const renderStats = () => {
        const data = getLast7DaysStats()
        const chartData = {
            labels: data.map(d => d.label),
            datasets: [
                {
                    label: 'Изучено за день',
                    data: data.map(d => d.value),
                    backgroundColor: 'rgba(79, 70, 229, 0.8)',
                    borderRadius: 6,
                    borderSkipped: false
                }
            ]
        }

        const chartOptions = {
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.raw ?? 0} слов`
                    }
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }

        return (
            <div className="stats-box">
                <div className="stats-header">
                    <div>Статистика (7 дней)</div>
                    <div className="stats-total">Всего: {stats.total}</div>
                </div>
                <div className="stats-chart" aria-label="График изученных слов за 7 дней">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>
        )
    }

    if (!currentCard) return (
        <div className="app">
            <div className="container">
                <div style={{ marginTop: 40, textAlign: "center" }}>
                    <div>Загрузка...</div>
                    {error && <div style={{ marginTop: 12, color: "#c53030" }}>{error}</div>}
                    <button className="show-btn" style={{ marginTop: 12 }} onClick={loadWords}>Повторить запрос</button>
                </div>
            </div>
        </div>
    )

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
                        <div ref={statsRef} className="dropdown-wrapper">
                            <button
                                className="icon-btn"
                                onClick={() => setIsStatsOpen(p => !p)}
                            >
                                <img src={statsIcon} className="icon-img" alt="stats" />
                            </button>

                            {isStatsOpen && (
                                <div className="dropdown-stats">
                                    {renderStats()}
                                </div>
                            )}
                        </div>

                        {/* Настройки */}
                        <div ref={settingsRef} className="dropdown-wrapper">
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
                    <button className="yes-btn" onClick={handleKnown}>
                        Я уже знаю это слово
                    </button>
                    <button className="no-btn" onClick={handleUnknown}>
                        Я не знаю это слово
                    </button>
                </div>

            </div>
        </div>
    )
}

export default App
