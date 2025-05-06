document.addEventListener('DOMContentLoaded', function() {
    // Проверяем элементы на странице
    const container = document.getElementById('cards-container');
    if (!container) {
        console.error('Контейнер для карточек не найден!');
        return;
    }

    // Функция загрузки карточек
    async function loadCards() {
        try {
            // Показываем состояние загрузки
            container.innerHTML = '<div class="loading">Загрузка карточек...</div>';
            
            // Делаем запрос к серверу
            const response = await fetch('http://localhost:8080/api/cards');
            
            // Проверяем ответ
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            
            // Получаем данные
            const cards = await response.json();
            
            // Проверяем, что карточки получены
            if (!cards || !cards.length) {
                throw new Error('Нет доступных карточек');
            }
            
            // Отображаем карточки
            renderCards(cards);
        } catch (error) {
            console.error('Ошибка:', error);
            container.innerHTML = `
                <div class="error">
                    Ошибка: ${error.message}<br>
                    <button onclick="location.reload()">Попробовать снова</button>
                </div>
            `;
        }
    }

    // Функция отображения карточек
    function renderCards(cards) {
        container.innerHTML = ''; // Очищаем контейнер
        
        cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = `
                <div class="word">${card.word || 'Без названия'}</div>
                <div class="translation hidden">${card.translation || 'Нет перевода'}</div>
                <button class="toggle-btn">Показать перевод</button>
            `;
            
            // Добавляем обработчик для кнопки
            cardElement.querySelector('.toggle-btn').addEventListener('click', function() {
                const translation = this.previousElementSibling;
                translation.classList.toggle('hidden');
                this.textContent = translation.classList.contains('hidden') 
                    ? 'Показать перевод' 
                    : 'Скрыть перевод';
            });
            
            container.appendChild(cardElement);
        });
    }

    // Загружаем карточки при загрузке страницы
    loadCards();
});