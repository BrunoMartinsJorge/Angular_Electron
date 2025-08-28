import { Component, Type } from '@angular/core';
import { Formulario } from '../../shared/models/formulario.model';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormulariosServices } from '../../services/formularios-services';
import { NewForm } from '../adicionar-formulario/forms/NewForm';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinner } from 'primeng/progressspinner';
import { QuestaoModel } from '../../shared/models/questao.model';
import { Resposta } from '../../shared/models/resposta.model';
import { Fieldset } from 'primeng/fieldset';
import { GerarPdf } from '../gerar-pdf/gerar-pdf';
import { SelectButton } from 'primeng/selectbutton';
import { GerarGraficos } from '../gerar-graficos/gerar-graficos';
import { TypeQuestEnum } from '../adicionar-formulario/enums/TypeQuestEnum';

export interface Quest {
  titulo: string;
  tipoQuestao: 'TEXT' | 'RADIO' | 'ESCALA';
  opcoes?: string[];
  escala?: { min: number; max: number };
}

export interface Form {
  titulo: string;
  descricaoFormulario: string;
  questoes: Quest[];
}

@Component({
  selector: 'app-listar-formularios',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    ConfirmPopupModule,
    ToastModule,
    DialogModule,
    ProgressSpinner,
    Fieldset,
    GerarPdf,
    GerarGraficos,
  ],
  templateUrl: './listar-formularios.html',
  styleUrl: './listar-formularios.css',
  providers: [ConfirmationService, MessageService],
})
export class ListarFormularios {
  public listOfForms: Formulario[] = [];
  public carregando_formulario: boolean = false;
  public formularioSelecionado: NewForm | any;
  public questoes: QuestaoModel[] = [];
  public habilitarGerarPDF: boolean = false;
  public habilitarGerarGrafico: boolean = false;
  public formularioParaPDF: NewForm | any;
  public carregando_questoes: boolean = false;
  public form: Form = {
    titulo: '',
    descricaoFormulario: '',
    questoes: [],
  };
  public opcoesGraficos: any[] = [];

  constructor(
    private formulariosService: FormulariosServices,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.getForms();
  }

  private getForms(): void {
    this.formulariosService.listarFormularios().subscribe({
      next: (response: Formulario[]) => {
        this.listOfForms = response;
      },
      error: (error: Error) => {
        console.error(error);
      },
    });
  }

  private converterDados(questoes: any[]): Quest[] {
    return questoes
      .map((item) => {
        const question = item.questionItem?.question;

        if (!question) return null;

        if (question.choiceQuestion) {
          return {
            titulo: item.title,
            tipoQuestao: 'RADIO',
            opcoes: question.choiceQuestion.options.map(
              (opt: any) => opt.value
            ),
          } as Quest;
        }

        if (question.textQuestion) {
          return {
            titulo: item.title,
            tipoQuestao: 'TEXT',
          } as Quest;
        }

        if (question.scaleQuestion) {
          return {
            titulo: item.title,
            tipoQuestao: 'ESCALA',
            escala: {
              min: question.scaleQuestion.low,
              max: question.scaleQuestion.high,
            },
          } as Quest;
        }

        return null;
      })
      .filter((q): q is Quest => q !== null);
  }

  public acessarFormulario(form: any): void {
    window.open(form.Link_Url, '_blank');
  }

  public visualizarFormulario(form: any): void {
    if (!form.formId) return;
    this.formularioSelecionado = null;
    this.carregando_formulario = true;

    this.formulariosService
      .buscarRespostasDeFormularioPorIdForm(form.formId)
      .subscribe({
        next: (response: any) => {
          this.formularioSelecionado = response;
          const questoes: QuestaoModel[] = [];

          const questionMap: {
            [key: string]: { titulo: string; tipo: TypeQuestEnum };
          } = {};

          response.items.forEach((item: any) => {
            if (item.questionItem) {
              const q = item.questionItem.question;
              let tipo: TypeQuestEnum = TypeQuestEnum.UNICA;
              if (q.textQuestion) tipo = TypeQuestEnum.TEXTO;
              else if (q.paragraphQuestion) tipo = TypeQuestEnum.PARAGRAFO;
              else if (q.choiceQuestion) tipo = TypeQuestEnum.UNICA;
              else if (q.checkboxQuestion) tipo = TypeQuestEnum.MULTIPLA;
              else if (q.dateQuestion) tipo = TypeQuestEnum.DATA;
              else if (q.scaleQuestion) tipo = TypeQuestEnum.ESCALA;
              else if (q.boolQuestion) tipo = TypeQuestEnum.VERDADEIRO_FALSO;

              questionMap[q.questionId] = { titulo: item.title, tipo };
            }
          });

          Object.entries(questionMap).forEach(([qId, { titulo, tipo }]) => {
            const respostas: Resposta[] = [];

            response.responses.forEach((resp: any) => {
              const answer = resp.answers[qId];
              if (answer?.textAnswers?.answers?.length) {
                answer.textAnswers.answers.forEach((a: any) => {
                  respostas.push(
                    new Resposta(
                      resp.responseId,
                      qId,
                      a.value,
                      new Date(resp.createTime)
                    )
                  );
                });
              }
            });
            questoes.push(new QuestaoModel(qId, titulo, respostas, tipo));
          });

          this.questoes = questoes;
        },
        error: (error: Error) => {
          console.error(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao buscar respostas',
            detail: error.message
          })
        },
        complete: () => {
          this.formularioSelecionado = form;
          this.carregando_formulario = false;
        },
      });
  }

  public gerarPDF(formulario: any): void {
    this.habilitarGerarPDF = true;
    this.formularioParaPDF = formulario;
    this.questoes = [];
    this.carregando_questoes = true;
    this.formulariosService
      .buscarQuestoesDeFormularioPorIdForm(formulario.formId)
      .subscribe({
        next: (response: any) => {
          this.form.questoes = this.converterDados(response.items as any[]);
          this.form.titulo = formulario.Titulo;
          this.form.descricaoFormulario = formulario.Descricao;
          console.log(this.form);
        },
        error: (error: Error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao gerar PDF',
            detail: error.message,
          })
          console.error(error);
        },
        complete: () => {
          this.carregando_questoes = false;
        },
      });
  }

  public adicionarFormulario(): void {
    this.router.navigate(['/adicionar-formulario']);
  }

  public abrirGrafico(): void {
    this.habilitarGerarGrafico = true;
  }

  public apagarFormulario(event: Event, id: number): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Você tem certeza que desejá apagar esse formulário?',
      header: 'Confirmar exclusão',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Apagar',
      },
      accept: () => {
        this.formulariosService.deletarFormulario(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Formulário apagado com sucesso',
            });
            this.getForms();
          },
          error: (error: Error) => {
            console.error(error);
          },
        });
      },
      reject: () => {},
    });
  }
}
