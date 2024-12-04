const socket = io();
const playerNameInput = document.getElementById('playerName');
const joinButton = document.getElementById('joinButton');
const gameArea = document.getElementById('gameArea');
const playersUl = document.getElementById('playersUl');
const monte = document.getElementById('monte');
const cartaDisplay = document.getElementById('carta');

joinButton.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        socket.emit('joinGame', playerName);
        document.getElementById('joinForm').style.display = 'none';
        gameArea.style.display = 'block';
    }
});

socket.on('updatePlayers', (players) => {
    playersUl.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player.name;
        playersUl.appendChild(li);
    });
});

monte.addEventListener('click', () => {
    socket.emit('clickMonte');
});

socket.on('newCard', (card) => {
    cartaDisplay.style.display = 'block';
    cartaDisplay.textContent = card;
});
