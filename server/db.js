const { app: electronApp } = require("electron");
const path = require("path");
const Database = require("better-sqlite3");

const userDataPath = electronApp.getPath("userData");
const dbPath = path.join(userDataPath, "banco.db");
const db = new Database(dbPath);

db.prepare(`
CREATE TABLE IF NOT EXISTS Formulario (
  idFormulario INTEGER PRIMARY KEY AUTOINCREMENT,
  Titulo VARCHAR(75),
  Descricao TEXT,
  Data_Criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  Link_Url TEXT,
  formId TEXT
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Tipo_Pergunta (
  idTipo_Pergunta INTEGER PRIMARY KEY AUTOINCREMENT,
  Descricao TEXT
);`).run();

db.prepare(`
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
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Alternativa (
  idAlternativa INTEGER PRIMARY KEY AUTOINCREMENT,
  Pergunta_idPergunta INTEGER,
  Texto TEXT,
  FOREIGN KEY (Pergunta_idPergunta) REFERENCES Pergunta(idPergunta)
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Participante (
  idParticipante INTEGER PRIMARY KEY AUTOINCREMENT,
  Nome TEXT,
  Email TEXT
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS Resposta (
  idResposta INTEGER PRIMARY KEY AUTOINCREMENT,
  Participante_idParticipante INTEGER,
  Pergunta_idPergunta INTEGER,
  Valor TEXT,
  Data_Resposta DATE,
  FOREIGN KEY (Participante_idParticipante) REFERENCES Participante(idParticipante),
  FOREIGN KEY (Pergunta_idPergunta) REFERENCES Pergunta(idPergunta)
);`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  accessToken TEXT NOT NULL,
  refreshToken TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiryDate INTEGER NOT NULL
);`).run();

module.exports = db;
