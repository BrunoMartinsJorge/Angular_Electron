const { app: electronApp, BrowserWindow } = require("electron");
const path = require("path");
const url = require("url");
const express = require("express");
const Database = require("better-sqlite3");
const cors = require("cors");
const fs = require("fs");
const { google } = require("googleapis");

const userDataPath = electronApp.getPath("userData");
const dbPath = path.join(userDataPath, "banco.db");
const db = new Database(dbPath);


try {
  db.prepare("ALTER TABLE Formulario ADD COLUMN formId TEXT").run();
} catch (err) {

}

db.prepare(
  `
CREATE TABLE IF NOT EXISTS Formulario (
  idFormulario INTEGER PRIMARY KEY AUTOINCREMENT,
  Titulo VARCHAR(75),
  Descricao TEXT,
  Data_Criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  Link_Url TEXT,
  formId TEXT
);
`
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS Tipo_Pergunta (
  idTipo_Pergunta INTEGER PRIMARY KEY AUTOINCREMENT,
  Descricao TEXT
);
`
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS Pergunta (
  idPergunta INTEGER PRIMARY KEY AUTOINCREMENT,
  Tipo_Pergunta_idTipo_Pergunta INTEGER,
  Formulario_idFormulario INTEGER,
  Titulo VARCHAR(255),
  Descricao TEXT,
  Obrigatorio BOOLEAN,
  Favorita BOOLEAN,
  FOREIGN KEY (Tipo_Pergunta_idTipo_Pergunta) REFERENCES Tipo_Pergunta(idTipo_Pergunta),
  FOREIGN KEY (Formulario_idFormulario) REFERENCES Formulario(idFormulario)
);
`
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS Alternativa (
  idAlternativa INTEGER PRIMARY KEY AUTOINCREMENT,
  Pergunta_idPergunta INTEGER,
  Texto TEXT,
  FOREIGN KEY (Pergunta_idPergunta) REFERENCES Pergunta(idPergunta)
);
`
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS Participante (
  idParticipante INTEGER PRIMARY KEY AUTOINCREMENT,
  Nome TEXT,
  Email TEXT
);
`
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS Resposta (
  idResposta INTEGER PRIMARY KEY AUTOINCREMENT,
  Participante_idParticipante INTEGER,
  Pergunta_idPergunta INTEGER,
  Valor TEXT,
  Data_Resposta DATE,
  FOREIGN KEY (Participante_idParticipante) REFERENCES Participante(idParticipante),
  FOREIGN KEY (Pergunta_idPergunta) REFERENCES Pergunta(idPergunta)
);
`
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  accessToken TEXT NOT NULL,
  refreshToken TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiryDate INTEGER NOT NULL
);
`
).run();

const devPath = path.join(__dirname, 'client_secret.json');
const prodPath = path.join(process.resourcesPath, 'client_secret.json');

const keyPath = fs.existsSync(devPath) ? devPath : prodPath;

const keys = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));

const oAuth2Client = new google.auth.OAuth2(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[0]
);

const SCOPES = [
  "https://www.googleapis.com/auth/forms.body",
  "https://www.googleapis.com/auth/forms.responses.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];


function getStoredTokens() {
  return db.prepare("SELECT * FROM tokens ORDER BY id DESC LIMIT 1").get();
}


function storeTokens(tokens) {
  db.prepare(
    "INSERT INTO tokens (accessToken, refreshToken, expiryDate) VALUES (?, ?, ?)"
  ).run(tokens.access_token, tokens.refresh_token, tokens.expiry_date);
}


async function getAuthClient() {
  const row = getStoredTokens();

  if (row) {
    oAuth2Client.setCredentials({
      access_token: row.accessToken,
      refresh_token: row.refreshToken,
      expiry_date: row.expiryDate,
    });


    if (Date.now() > row.expiryDate) {
      const newTokens = await oAuth2Client.refreshAccessToken();
      const creds = newTokens.credentials;
      storeTokens(creds);
      oAuth2Client.setCredentials(creds);
    }
  }

  return oAuth2Client;
}

async function salvarFormularioCompleto(dadosForm) {
  console.log(dadosForm);
  const insertFormulario = db.prepare(
    "INSERT INTO Formulario (Titulo, Descricao, Link_Url, formId) VALUES (?, ?, ?, ?)"
  );

  const insertPergunta = db.prepare(
    "INSERT INTO Pergunta (Tipo_Pergunta_idTipo_Pergunta, Formulario_idFormulario, Titulo, Obrigatorio, Favorita) VALUES (?, ?, ?, ?, ?)"
  );

  const insertAlternativa = db.prepare(
    "INSERT INTO Alternativa (Pergunta_idPergunta, Texto) VALUES (?, ?)"
  );

  const getTipoPergunta = db.prepare(
    "SELECT idTipo_Pergunta FROM Tipo_Pergunta WHERE Descricao = ?"
  );


  const salvar = db.transaction((dadosForm) => {

    const result = insertFormulario.run(
      dadosForm.titulo,
      dadosForm.descricao,
      dadosForm.linkUrl,
      dadosForm.formId
    );

    const formularioId = result.lastInsertRowid;


    dadosForm.questoes.forEach((q) => {

      const tipo = getTipoPergunta.get(q.tipo);
      let tipoId;
      if (tipo) {
        tipoId = tipo.idTipo_Pergunta;
      } else {

        const novoTipo = db
          .prepare("INSERT INTO Tipo_Pergunta (Descricao) VALUES (?)")
          .run(q.tipo);
        tipoId = novoTipo.lastInsertRowid;
      }

      const resPergunta = insertPergunta.run(
        tipoId,
        formularioId,
        q.titulo,
        q.obrigatoria ? 1 : 0,
        q.favorito ? 1 : 0
      );

      const perguntaId = resPergunta.lastInsertRowid;


      if (q.opcoes && q.opcoes.length > 0) {
        q.opcoes.forEach((opcao) => {
          insertAlternativa.run(perguntaId, opcao);
        });
      }
    });

    return formularioId;
  });

  return salvar(dadosForm);
}


function apagarFormulario(idFormulario) {
  db.prepare(
    "DELETE FROM Alternativa WHERE Pergunta_idPergunta IN (SELECT idPergunta FROM Pergunta WHERE Formulario_idFormulario = ?)"
  ).run(idFormulario);
  db.prepare("DELETE FROM Pergunta WHERE Formulario_idFormulario = ?").run(
    idFormulario
  );
  db.prepare(
    "DELETE FROM Resposta WHERE Pergunta_idPergunta IN (SELECT idPergunta FROM Pergunta WHERE Formulario_idFormulario = ?)"
  ).run(idFormulario);
  db.prepare("DELETE FROM Formulario WHERE idFormulario = ?").run(idFormulario);
}

function listarFormularios() {
  return db.prepare("SELECT * FROM Formulario ORDER BY idFormulario").all();
}

function listarQuestoesPorFormulario(idForm) {
  return db.prepare("SELECT * FROM Pergunta WHERE Formulario_idFormulario = ? ORDER BY idPergunta").all(idForm);
}

function buscarFormularioPorId(idFormulario) {
  return db
    .prepare("SELECT * FROM Formulario WHERE idFormulario = ?")
    .get(idFormulario);
}




async function createGoogleForm(newForm) {
  const auth = await getAuthClient();
  const formsApi = google.forms({ version: "v1", auth });

  const createRes = await formsApi.forms.create({
    requestBody: { info: { title: newForm.titulo } },
  });

  const formId = createRes.data.formId;


  const requests = (newForm.questoes || []).map((questao, index) => {
    const item = { title: questao.titulo, questionItem: { question: {} } };
    switch (questao.tipo) {
      case "TEXTO":
        item.questionItem.question = { textQuestion: { paragraph: false } };
        break;
      case "PARAGRAFO":
        item.questionItem.question = { textQuestion: { paragraph: true } };
        break;
      case "NUMERO":
        item.questionItem.question = { textQuestion: {} };
        break;
      case "UNICA":
        item.questionItem.question = {
          choiceQuestion: {
            type: "RADIO",
            options: (questao.opcoes || []).map((v) => ({ value: v })),
          },
        };
        break;
      case "MULTIPLA":
        item.questionItem.question = {
          choiceQuestion: {
            type: "CHECKBOX",
            options: (questao.opcoes || []).map((v) => ({ value: v })),
          },
        };
        break;
      case "DATA":
        item.questionItem.question = { dateQuestion: {} };
        break;
      case "DATAHORA":
        item.questionItem.question = { dateTimeQuestion: {} };
        break;
      case "ESCALA":
        item.questionItem.question = {
          scaleQuestion: { low: questao.low || 1, high: questao.high || 5 },
        };
        break;
      case "VERDADEIRO_FALSO":
        item.questionItem.question = {
          choiceQuestion: {
            type: "RADIO",
            options: [{ value: "Verdadeiro" }, { value: "Falso" }],
          },
        };
        break;
      case "UPLOAD":
        item.questionItem.question = {
          fileUploadQuestion: {
            maxFiles: questao.maxFiles || 1,
            maxFileSize: questao.maxFileSize || 10,
          },
        };
        break;
    }
    return { createItem: { item, location: { index } } };
  });


  requests.push({
    updateFormInfo: {
      info: { description: newForm.descricao || "" },
      updateMask: "description",
    },
  });

  await formsApi.forms.batchUpdate({ formId, requestBody: { requests } });

  return {
    formId,
    formUrl: createRes.data.responderUri,
    titulo: newForm.titulo,
    descricao: newForm.descricao,
    questoes: newForm.questoes,
  };
}

async function criarQuiz(newForm) {
  const auth = await getAuthClient();
  const formsApi = google.forms({ version: "v1", auth });

  const createRes = await formsApi.forms.create({
    requestBody: { info: { title: newForm.titulo } },
  });

  const formId = createRes.data.formId;

  const requests = (newForm.questoes || []).map((questao, index) => {
    const item = { title: questao.titulo, questionItem: { question: {} } };

    switch (questao.tipo) {
      case "TEXTO":
        item.questionItem.question = {
          textQuestion: { paragraph: false },
        };
        break;

      case "PARAGRAFO":
        item.questionItem.question = {
          textQuestion: { paragraph: true },
        };
        break;

      case "NUMERO":
        item.questionItem.question = { textQuestion: {} };
        break;

      case "UNICA":
        item.questionItem.question = {
          choiceQuestion: {
            type: "RADIO",
            options: (questao.opcoes || []).map((v) => ({ value: v })),
          },
        };
        break;

      case "MULTIPLA":
        item.questionItem.question = {
          choiceQuestion: {
            type: "CHECKBOX",
            options: (questao.opcoes || []).map((v) => ({ value: v })),
          },
        };
        break;

      case "DATA":
        item.questionItem.question = { dateQuestion: {} };
        break;

      case "DATAHORA":
        item.questionItem.question = { dateTimeQuestion: {} };
        break;

      case "ESCALA":
        item.questionItem.question = {
          scaleQuestion: { low: questao.low || 1, high: questao.high || 5 },
        };
        break;

      case "VERDADEIRO_FALSO":
        item.questionItem.question = {
          choiceQuestion: {
            type: "RADIO",
            options: [{ value: "Verdadeiro" }, { value: "Falso" }],
          },
        };
        break;

      case "UPLOAD":
        item.questionItem.question = {
          fileUploadQuestion: {
            maxFiles: questao.maxFiles || 1,
            maxFileSize: questao.maxFileSize || 10,
          },
        };
        break;
    }


    if (questao.pontos || questao.respostasCorretas) {
      item.questionItem.question.grading = {
        pointValue: questao.pontos || 1,
        correctAnswers: {
          answers: (questao.respostasCorretas || []).map((i) => ({
            value: questao.opcoes[i],
          })),
        },
        whenRight: { text: questao.feedbackCorreto || "Correto!" },
        whenWrong: { text: questao.feedbackErrado || "Resposta incorreta." },
      };
    }

    return { createItem: { item, location: { index } } };
  });


  requests.push({
    updateFormInfo: {
      info: { description: newForm.descricao || "" },
      updateMask: "description",
    },
  });


  requests.push({
    updateSettings: {
      settings: {
        quizSettings: { isQuiz: true },
      },
      updateMask: "quizSettings.isQuiz",
    },
  });


  await formsApi.forms.batchUpdate({ formId, requestBody: { requests } });

  return {
    formId,
    formUrl: createRes.data.responderUri,
    titulo: newForm.titulo,
    descricao: newForm.descricao,
    questoes: newForm.questoes,
  };
}

async function listarRespostas(formId) {
  const forms = google.forms({ version: "v1", auth: oAuth2Client });

  try {
    const res = await forms.forms.responses.list({
      formId: formId,
    });

    return res.data.responses || [];
  } catch (err) {
    console.error("Erro ao buscar respostas:", err);
    return [];
  }
}

const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());

expressApp.get("/auth/google", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  res.send({ urlAuth: url });
});

expressApp.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("Código não recebido do Google.");
  }

  try {
    const { tokens } = await oAuth2Client.getToken({
      code,
    });
    oAuth2Client.setCredentials(tokens);
    res.send("Autenticação concluída! Pode fechar esta janela.");
  } catch (err) {
    console.error("Erro no callback:", err);
    res.status(500).send("Erro ao autenticar com o Google.");
  }
});

expressApp.post("/api/quiz", async (req, res) => {
  try {
    const resultado = await criarQuiz(req.body);
    salvarFormularioCompleto(req.body);
    res.status(201).json(resultado);
  } catch (err) {
    console.error("Erro ao criar quiz:", err.message || err);
    res.status(500).json({
      error: "Erro ao criar quiz.",
      details: err.message || err,
    });
  }
});

expressApp.post("/api/forms", async (req, res) => {
  try {
    const resultado = await createGoogleForm(req.body);
    const dadosSalvar = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      questoes: req.body.questoes,
      formId: resultado.formId,
      linkUrl: resultado.formUrl,
    }
    const idForm = await salvarFormularioCompleto(dadosSalvar);
    res.status(201).json(resultado);
  } catch (err) {
    console.error("Erro ao criar formulário:", err.message || err);
    res.status(500).json({
      error: "Erro ao criar formulário.",
      details: err.message || err,
    });
  }
});

expressApp.get("/forms/quest/:formId", async (req, res) => {
  const formId = req.params.formId;
  const forms = google.forms({ version: "v1", auth: oAuth2Client });

  try {
    const formRes = await forms.forms.get({ formId });
    const items = formRes.data.items || [];

    res.json({ items });
  } catch (err) {
    console.error("Erro ao buscar formulário ou respostas:", err);
    res.status(500).send("Erro ao buscar dados do formulário.");
  }
});

expressApp.get("/forms/:formId/responses", async (req, res) => {
  const formId = req.params.formId;
  const forms = google.forms({ version: "v1", auth: oAuth2Client });

  try {
    const formRes = await forms.forms.get({ formId });
    const items = formRes.data.items || [];

    const respostasRes = await forms.forms.responses.list({ formId });
    const responses = respostasRes.data.responses || [];


    res.json({ items, responses });
  } catch (err) {
    console.error("Erro ao buscar formulário ou respostas:", err);
    res.status(500).send("Erro ao buscar dados do formulário.");
  }
});

expressApp.get("/api/forms/:formId", (req, res) => {
  const form = buscarFormularioPorId(req.params.formId);
  if (!form) return res.status(404).send("Formulário não encontrado");
  res.json(form);
});

expressApp.get("/api/forms", (req, res) => {
  res.json(listarFormularios());
});

expressApp.delete("/api/forms/:formId", (req, res) => {
  apagarFormulario(req.params.formId);
  res.send("Formulário apagado com sucesso!");
});




const expressPort = 3000;

async function startExpress() {
  return new Promise((resolve, reject) => {
    expressApp
      .listen(expressPort, () => {
        console.log(`Servidor Express iniciado na porta ${expressPort}`);
        resolve();
      })
      .on("error", reject);
  });
}

let mainWindow;
async function createWindow() {
  await startExpress();
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, "logo-amas.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.maximize();

  const indexPath = url.format({
    pathname: path.join(__dirname, "dist/Angular_Electron/browser/index.html"),
    protocol: "file:",
    slashes: true,
  });

  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:4200"
      : indexPath;
  mainWindow.loadURL(startUrl);

  if (process.env.NODE_ENV === "development")
    mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

electronApp.whenReady().then(createWindow);

electronApp.on("window-all-closed", () => {
  if (process.platform !== "darwin") electronApp.quit();
});
electronApp.on("before-quit", () => db.close());
