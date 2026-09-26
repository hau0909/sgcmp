export interface CompanyServicePriceItem {
  price?: number | null;
}

export interface CompanyDisplayInfoResult {
  initials: string;
  pricePerHour: number;
  maxPrice: number;
  serviceCount: number;
}

/**
 * Thuật toán bóc tách tiền tố công ty bằng Regex và tìm min/max khoảng giá dịch vụ
 * @param companyName Tên đầy đủ của công ty
 * @param services Danh sách các dịch vụ kèm đơn giá
 */
export function extractCompanyInitialsAndPriceRange(
  companyName: string | null | undefined,
  services?: CompanyServicePriceItem[] | null
): CompanyDisplayInfoResult {
  const name = (companyName || "").trim();
  const serviceCount = services ? services.length : 0;

  // 1. Tìm giá nhỏ nhất và lớn nhất
  let pricePerHour = 0;
  let maxPrice = 0;
  if (services && services.length > 0) {
    const prices = services
      .map((cs) => cs.price)
      .filter((p): p is number => typeof p === "number" && !isNaN(p));
    if (prices.length > 0) {
      pricePerHour = Math.min(...prices);
      maxPrice = Math.max(...prices);
    }
  }

  // 2. Tính chữ viết tắt từ tên công ty
  const cleanName = name
    .replace(
      /^(Công ty|TNHH|Cổ phần|Dịch vụ|Bảo vệ|TNHH Dịch vụ Bảo vệ)\s+/gi,
      ""
    )
    .replace(/\s+(Cổ phần|TNHH)\s*/gi, "")
    .trim();

  const words = cleanName.split(/\s+/).filter(Boolean);
  let initials = "CO";
  if (words.length >= 2) {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  } else if (words.length === 1) {
    initials = words[0].substring(0, 2).toUpperCase();
  }

  return {
    initials,
    pricePerHour,
    maxPrice,
    serviceCount,
  };
}
