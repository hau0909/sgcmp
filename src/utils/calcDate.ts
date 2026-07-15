import { localTimeToUtc } from "./dateTime";

export const isValidDateKey = (date: string) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
};

export const createUtcDateFromDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};

export const formatUtcDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const addDaysToDateKey = (dateKey: string, days: number) => {
  const date = createUtcDateFromDateKey(dateKey);

  date.setUTCDate(date.getUTCDate() + days);

  return formatUtcDateKey(date);
};

export const getStartOfWeekKey = (dateKey: string) => {
  const date = createUtcDateFromDateKey(dateKey);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;

  date.setUTCDate(date.getUTCDate() + diff);

  return formatUtcDateKey(date);
};

export const getDayDateRange = (dateKey: string, timeZone?: string) => {
  const nextDateKey = addDaysToDateKey(dateKey, 1);

  return {
    startTime: localTimeToUtc(dateKey, "00:00:00", timeZone),
    endTime: localTimeToUtc(nextDateKey, "00:00:00", timeZone),
  };
};

export const getWeekDateRange = (dateKey: string, timeZone?: string) => {
  const startOfWeekKey = getStartOfWeekKey(dateKey);
  const nextWeekKey = addDaysToDateKey(startOfWeekKey, 7);

  return {
    startTime: localTimeToUtc(startOfWeekKey, "00:00:00", timeZone),
    endTime: localTimeToUtc(nextWeekKey, "00:00:00", timeZone),
  };
};

