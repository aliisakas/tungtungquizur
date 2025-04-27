fetch('http://localhost:8080/api/cards')
    .then(response => response.json())
    .then(cards => {
        cards.forEach(card => {
            document.getElementById('cards').innerHTML += `
                <div class="card">
                    <div class="word">${card.word}</div>
                    <div class="translation">${card.translation}</div>
                </div>
            `;
        });
    });