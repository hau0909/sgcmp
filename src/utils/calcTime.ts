export const checkTimeOverlap = (slot1: string, slot2: string) => {
  const [s1, e1] = slot1.split(" - ");
  const [s2, e2] = slot2.split(" - ");

  const timeToMins = (t: string) => {
    const [h, m] = t.trim().split(":").map(Number);
    return h * 60 + m;
  };

  const start1 = timeToMins(s1);
  const end1 = timeToMins(e1);
  const start2 = timeToMins(s2);
  const end2 = timeToMins(e2);

  return Math.max(start1, start2) < Math.min(end1, end2);
};

export const checkDateOverlap = (start1: string, end1: string, start2: string, end2: string) => {
  return new Date(start1) <= new Date(end2) && new Date(end1) >= new Date(start2);
};

export const calculateHoursFromSlot = (slot: string): number => {
  const parts = slot.split("-");
  if (parts.length !== 2) return 0;
  
  const [startStr, endStr] = parts;
  const startParts = startStr.split(":");
  const endParts = endStr.split(":");
  if (startParts.length !== 2 || endParts.length !== 2) return 0;
  
  const startHour = parseInt(startParts[0], 10);
  const startMin = parseInt(startParts[1], 10);
  const endHour = parseInt(endParts[0], 10);
  const endMin = parseInt(endParts[1], 10);
  
  if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
    return 0;
  }
  
  const startTotalMinutes = startHour * 60 + startMin;
  let endTotalMinutes = endHour * 60 + endMin;
  
  if (endTotalMinutes <= startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }
  
  return (endTotalMinutes - startTotalMinutes) / 60;
};
