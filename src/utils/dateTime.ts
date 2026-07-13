export const getUserTimeZone = (): string => {
  if (typeof window !== "undefined" && typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return "UTC";
};

export const getUserLocale = (): string => {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }
  return "vi-VN";
};

export const formatDate = (
  dateVal: Date | string | number,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" },
  locale?: string
): string => {
  const date = new Date(dateVal);
  if (Number.isNaN(date.getTime())) return "";

  const activeLocale = locale || getUserLocale();
  const activeTimeZone = getUserTimeZone();

  return new Intl.DateTimeFormat(activeLocale, {
    timeZone: activeTimeZone === "UTC" ? undefined : activeTimeZone,
    ...options,
  }).format(date);
};

export const formatTime = (
  dateVal: Date | string | number,
  options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false },
  locale?: string
): string => {
  const date = new Date(dateVal);
  if (Number.isNaN(date.getTime())) return "";

  const activeLocale = locale || getUserLocale();
  const activeTimeZone = getUserTimeZone();

  return new Intl.DateTimeFormat(activeLocale, {
    timeZone: activeTimeZone === "UTC" ? undefined : activeTimeZone,
    ...options,
  }).format(date);
};

export const formatDateRange = (
  startVal: Date | string | number,
  endVal: Date | string | number,
  locale?: string
): string => {
  const startStr = formatDate(startVal, { day: "2-digit", month: "2-digit", year: "numeric" }, locale);
  const endStr = formatDate(endVal, { day: "2-digit", month: "2-digit", year: "numeric" }, locale);
  return `${startStr} - ${endStr}`;
};

export const localTimeToUtc = (dateKey: string, timeStr: string, timeZone?: string): string => {
  const activeTimeZone = timeZone || getUserTimeZone();
  if (activeTimeZone === "UTC") {
    return `${dateKey}T${timeStr}Z`;
  }
  try {
    const utcDate = new Date(`${dateKey}T${timeStr}Z`);
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: activeTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(utcDate);
    const year = parts.find((p) => p.type === "year")?.value;
    const month = parts.find((p) => p.type === "month")?.value;
    const day = parts.find((p) => p.type === "day")?.value;
    const hour = parts.find((p) => p.type === "hour")?.value;
    const minute = parts.find((p) => p.type === "minute")?.value;
    const second = parts.find((p) => p.type === "second")?.value;

    const formattedUtc = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour) === 24 ? 0 : Number(hour),
        Number(minute),
        Number(second)
      )
    );

    const offsetMs = formattedUtc.getTime() - utcDate.getTime();
    const targetUtcTime = utcDate.getTime() - offsetMs;
    return new Date(targetUtcTime).toISOString();
  } catch (error) {
    return `${dateKey}T${timeStr}Z`;
  }
};

export const getEndOfDayInTimeZone = (date: Date, timeZone?: string): string => {
  const activeTimeZone = timeZone || getUserTimeZone();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: activeTimeZone === "UTC" ? undefined : activeTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return localTimeToUtc(`${year}-${month}-${day}`, "23:59:59", activeTimeZone);
};
