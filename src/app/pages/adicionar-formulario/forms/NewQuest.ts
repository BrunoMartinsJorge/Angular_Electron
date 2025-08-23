import { TypeQuestEnum } from '../enums/TypeQuestEnum';

export interface NewQuest {
  titulo: string;
  tipo: TypeQuestEnum | undefined;
  obrigatoria: boolean;
  min?: number;
  max?: number;
  opcoes: string[] | undefined;
  low?: number;
  high?: number;
  startLabel?: string;
  endLabel?: string;
  favorito: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}
