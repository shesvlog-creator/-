
export enum CallState {
  IDLE = 'idle',
  IN_PROGRESS = 'in_progress',
  ANALYZING = 'analyzing',
  FINISHED = 'finished',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Analysis {
  transcript: string;
  strengths: string[];
  weaknesses: string[];
  homework: string[];
}
