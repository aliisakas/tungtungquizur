/**
 * main.js - Логика главной страницы
 * 
 * Просто обеспечивает переход на страницу карточек.
 * Никакой дополнительной логики не требуется.
 */

document.getElementById('start-btn').addEventListener('click', function() {
    window.location.href = 'cards.html';
});