export const getDurationText = (days: number, dict?: any) => {
  if (days === 30) return dict?.billing?.duration_month || "tháng";
  if (days % 30 === 0) return (dict?.billing?.duration_months || "{0} tháng").replace("{0}", (days / 30).toString());
  if (days === 365) return dict?.billing?.duration_year || "năm";
  return (dict?.billing?.duration_days || "{0} ngày").replace("{0}", days.toString());
};

