document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы DOM
    const wordElement = document.getElementById('word');
    const translationElement = document.getElementById('translation');
    const showTranslationBtn = document.getElementById('show-translation');
    const nextCardBtn = document.getElementById('next-card');

    // Создаем контейнер для тем (добавляем динамически)
    const topicsContainer = document.createElement('div');
    topicsContainer.className = 'topics-container';
    document.querySelector('.card-container').prepend(topicsContainer);

    // Состояние приложения
    let currentCardIndex = 0;
    let cards = [];
    let currentTopic = null;
    let topics = [];

   
    /**
     * Загрузка карточек с сервера
     * (Оригинальная функция, работает с /api/cards)
     */
    async function loadCards() {
        try {
            const response = await fetch('http://localhost:8080/api/cards');
            cards = await response.json();
            showCard();
        } catch (error) {
            wordElement.textContent = 'Ошибка загрузки карточек';
            console.error('Error:', error);
        }
    }

    /*
    Показать текущую карточку
     */
    function showCard() {
        if (cards.length === 0) return;

        const card = cards[currentCardIndex];
        wordElement.textContent = card.word;
        translationElement.textContent = '';
        translationElement.style.display = 'none';
    }

    /*
    Показать перевод текущей карточки
     */
    showTranslationBtn.addEventListener('click', () => {
        if (cards.length === 0) return;
        const card = cards[currentCardIndex];
        translationElement.textContent = card.translation;
        translationElement.style.display = 'block';
    });

    /*
    Переключение на следующую карточку
    */
    nextCardBtn.addEventListener('click', () => {
        if (cards.length === 0) return;
        
        currentCardIndex = (currentCardIndex + 1) % cards.length;
        showCard();
        
        // Обновляем прогресс (новая функциональность)
        updateProgress();
    });

    // ========================
    // НОВЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ТЕМАМИ
    // ========================

    /*
     Загружает список доступных тем с сервера
     */
    async function loadTopics() {
        try {
            const response = await fetch('http://localhost:8080/api/topics');
            topics = await response.json();
            renderTopicButtons();
        } catch (error) {
            console.error('Ошибка загрузки тем:', error);
        }
    }

    /*
    Создает кнопки для выбора тем
     */
    function renderTopicButtons() {
        topicsContainer.innerHTML = '';
        topics.forEach(topic => {
            const btn = document.createElement('button');
            btn.className = 'topic-tab';
            btn.textContent = topic;
            btn.addEventListener('click', () => selectTopic(topic));
            topicsContainer.appendChild(btn);
        });
        
        // Выбираем первую тему по умолчанию
        if (topics.length > 0) selectTopic(topics[0]);
    }

    /*
    Загружает карточки выбранной темы
    @param {string} topic - Название темы
     */
    async function selectTopic(topic) {
        currentTopic = topic;
        try {
            const response = await fetch(`http://localhost:8080/api/cards/${topic}`);
            cards = await response.json();
            currentCardIndex = 0;
            showCard();
            updateActiveTab();
            updateProgress();
        } catch (error) {
            console.error('Ошибка загрузки карточек темы:', error);
        }
    }

    /*
    Обновляет активную кнопку темы
     */
    function updateActiveTab() {
        document.querySelectorAll('.topic-tab').forEach(btn => {
            btn.classList.toggle('active', btn.textContent === currentTopic);
        });
    }

    /*
     Обновляет прогресс-бар (новая функциональность)
     */
    function updateProgress() {
        const progress = (currentCardIndex / cards.length) * 100;
        console.log(`Прогресс: ${progress.toFixed(1)}%`); // Можно заменить на реальный прогресс-бар
    }

    // ========================
    // ИНИЦИАЛИЗАЦИЯ
    // ========================

    // Загружаем темы и карточки (сохраняем оригинальный вызов loadCards())
    loadTopics();
    loadCards(); // Для совместимости со старым кодом
});