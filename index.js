console.clear();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

require('colors')

const app = express();
const port = 3000;

app.use(
  session({
    secret: "SDFG3-480H3-089HG-370G2-0GHGH-2G24G",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));

const cardsFolder = path.join(__dirname, 'public/cards');


app.get('/api/cards', async (req, res) => {
    fs.readdir(cardsFolder, (err, files) => {
        if (err) {
            return res.status(500).send('Erro ao ler a pasta');
        }

        const imageFiles = files
            .filter(file => file.endsWith('.png'))
            .map(file => `/cards/${file}`);  // Ajuste para o caminho correto

        res.json(imageFiles);
    });
});

app.get('/', (req, res) => {
    res.render('index',);
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
