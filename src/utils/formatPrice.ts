export const formatPrice = (price: number | string | null | undefined) => {
  if (price === null || price === undefined) {
    return "0";
  }
  const parsed = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(parsed)) {
    return "0";
  }
  return parsed.toLocaleString("vi-VN");
};

