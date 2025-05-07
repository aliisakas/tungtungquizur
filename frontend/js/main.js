/*
 * main.js - Логика главной страницы
 * 
 * Обеспечивает:
 * 1. Переход на страницу карточек
 * 2. Загрузку последней активной темы (если есть)
 * 3. Отображение прогресса пользователя
 */

// Ждем полной загрузки DOM перед выполнением скрипта
document.addEventListener('DOMContentLoaded', () => {
    
    /**
     * Обработчик кнопки "Начать" - переход на страницу карточек
     * (Полностью сохранен оригинальный код)
     */
    const startButton = document.getElementById('start-btn');
    startButton.addEventListener('click', function() {
        // Переход на страницу с карточками
        window.location.href = 'cards.html';
    });

    

    /**
     * Загружает прогресс пользователя из localStorage
     * (Новая функция, не влияет на основной поток)
     */
    function loadUserProgress() {
        try {
            const progress = localStorage.getItem('languageCardsProgress');
            if (progress) {
                const { lastTopic, completedTopics } = JSON.parse(progress);
                
                // Можно добавить отображение прогресса на главной странице
                console.log(`Последняя тема: ${lastTopic || 'не выбрана'}`);
                console.log(`Пройдено тем: ${completedTopics?.length || 0}`);
            }
        } catch (error) {
            console.error('Ошибка загрузки прогресса:', error);
        }
    }

    /**
     * Создает кнопки быстрого доступа к темам
     * (Дополнительная функциональность)
     */
    function createQuickAccessButtons() {
        const quickAccessContainer = document.createElement('div');
        quickAccessContainer.className = 'quick-access';
        quickAccessContainer.innerHTML = `
            <p>Продолжить изучение:</p>
            <!-- Кнопки будут добавлены динамически -->
        `;
        
        // Можно добавить кнопки для быстрого доступа
        document.querySelector('.app').appendChild(quickAccessContainer);
    }

    
    
    // Загружаем прогресс пользователя (не блокирует основной функционал)
    loadUserProgress();
    
    /* 
     * По желанию можно раскомментировать:
     * createQuickAccessButtons(); 
     * Это добавит кнопки быстрого доступа к темам
     */

    // Для отладки
    console.log('Скрипт главной страницы загружен');
});