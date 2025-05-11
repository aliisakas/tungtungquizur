document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы DOM
    const wordElement = document.getElementById('word');
    const translationElement = document.getElementById('translation');
    const showTranslationBtn = document.getElementById('show-translation');
    const responseButtons = document.getElementById('response-buttons');
    const wrongBtn = document.getElementById('wrong-btn');
    const correctBtn = document.getElementById('correct-btn');
    const continueBtn = document.getElementById('continue-btn');
    const congratsModal = document.getElementById('congrats-modal');
    const topicsContainer = document.getElementById('topics-container');
    const nextReviewTime = document.getElementById('next-review-time');
    const currentInterval = document.getElementById('current-interval');

    // Состояние приложения
    let currentCardIndex = 0;
    let cards = [];
    let currentTopic = null;
    let topics = [];
    let initialCardsCount = 0; // Начальное количество карточек для повторения
    let completedCards = 0; // Количество обработанных карточек

    // Интервалы повторения (в минутах)
    const REPETITION_INTERVALS = {
        NEW: 0,        // Новая карточка
        SHORT: 1,      // 1 минута
        MEDIUM: 5,     // 5 минут
        LONG: 30,      // 30 минут
        VERY_LONG: 1440 // 24 часа
    };

    // Форматирование времени
    function formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes} мин`;
        } else if (minutes < 1440) {
            return `${Math.floor(minutes / 60)} ч`;
        } else {
            return `${Math.floor(minutes / 1440)} дн`;
        }
    }

    // Загрузка прогресса из localStorage
    function loadProgress() {
        try {
            const savedProgress = localStorage.getItem('cardsProgress');
            console.log('Загруженный прогресс:', savedProgress);
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                console.log('Распарсенный прогресс:', progress);
                return progress;
            }
            return {};
        } catch (error) {
            console.error('Ошибка загрузки прогресса:', error);
            return {};
        }
    }

    // Сохранение прогресса в localStorage
    function saveProgress(progress) {
        try {
            console.log('Сохраняемый прогресс:', progress);
            localStorage.setItem('cardsProgress', JSON.stringify(progress));
            console.log('Прогресс сохранен');
        } catch (error) {
            console.error('Ошибка сохранения прогресса:', error);
        }
    }

    // Инициализация приложения
    function init() {
        loadTopics();
        setupEventListeners();
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        showTranslationBtn.addEventListener('click', showTranslation);
        wrongBtn.addEventListener('click', () => handleCardResponse(false));
        correctBtn.addEventListener('click', () => handleCardResponse(true));
        continueBtn.addEventListener('click', hideCongratsModal);
        
        // Добавляем обработчик для кнопки сброса прогресса
        document.getElementById('reset-progress').addEventListener('click', resetProgress);
    }

    // Загрузка списка тем
    async function loadTopics() {
        try {
            const response = await fetch('http://localhost:8080/api/topics');
            topics = await response.json();
            renderTopicButtons();
            if (topics.length > 0) selectTopic(topics[0]);
        } catch (error) {
            console.error('Ошибка загрузки тем:', error);
        }
    }

    // Отрисовка кнопок тем
    function renderTopicButtons() {
        topicsContainer.innerHTML = '';
        topics.forEach(topic => {
            const btn = document.createElement('button');
            btn.className = 'topic-tab';
            btn.textContent = topic;
            btn.addEventListener('click', () => selectTopic(topic));
            topicsContainer.appendChild(btn);
        });
    }

    // Выбор темы
    async function selectTopic(topic) {
        console.log('Выбор темы:', topic);
        currentTopic = topic;
        updateActiveTab(); // Обновляем активную вкладку сразу при выборе темы
        
        try {
            const response = await fetch(`http://localhost:8080/api/cards/${topic}`);
            const allCards = await response.json();
            console.log('Загруженные карточки:', allCards);
            
            // Загружаем сохраненный прогресс
            const progress = loadProgress();
            console.log('Загруженный прогресс для темы:', progress);
            
            // Обновляем прогресс карточек
            allCards.forEach(card => {
                const progressKey = `${topic}_${card.id}`;
                console.log('Проверка прогресса для карточки:', progressKey);
                const savedProgress = progress[progressKey];
                
                if (savedProgress) {
                    console.log('Найден сохраненный прогресс:', savedProgress);
                    card.progress = {
                        interval: savedProgress.interval || 0,
                        nextReview: savedProgress.nextReview || null
                    };
                } else {
                    console.log('Создание нового прогресса для карточки');
                    card.progress = {
                        interval: 0,
                        nextReview: null
                    };
                }
            });
            
            // Фильтруем карточки, оставляя только те, которые нужно повторить
            const now = Date.now();
            cards = allCards.filter(card => {
                return !card.progress.nextReview || card.progress.nextReview <= now;
            });
            
            // Сохраняем начальное количество карточек для повторения
            initialCardsCount = cards.length;
            completedCards = 0;
            
            if (cards.length === 0) {
                // Если нет карточек для повторения, показываем сообщение
                wordElement.textContent = "Нет карточек для повторения";
                translationElement.textContent = "Вернитесь позже";
                showTranslationBtn.style.display = 'none';
                responseButtons.style.display = 'none';
                document.getElementById('repetition-info').style.display = 'none';
                document.querySelector('.progress-container').style.display = 'none';
                return;
            }
            
            // Показываем блок с информацией о повторении и прогресс-бар
            document.getElementById('repetition-info').style.display = 'block';
            document.querySelector('.progress-container').style.display = 'flex';
            
            // Сортируем карточки по времени следующего повторения
            cards.sort((a, b) => {
                const timeA = a.progress.nextReview || 0;
                const timeB = b.progress.nextReview || 0;
                return timeA - timeB;
            });
            
            console.log('Отсортированные карточки:', cards);
            
            currentCardIndex = 0;
            showCard();
        } catch (error) {
            console.error('Ошибка загрузки карточек:', error);
        }
    }

    // Обновление активной вкладки темы
    function updateActiveTab() {
        document.querySelectorAll('.topic-tab').forEach(btn => {
            if (btn.textContent === currentTopic) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Показать текущую карточку
    function showCard() {
        if (cards.length === 0) return;
        const card = cards[currentCardIndex];
        wordElement.textContent = card.word;
        translationElement.textContent = '';
        translationElement.style.display = 'none';
        responseButtons.style.display = 'none';
        showTranslationBtn.style.display = 'block';
        updateProgress();
        updateRepetitionInfo(card);
    }

    // Обновление информации о повторении
    function updateRepetitionInfo(card) {
        const interval = card.progress.interval;
        const nextReview = card.progress.nextReview;
        
        currentInterval.textContent = formatTime(interval);
        
        if (nextReview) {
            const now = Date.now();
            const timeLeft = Math.max(0, nextReview - now);
            const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
            nextReviewTime.textContent = formatTime(minutesLeft);
        } else {
            nextReviewTime.textContent = 'Сейчас';
        }
    }

    // Показать перевод
    function showTranslation() {
        if (cards.length === 0) return;
        const card = cards[currentCardIndex];
        translationElement.textContent = card.translation;
        translationElement.style.display = 'block';
        showTranslationBtn.style.display = 'none';
        responseButtons.style.display = 'flex';
    }

    // Обработка ответа пользователя
    function handleCardResponse(isCorrect) {
        if (cards.length === 0) return;
        
        const card = cards[currentCardIndex];
        
        // Обновляем интервал повторения
        updateCardInterval(card, isCorrect);
        
        // Увеличиваем счетчик обработанных карточек
        completedCards++;
        
        // Удаляем текущую карточку из списка
        cards.splice(currentCardIndex, 1);
        
        if (cards.length === 0) {
            // Если больше нет карточек для повторения
            wordElement.textContent = "Нет карточек для повторения";
            translationElement.textContent = "Вернитесь позже";
            showTranslationBtn.style.display = 'none';
            responseButtons.style.display = 'none';
            document.getElementById('repetition-info').style.display = 'none';
            document.querySelector('.progress-container').style.display = 'none';
            return;
        }
        
        // Если мы дошли до конца списка, сбрасываем индекс
        if (currentCardIndex >= cards.length) {
            currentCardIndex = 0;
        }
        
        // Показываем следующую карточку
        showCard();
    }

    // Обновление интервала повторения карточки
    function updateCardInterval(card, isCorrect) {
        const currentInterval = card.progress.interval;
        let newInterval;

        if (isCorrect) {
            // Увеличиваем интервал при правильном ответе
            switch (currentInterval) {
                case REPETITION_INTERVALS.NEW:
                    newInterval = REPETITION_INTERVALS.SHORT;
                    break;
                case REPETITION_INTERVALS.SHORT:
                    newInterval = REPETITION_INTERVALS.MEDIUM;
                    break;
                case REPETITION_INTERVALS.MEDIUM:
                    newInterval = REPETITION_INTERVALS.LONG;
                    break;
                case REPETITION_INTERVALS.LONG:
                    newInterval = REPETITION_INTERVALS.VERY_LONG;
                    break;
                default:
                    newInterval = REPETITION_INTERVALS.VERY_LONG;
            }
        } else {
            // Сбрасываем интервал при неправильном ответе
            newInterval = REPETITION_INTERVALS.NEW;
        }

        // Обновляем данные карточки
        card.progress.interval = newInterval;
        card.progress.nextReview = Date.now() + (newInterval * 60 * 1000);

        // Сохраняем изменения
        saveCardProgress(card);
    }

    // Сохранение прогресса карточки
    async function saveCardProgress(card) {
        try {
            console.log('Сохранение прогресса карточки:', card);
            
            // Сохраняем на сервере
            const response = await fetch(`http://localhost:8080/api/cards/${currentTopic}/${card.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    progress: {
                        interval: card.progress.interval,
                        nextReview: card.progress.nextReview
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Ошибка сохранения на сервере');
            }

            // Сохраняем в localStorage
            const progress = loadProgress();
            const progressKey = `${currentTopic}_${card.id}`;
            progress[progressKey] = {
                interval: card.progress.interval,
                nextReview: card.progress.nextReview
            };
            console.log('Обновленный прогресс для сохранения:', progress);
            saveProgress(progress);
        } catch (error) {
            console.error('Ошибка сохранения прогресса:', error);
        }
    }

    // Обновление прогресс-бара
    function updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        // Вычисляем процент прогресса на основе начального количества карточек
        const progressPercent = (completedCards / initialCardsCount) * 100;
        
        // Обновляем прогресс-бар с анимацией
        progressFill.style.transition = 'width 0.3s ease';
        progressFill.style.width = `${progressPercent}%`;
        
        // Обновляем текст прогресса
        progressText.textContent = `${completedCards}/${initialCardsCount}`;
        
        // Меняем цвет при завершении
        if (progressPercent >= 100) {
            progressFill.style.background = '#27ae60';
        } else {
            progressFill.style.background = '#2ecc71';
        }
    }

    // Показать модальное окно завершения
    function showCongratsModal() {
        document.getElementById('congrats-title').textContent = `Тема "${currentTopic}" завершена!`;
        document.getElementById('congrats-message').textContent = `Вы изучили ${cards.length} слов`;
        congratsModal.classList.add('active');
    }

    // Скрыть модальное окно
    function hideCongratsModal() {
        congratsModal.classList.remove('active');
    }

    // Функция сброса прогресса
    function resetProgress() {
        if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
            // Очищаем localStorage
            localStorage.removeItem('cardsProgress');
            
            // Перезагружаем текущую тему
            if (currentTopic) {
                selectTopic(currentTopic);
            }
        }
    }

    // Запуск приложения
    init();
});