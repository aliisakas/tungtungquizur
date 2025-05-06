/**
 * main.js - Логика главной страницы
 * 
 * Просто обеспечивает переход на страницу карточек.
 * Никакой дополнительной логики не требуется.
 */

// Ждем полной загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Главная страница загружена');
    
    // Можно добавить анимацию кнопки при желании
    const startBtn = document.querySelector('.btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            console.log('Переход на страницу карточек');
        });
    }
});