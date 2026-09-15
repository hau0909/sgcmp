export interface GuardQuotaResult {
  isExceeded: boolean;
  maxGuards: number | null;
  currentGuards: number;
}

/**
 * Thuật toán kiểm soát hạn ngạch số lượng bảo vệ theo gói thuê bao
 * @param currentGuards Số bảo vệ hiện tại của công ty
 * @param maxGuards Hạn mức tối đa theo gói (null = không giới hạn)
 */
export function evaluateGuardQuota(
  currentGuards: number,
  maxGuards: number | null
): GuardQuotaResult {
  if (maxGuards === null) {
    return {
      isExceeded: false,
      maxGuards: null,
      currentGuards,
    };
  }

  return {
    isExceeded: currentGuards >= maxGuards,
    maxGuards,
    currentGuards,
  };
}
