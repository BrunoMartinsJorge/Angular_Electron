import { Resposta } from "./resposta.model";
import { TypeQuestEnum } from "../../pages/adicionar-formulario/enums/TypeQuestEnum";

export class QuestaoModel{
  idQuestao: string;
  titulo: string;
  tipo: TypeQuestEnum;
  resposta: Resposta[];

  constructor(idQuestao: string, titulo: string, resposta: Resposta[], tipo: TypeQuestEnum) {
    this.idQuestao = idQuestao;
    this.titulo = titulo;
    this.resposta = resposta;
    this.tipo = tipo;
  }
}