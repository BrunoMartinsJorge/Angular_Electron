import { Component } from '@angular/core';
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
import { Fieldset } from "primeng/fieldset";

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
    Fieldset
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

  public acessarFormulario(form: any): void {
    window.open(form.Link_Url, '_blank');
  }

  public visualizarFormulario(form: any): void {
    this.formularioSelecionado = null;
    this.carregando_formulario = true;
    this.formulariosService
      .buscarRespostasDeFormularioPorIdForm(form.formId)
      .subscribe({
        next: (response: any) => {
          this.formularioSelecionado = response;
          const questoes: QuestaoModel[] = [];

          const questionMap: { [key: string]: string } = {};
          response.items.forEach((item: any) => {
            if (item.questionItem) {
              questionMap[item.questionItem.question.questionId] = item.title;
            }
          });

          Object.entries(questionMap).forEach(([qId, titulo]) => {
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
            questoes.push(new QuestaoModel(qId, titulo, respostas));
          });

          this.questoes = questoes;
        },
        error: (error: Error) => {
          console.error(error);
        },
        complete: () => {
          this.formularioSelecionado = form;
          this.carregando_formulario = false;
        },
      });
  }

  public adicionarFormulario(): void {
    this.router.navigate(['/adicionar-formulario']);
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
