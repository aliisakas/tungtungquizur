document.addEventListener('DOMContentLoaded', () => {
    const wordElement = document.getElementById('word');
    const translationElement = document.getElementById('translation');
    const showTranslationBtn = document.getElementById('show-translation');
    const nextCardBtn = document.getElementById('next-card');

    let currentCardIndex = 0;
    let cards = [];

    // Загрузка карточек с сервера
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

    // Показать текущую карточку
    function showCard() {
        if (cards.length === 0) return;

        const card = cards[currentCardIndex];
        wordElement.textContent = card.word;
        translationElement.textContent = '';
        translationElement.style.display = 'none';
    }

    // Показать перевод
    showTranslationBtn.addEventListener('click', () => {
        if (cards.length === 0) return;
        const card = cards[currentCardIndex];
        translationElement.textContent = card.translation;
        translationElement.style.display = 'block';
    });

    // Следующая карточка
    nextCardBtn.addEventListener('click', () => {
        if (cards.length === 0) return;
        
        currentCardIndex = (currentCardIndex + 1) % cards.length;
        showCard();
    });

    // Инициализация
    loadCards();
});