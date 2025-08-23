import { NewQuest } from './NewQuest';

export interface NewQuestQuiz extends NewQuest {
  pontos?: number;
  valorCorreto?: string;
  respostasCorretas?: number[]; // agora guarda índices, não textos
}
