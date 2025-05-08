document.addEventListener('DOMContentLoaded', () => {
    // Получаем элементы DOM
    const wordElement = document.getElementById('word');
    const translationElement = document.getElementById('translation');
    const showTranslationBtn = document.getElementById('show-translation');
    const nextCardBtn = document.getElementById('next-card');
    const continueBtn = document.getElementById('continue-btn');
    const congratsModal = document.getElementById('congrats-modal');
    const topicsContainer = document.getElementById('topics-container');

    // Состояние приложения
    let currentCardIndex = 0;
    let cards = [];
    let currentTopic = null;
    let topics = [];

    // Инициализация приложения
    function init() {
        loadTopics();
        setupEventListeners();
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        showTranslationBtn.addEventListener('click', showTranslation);
        nextCardBtn.addEventListener('click', nextCard);
        continueBtn.addEventListener('click', hideCongratsModal);
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
        currentTopic = topic;
        try {
            const response = await fetch(`http://localhost:8080/api/cards/${topic}`);
            cards = await response.json();
            currentCardIndex = 0;
            updateActiveTab();
            showCard();
        } catch (error) {
            console.error('Ошибка загрузки карточек:', error);
        }
    }

    // Обновление активной вкладки темы
    function updateActiveTab() {
        document.querySelectorAll('.topic-tab').forEach(btn => {
            btn.classList.toggle('active', btn.textContent === currentTopic);
        });
    }

    // Показать текущую карточку
    function showCard() {
        if (cards.length === 0) return;
        const card = cards[currentCardIndex];
        wordElement.textContent = card.word;
        translationElement.textContent = '';
        translationElement.style.display = 'none';
        updateProgress();
    }

    // Показать перевод
    function showTranslation() {
        if (cards.length === 0) return;
        const card = cards[currentCardIndex];
        translationElement.textContent = card.translation;
        translationElement.style.display = 'block';
    }

    // Следующая карточка
    function nextCard() {
        if (cards.length === 0) return;
        
        currentCardIndex = (currentCardIndex + 1) % cards.length;
        
        if (currentCardIndex === 0) {
            showCongratsModal();
        }
        
        showCard();
    }

    // Обновление прогресс-бара
    function updateProgress() {
        const progressPercent = ((currentCardIndex + 1) / cards.length) * 100;
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        progressFill.style.width = `${progressPercent}%`;
        progressText.textContent = `${currentCardIndex + 1}/${cards.length}`;
        
        if (progressPercent >= 100) {
            progressFill.style.background = '#27ae60';
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

    // Запуск приложения
    init();
});