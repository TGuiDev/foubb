const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",  // Permite conexões de qualquer origem (necessário para o OnRender)
        methods: ["GET", "POST"]
    }
});

// Caminho da pasta onde estão as cartas
const cardsFolder = path.join(__dirname, 'public/cards');

// Servir os arquivos estáticos
app.use(express.static('public'));

app.get('/api/cards', (req, res) => {
    fs.readdir(cardsFolder, (err, files) => {
        if (err) {
            return res.status(500).send('Erro ao ler a pasta');
        }
        
        // Filtra os arquivos para pegar apenas imagens PNG
        const imageFiles = files.filter(file => file.endsWith('.png')).map(file => `/cards/${file}`);
        
        res.json(imageFiles); // Envia a lista de imagens como resposta
    });
});

// Rota para servir a página HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});
// Lista de cartas disponíveis
let availableCards = [];

// Função para carregar as cartas (arquivos PNG)
function loadCards() {
    const cardsDir = path.join(__dirname, 'public', 'cards');
    
    // Lê todos os arquivos da pasta 'cards'
    fs.readdir(cardsDir, (err, files) => {
        if (err) {
            console.error('Erro ao ler a pasta de cartas:', err);
            return;
        }

        // Filtra apenas os arquivos PNG
        availableCards = files.filter(file => file.endsWith('.png'));
        console.log(`Cartas carregadas: ${availableCards.length}`);
    });
}

// Função para sortear uma carta aleatória
function getRandomCard() {
    if (availableCards.length === 0) {
        io.emit('noMoreCards', 'Todas as cartas já foram sorteadas!');
        return;
    }

    // Escolhe uma carta aleatória
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const randomCard = availableCards[randomIndex];

    // Remove a carta sorteada da lista
    availableCards.splice(randomIndex, 1);
    
    // Caminho completo da carta
    const cardPath = path.join('cards', randomCard);  // Usando caminho relativo para servir a imagem
    console.log('Carta sorteada:', cardPath);

    // Envia a carta sorteada para todos os jogadores
    io.emit('newCard', cardPath);
}

// Função para resetar o jogo
function resetGame() {
    loadCards(); // Recarrega as cartas
}

// Quando um jogador se conecta
io.on('connection', (socket) => {
    console.log('Novo jogador conectado');

    // Quando um jogador clicar no monte
    socket.on('clickMonte', () => {
        getRandomCard(); // Sorteia e envia uma carta
    });

    // Quando um jogador pedir para reiniciar o jogo
    socket.on('resetGame', () => {
        resetGame(); // Reseta as cartas e o jogo
    });

    // Quando um jogador sai
    socket.on('disconnect', () => {
        console.log('Jogador desconectado');
    });
});

// Inicia o servidor na porta especificada pelo OnRender
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    loadCards(); // Carregar as cartas ao iniciar o servidor
});
