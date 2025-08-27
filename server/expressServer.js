const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());
expressApp.use(routes);

const expressPort = 3000;

async function startExpress() {
  return new Promise((resolve, reject) => {
    expressApp.listen(expressPort, () => {
      console.log(`Servidor Express iniciado na porta ${expressPort}`);
      resolve();
    }).on("error", reject);
  });
}

module.exports = { startExpress };
