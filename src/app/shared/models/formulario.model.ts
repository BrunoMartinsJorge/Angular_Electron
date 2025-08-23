export class Formulario {
  id: number;
  descricaoFormulario: string;
  dataAbertura: Date;
  dataFechamento: Date;
  titulo: string;
  linkUrl: string;

  constructor(id: number, descricaoFormulario: string, dataAbertura: Date, dataFechamento: Date, titulo: string, linkUrl: string) {
    this.id = id;
    this.descricaoFormulario = descricaoFormulario;
    this.dataAbertura = dataAbertura;
    this.dataFechamento = dataFechamento;
    this.titulo = titulo;
    this.linkUrl = linkUrl;
  }
}
