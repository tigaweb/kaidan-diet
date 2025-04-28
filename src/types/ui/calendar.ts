export type MarkedDates = {
  [date: string]: {
    marked?: boolean;
    selected?: boolean;
  };
};

export type DayObject = {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}; 