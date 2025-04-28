export type SessionSummary = {
  totalSessions: number;
  totalCalories: number;
  totalHeight: number;
  totalDuration: number;
  sessions: {
    start_time: string;
    end_time: string;
  }[];
};

export type SessionDateRow = {
  session_date: string;
}; 