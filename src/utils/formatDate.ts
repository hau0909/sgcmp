import { formatDate as formatDateHelper } from "./dateTime";

export const formatDate = (dateStr: string) => {
  return formatDateHelper(dateStr);
};
