const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// 1. Configura a pasta 'src' para ser servida estaticamente (CSS, JS, Imagens).
// Isso resolve o erro 404 nos seus arquivos de design.
app.use(express.static(path.join(__dirname, 'src')));

// 2. Configura a raiz do projeto para servir index.html e 404.html
app.use(express.static(path.join(__dirname))); 

// Rota principal para index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Middleware 404: Captura qualquer URL que não foi tratada acima.
app.use((req, res) => {
    // Define explicitamente o código de status HTTP 404
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(port, () => {
    console.log(`Express Server rodando em http://localhost:${port}`);
    console.log(`✅ Para testar o 404, acesse http://localhost:${port}/pagina-que-nao-existe`);
});