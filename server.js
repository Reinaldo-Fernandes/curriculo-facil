const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(bodyParser.json());

const configuration = new Configuration({
    apiKey: 'YOUR_OPENAI_API_KEY',
});
const openai = new OpenAIApi(configuration);

app.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Crie uma descrição de experiência para um currículo com base no seguinte: ${prompt}`,
        max_tokens: 150,
    });

    res.json(response.data.choices[0].text);
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
