const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'SEU_EMAIL@gmail.com',
        pass: 'SUA_SENHA_DE_APLICATIVO'
    }
});

app.post('/submit', upload.array('fotos'), (req, res) => {
    const dados = req.body;
    const arquivos = req.files;

    const mailOptions = {
        from: 'SEU_EMAIL@gmail.com',
        to: 'SEU_EMAIL@gmail.com',
        subject: 'Novo Relatório de Avaria de Arma',
        text: `Relatório de Avaria
Identificação da Arma:
- Marca: ${dados.marca}
- Modelo: ${dados.modelo}
- Calibre: ${dados.calibre}
- Nº de Série: ${dados.numero_serie}
- Tipo de Carga: ${dados.tipo_carga}

Detalhes da Avaria:
- Data da Constatação: ${dados.data_constatacao}
- Local da Constatação: ${dados.local_constatacao}
- Descrição: ${dados.descricao}
- Possível Causa: ${dados.causa}
- Contexto: ${dados.contexto}
- Munição Recarregada: ${dados.municao_recarregada}
- Tipo/Quantidade de Munição: ${dados.tipo_municao}

Manutenção Preventiva:
- Limpeza Periódica: ${dados.limpeza}
- Frequência: ${dados.frequencia}
- Produtos e Métodos: ${dados.produtos}
- Data da Última Limpeza: ${dados.ultima_limpeza}

Dados do Policial:
- Nome: ${dados.nome}
- RG: ${dados.rg}
- Unidade: ${dados.unidade}
- Telefone: ${dados.telefone}
- Email: ${dados.email}

Observações:
${dados.observacoes}

Assinatura:
- Local/Data: ${dados.local_data}
- Nome: ${dados.assinatura_nome}
- Cargo/Função: ${dados.assinatura_cargo}
- RG: ${dados.assinatura_rg}
        `,
        attachments: arquivos.map(file => ({
            filename: file.originalname,
            path: file.path
        }))
    };

    transporter.sendMail(mailOptions, (error, info) => {
        arquivos.forEach(file => fs.unlinkSync(file.path));

        if (error) {
            console.error(error);
            res.status(500).send('Erro no envio do email.');
        } else {
            console.log('Email enviado: ' + info.response);
            res.send('Relatório enviado com sucesso!');
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});