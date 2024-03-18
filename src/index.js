const express = require('express');
const router = require('./routes/router');

const app = express();

app.use(express.json());
app.use(router);

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
