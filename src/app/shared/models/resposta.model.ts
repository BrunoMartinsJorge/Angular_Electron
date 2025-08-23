export class Resposta {
  idResposta: string;
  idQuestao: string;
  valor: string;
  dataEnviada: Date;

  constructor(idResposta: string, idQuestao: string, valor: string, dataEnviada: Date) {
    this.idResposta = idResposta;
    this.idQuestao = idQuestao;
    this.valor = valor;
    this.dataEnviada = dataEnviada;
  }
}