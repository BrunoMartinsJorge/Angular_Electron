import { Resposta } from "./resposta.model";

export class QuestaoModel{
  idQuestao: string;
  titulo: string;
  resposta: Resposta[];

  constructor(idQuestao: string, titulo: string, resposta: Resposta[]) {
    this.idQuestao = idQuestao;
    this.titulo = titulo;
    this.resposta = resposta;
  }
}