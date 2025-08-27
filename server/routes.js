const express = require("express");
const { oAuth2Client, SCOPES } = require("./googleAuth");
const { criarQuiz, createGoogleForm, salvarFormularioCompleto, listarFormularios, apagarFormulario, buscarFormularioPorId, listarRespostas } = require("./formService");

const router = express.Router();

router.get("/auth/google", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({ access_type: "offline", scope: SCOPES, prompt: "consent" });
  res.send({ urlAuth: url });
});

router.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Código não recebido do Google.");

  try {
    const { tokens } = await oAuth2Client.getToken({ code });
    oAuth2Client.setCredentials(tokens);
    res.send("Autenticação concluída! Pode fechar esta janela.");
  } catch (err) {
    console.error("Erro no callback:", err);
    res.status(500).send("Erro ao autenticar com o Google.");
  }
});

router.post("/api/quiz", async (req, res) => {
  try {
    const resultado = await criarQuiz(req.body);
    await salvarFormularioCompleto(req.body);
    res.status(201).json(resultado);
  } catch (err) {
    console.error("Erro ao criar quiz:", err.message || err);
    res.status(500).json({ error: "Erro ao criar quiz.", details: err.message || err });
  }
});

router.post("/api/forms", async (req, res) => {
  try {
    const resultado = await createGoogleForm(req.body);
    const dadosSalvar = { titulo: req.body.titulo, descricao: req.body.descricao, questoes: req.body.questoes, formId: resultado.formId, linkUrl: resultado.formUrl };
    await salvarFormularioCompleto(dadosSalvar);
    res.status(201).json(resultado);
  } catch (err) {
    console.error("Erro ao criar formulário:", err.message || err);
    res.status(500).json({ error: "Erro ao criar formulário.", details: err.message || err });
  }
});

router.get("/forms/quest/:formId", async (req, res) => {
  const formId = req.params.formId;
  try {
    const forms = google.forms({ version: "v1", auth: oAuth2Client });
    const formRes = await forms.forms.get({ formId });
    res.json({ items: formRes.data.items || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar dados do formulário.");
  }
});

router.get("/forms/:formId/responses", async (req, res) => {
  const formId = req.params.formId;
  try {
    const forms = google.forms({ version: "v1", auth: oAuth2Client });
    const formRes = await forms.forms.get({ formId });
    const respostasRes = await forms.forms.responses.list({ formId });
    res.json({ items: formRes.data.items || [], responses: respostasRes.data.responses || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar dados do formulário.");
  }
});

router.get("/api/forms/:formId", (req, res) => {
  const form = buscarFormularioPorId(req.params.formId);
  if (!form) return res.status(404).send("Formulário não encontrado");
  res.json(form);
});

router.get("/api/forms", (req, res) => res.json(listarFormularios()));

router.delete("/api/forms/:formId", (req, res) => {
  apagarFormulario(req.params.formId);
  res.send("Formulário apagado com sucesso!");
});

module.exports = router;
