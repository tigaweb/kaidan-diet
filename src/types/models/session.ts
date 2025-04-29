export type SessionSummary = {
  totalCount: number;
  totalCalories: number;
  totalHeight: number;
  totalDuration: number;
  sessions: {
    duration: number;
  }[];
};

export type SessionDateRow = {
  session_date: string;
}; 