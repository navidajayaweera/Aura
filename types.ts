
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  data?: AuraResponse | null;
}

export interface AuraResponse {
  greeting: string;
  weather: {
    summary: string;
    temperature: string;
    items: string[];
  };
  checklist: ChecklistCategory[];
  suggestions: string[];
  closing: string;
}

export interface ChecklistCategory {
  category: string;
  items: string[];
}
