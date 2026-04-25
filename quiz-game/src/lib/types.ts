export interface Question {
  id: string;
  category: string;
  text: string;
  image?: string;
  answer: string;
  points: number;
}

export interface Pack {
  id: string;
  name: string;
  questions: Question[];
}

export interface Team {
  id: string;
  name: string;
  score: number;
}

export interface GameState {
  teams: Team[];
  usedQuestionIds: string[];
  activePackId: string;
}
