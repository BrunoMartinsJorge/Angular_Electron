import { TypeQuestEnum } from '../../pages/adicionar-formulario/enums/TypeQuestEnum';
import { QuestaoModel } from './questao.model';
import { Resposta } from './resposta.model';

interface GoogleFormItem {
  title: string;
  questionItem?: {
    question: {
      questionId: string;
    };
  };
}

interface GoogleFormResponseAnswer {
  [questionId: string]: {
    textAnswers?: {
      answers: {
        value: string;
      }[];
    };
  };
}

interface GoogleFormResponse {
  responseId: string;
  createTime: string;
  answers: GoogleFormResponseAnswer;
}

export function formatarQuestoes(
  items: GoogleFormItem[],
  responses: GoogleFormResponse[]
): QuestaoModel[] {
  const questionMap: { [key: string]: string } = {};
  items.forEach((item) => {
    if (item.questionItem) {
      questionMap[item.questionItem.question.questionId] = item.title;
    }
  });

  const questoes: QuestaoModel[] = [];

  Object.entries(questionMap).forEach(([questionId, titulo]) => {
    const respostas: Resposta[] = [];

    responses.forEach((resp) => {
      const answer = resp.answers[questionId];
      if (answer?.textAnswers?.answers?.length) {
        answer.textAnswers.answers.forEach((a) => {
          respostas.push(
            new Resposta(
              resp.responseId,
              questionId,
              a.value,
              new Date(resp.createTime)
            )
          );
        });
      }
    });

    questoes.push(new QuestaoModel(questionId, titulo, respostas, TypeQuestEnum.UNICA));
  });

  return questoes;
}
