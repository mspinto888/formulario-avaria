const express = require('express');
const multer = require('multer');
const { Resend } = require('resend');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.static('public'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/submit', upload.array('fotos'), async (req, res) => {
    const dados = req.body;
    const arquivos = req.files;

    try {
        const attachments = arquivos.map(file => ({
            filename: file.originalname,
            content: file.buffer,
        }));

        const data = await resend.emails.send({
            from: 'Relatório Avaria <formulario@seudominio.com>',
            to: 'armas.dap@policiacivil.sp.gov.br',
            subject: 'Novo Relatório de Avaria de Arma',
            html: `
                <h2>Relatório de Avaria</h2>
                <p><strong>Marca:</strong> ${dados.marca}</p>
                <p><strong>Modelo:</strong> ${dados.modelo}</p>
                <p><strong>Calibre:</strong> ${dados.calibre}</p>
                <p><strong>Número de Série:</strong> ${dados.numero_serie}</p>
                <p><strong>Descrição da Avaria:</strong> ${dados.descricao}</p>
                <p><strong>Contexto:</strong> ${dados.contexto}</p>
                <p><strong>Observações:</strong> ${dados.observacoes}</p>
            `,
            attachments
        });

        console.log(data);
        res.redirect('/obrigado.html');

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao enviar e-mail');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});