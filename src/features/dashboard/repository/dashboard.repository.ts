import { createClient } from "@/lib/supabase/server";

// ─────────────────────────────────────────────────────────────
// GUARDS ON SHIFT
// ─────────────────────────────────────────────────────────────

/**
 * Đếm số lượng bảo vệ đang trực thực tế tại một thời điểm (now).
 * Điều kiện:
 *  - Ca đang diễn ra: start_time <= now < end_time
 *  - Hợp đồng đang active
 *  - Bảo vệ thuộc công ty
 *  - Hồ sơ bảo vệ đang active (profiles.status = 'active')
 *  - Bảo vệ đã check-in (status = 'completed' hoặc (status = 'late' và check_in_time IS NOT NULL))
 */
export const countActiveGuardsOnShift = async (
  companyId: string,
  now: string,
): Promise<number> => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("shift_assignments")
    .select(
      `
      assignment_id,
      shifts!inner (
        shift_id,
        start_time,
        end_time,
        contracts!inner (
          contract_id,
          status,
          bookings!inner (
            company_id
          )
        )
      ),
      profiles:profiles!shift_assignments_guard_id_fkey!inner (
        status,
        guards!inner (
          company_id
        )
      )
    `,
      { count: "exact", head: true },
    )
    .or("status.eq.completed,and(status.eq.late,check_in_time.not.is.null)")
    .lte("shifts.start_time", now)
    .gt("shifts.end_time", now)
    .eq("shifts.contracts.status", "active")
    .eq("shifts.contracts.bookings.company_id", companyId)
    .eq("profiles.guards.company_id", companyId)
    .eq("profiles.status", "active");

  if (error) {
    throw new Error(`Không thể đếm bảo vệ đang trực: ${error.message}`);
  }

  return count ?? 0;
};

/**
 * Đếm số bảo vệ đang trực vào cùng thời điểm hôm qua (same time yesterday).
 * Truyền vào `yesterday` = ISO timestamp của `now - 24h`.
 */
export const countActiveGuardsOnShiftYesterday = async (
  companyId: string,
  yesterday: string,
): Promise<number> => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("shift_assignments")
    .select(
      `
      assignment_id,
      shifts!inner (
        shift_id,
        start_time,
        end_time,
        contracts!inner (
          contract_id,
          status,
          bookings!inner (
            company_id
          )
        )
      ),
      profiles:profiles!shift_assignments_guard_id_fkey!inner (
        status,
        guards!inner (
          company_id
        )
      )
    `,
      { count: "exact", head: true },
    )
    .or("status.eq.completed,and(status.eq.late,check_in_time.not.is.null)")
    .lte("shifts.start_time", yesterday)
    .gt("shifts.end_time", yesterday)
    .eq("shifts.contracts.status", "active")
    .eq("shifts.contracts.bookings.company_id", companyId)
    .eq("profiles.guards.company_id", companyId)
    .eq("profiles.status", "active");

  if (error) {
    throw new Error(
      `Không thể đếm bảo vệ trực hôm qua: ${error.message}`,
    );
  }

  return count ?? 0;
};

// ─────────────────────────────────────────────────────────────
// ACTIVE CONTRACTS
// ─────────────────────────────────────────────────────────────

/**
 * Đếm số hợp đồng đang hoạt động (status = 'active') thuộc công ty.
 */
export const countActiveContracts = async (
  companyId: string,
): Promise<number> => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("contracts")
    .select(
      `
      contract_id,
      bookings!inner (
        company_id
      )
    `,
      { count: "exact", head: true },
    )
    .eq("status", "active")
    .eq("bookings.company_id", companyId);

  if (error) {
    throw new Error(`Không thể đếm hợp đồng hoạt động: ${error.message}`);
  }

  return count ?? 0;
};

/**
 * Đếm số hợp đồng active đã tồn tại vào tháng trước.
 * Tháng trước = các hợp đồng được tạo trước ngày đầu tháng hiện tại (created_at < currentMonthStart)
 * và vẫn có status = 'active'.
 */
export const countActiveContractsLastMonth = async (
  companyId: string,
  currentMonthStart: string, // ISO – ngày đầu tiên của tháng hiện tại
): Promise<number> => {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("contracts")
    .select(
      `
      contract_id,
      bookings!inner (
        company_id
      )
    `,
      { count: "exact", head: true },
    )
    .eq("status", "active")
    .eq("bookings.company_id", companyId)
    .lt("created_at", currentMonthStart);

  if (error) {
    throw new Error(
      `Không thể đếm hợp đồng tháng trước: ${error.message}`,
    );
  }

  return count ?? 0;
};

// ─────────────────────────────────────────────────────────────
// PENDING REPORTS
// ─────────────────────────────────────────────────────────────

/**
 * Đếm số báo cáo sự cố chờ xử lý (PENDING hoặc IN_PROGRESS)
 * liên quan đến các hợp đồng của công ty.
 */
export const countPendingReports = async (
  companyId: string,
): Promise<number> => {
  const supabase = await createClient();

  // Bước 1: Lấy danh sách contract_id thuộc công ty
  const { data: contractRows, error: contractError } = await supabase
    .from("contracts")
    .select(
      `
      contract_id,
      bookings!inner (
        company_id
      )
    `,
    )
    .eq("bookings.company_id", companyId);

  if (contractError) {
    throw new Error(`Không thể lấy hợp đồng: ${contractError.message}`);
  }

  const contractIds = (contractRows ?? []).map(
    (r: { contract_id: string }) => r.contract_id,
  );

  if (contractIds.length === 0) return 0;

  // Bước 2: Đếm report theo contract_id
  const { count, error: reportError } = await supabase
    .from("report")
    .select("id", { count: "exact", head: true })
    .in("contract_id", contractIds)
    .in("status", ["PENDING", "IN_PROGRESS"]);

  if (reportError) {
    throw new Error(
      `Không thể đếm báo cáo chờ xử lý: ${reportError.message}`,
    );
  }

  return count ?? 0;
};

/**
 * Đếm số báo cáo chờ xử lý được tạo trong khoảng [rangeStart, rangeEnd)
 * (dùng để so sánh với tháng trước).
 */
export const countPendingReportsInRange = async (
  companyId: string,
  rangeStart: string,
  rangeEnd: string,
): Promise<number> => {
  const supabase = await createClient();

  const { data: contractRows, error: contractError } = await supabase
    .from("contracts")
    .select(
      `
      contract_id,
      bookings!inner (
        company_id
      )
    `,
    )
    .eq("bookings.company_id", companyId);

  if (contractError) {
    throw new Error(`Không thể lấy hợp đồng: ${contractError.message}`);
  }

  const contractIds = (contractRows ?? []).map(
    (r: { contract_id: string }) => r.contract_id,
  );

  if (contractIds.length === 0) return 0;

  const { count, error: reportError } = await supabase
    .from("report")
    .select("id", { count: "exact", head: true })
    .in("contract_id", contractIds)
    .in("status", ["PENDING", "IN_PROGRESS"])
    .gte("created_at", rangeStart)
    .lt("created_at", rangeEnd);

  if (reportError) {
    throw new Error(
      `Không thể đếm báo cáo theo khoảng: ${reportError.message}`,
    );
  }

  return count ?? 0;
};

// ─────────────────────────────────────────────────────────────
// AVERAGE RATING
// ─────────────────────────────────────────────────────────────

/**
 * Lấy điểm đánh giá trung bình hiện tại từ companies.rating_average.
 */
export const getCompanyRatingAverage = async (
  companyId: string,
): Promise<number | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("companies")
    .select("rating_average")
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    throw new Error(`Không thể lấy điểm đánh giá: ${error.message}`);
  }

  return data?.rating_average != null ? Number(data.rating_average) : null;
};

/**
 * Tính điểm đánh giá trung bình của các review được tạo
 * TRƯỚC ngày đầu tháng hiện tại (tức là toàn bộ tháng trước trở về trước).
 * Dùng để so sánh % thay đổi điểm đánh giá.
 */
export const getCompanyRatingAverageLastMonth = async (
  companyId: string,
  currentMonthStart: string, // ISO – ngày đầu tiên của tháng hiện tại
): Promise<number | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("company_id", companyId)
    .lt("created_at", currentMonthStart);

  if (error) {
    throw new Error(
      `Không thể tính điểm đánh giá tháng trước: ${error.message}`,
    );
  }

  const ratings = data ?? [];
  if (ratings.length === 0) return null;

  const avg = ratings.reduce((sum, r) => sum + Number(r.rating), 0) / ratings.length;
  return Math.round(avg * 10) / 10; // làm tròn 1 chữ số thập phân
};

export const getWeeklyShiftsData = async (
  companyId: string,
  startDate: string,
  endDate: string,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shifts")
    .select(`
      shift_id,
      start_time,
      required_guards,
      contracts!inner (
        contract_id,
        bookings!inner (
          company_id
        )
      ),
      shift_assignments (
        status,
        replacement_guard_ids
      )
    `)
    .eq("contracts.bookings.company_id", companyId)
    .gte("start_time", startDate)
    .lte("start_time", endDate);

  if (error) {
    throw new Error(`Không thể lấy dữ liệu ca trực 7 ngày: ${error.message}`);
  }

  return data || [];
};

export const getShiftStatusTodayData = async (
  companyId: string,
  startDate: string,
  endDate: string,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shifts")
    .select(`
      shift_id,
      start_time,
      end_time,
      required_guards,
      contracts!inner (
        contract_id,
        bookings!inner (
          company_id
        )
      ),
      shift_assignments (
        status,
        check_in_time,
        replacement_guard_ids
      )
    `)
    .eq("contracts.bookings.company_id", companyId)
    .gte("start_time", startDate)
    .lte("start_time", endDate);

  if (error) {
    throw new Error(`Không thể lấy trạng thái ca trực hôm nay: ${error.message}`);
  }

  return data || [];
};

export const getTodayGuardsStatusList = async (
  companyId: string,
  startDate: string,
  endDate: string,
) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shifts")
    .select(`
      shift_id,
      shift_name,
      start_time,
      end_time,
      required_guards,
      contracts!inner (
        contract_id,
        bookings!inner (
          company_id,
          services!inner (
            name
          )
        )
      ),
      shift_assignments (
        status,
        guard_id,
        check_in_time,
        replacement_guard_ids
      )
    `)
    .eq("contracts.bookings.company_id", companyId)
    .gte("start_time", startDate)
    .lte("start_time", endDate);

  if (error) {
    throw new Error(`Không thể lấy danh sách ca trực bảo vệ hôm nay: ${error.message}`);
  }

  return data || [];
};

export const getProfilesByIds = async (ids: string[]) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, full_name, avatar_url")
    .in("user_id", ids);

  if (error) {
    throw new Error(`Không thể lấy danh sách profile bảo vệ: ${error.message}`);
  }

  return data || [];
};

export const getRecentShiftsAndAssignments = async (
  companyId: string,
  startDate?: string,
  endDate?: string,
) => {
  const supabase = await createClient();
  let query = supabase
    .from("shifts")
    .select(`
      shift_id,
      shift_name,
      start_time,
      end_time,
      contracts!inner (
        contract_id,
        bookings!inner (
          company_id,
          services!inner (
            name
          )
        )
      ),
      shift_assignments (
        status,
        guard_id,
        check_in_time,
        replacement_guard_ids,
        updated_at
      )
    `)
    .eq("contracts.bookings.company_id", companyId);

  if (startDate) {
    query = query.gte("start_time", startDate);
  }
  if (endDate) {
    query = query.lte("start_time", endDate);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Không thể lấy shifts cho hoạt động gần đây: ${error.message}`);
  }
  return data || [];
};

export const getRecentReports = async (companyId: string, limitVal: number) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("report")
    .select(`
      id,
      contract_id,
      type,
      status,
      created_at,
      contracts!inner (
        contract_id,
        bookings!inner (
          company_id
        )
      )
    `)
    .eq("contracts.bookings.company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limitVal);

  if (error) {
    throw new Error(`Không thể lấy báo cáo cho hoạt động gần đây: ${error.message}`);
  }
  return data || [];
};

export const getRecentContracts = async (companyId: string, limitVal: number) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contracts")
    .select(`
      contract_id,
      start_date,
      end_date,
      status,
      updated_at,
      bookings!inner (
        company_id
      )
    `)
    .eq("bookings.company_id", companyId)
    .order("updated_at", { ascending: false })
    .limit(limitVal);

  if (error) {
    throw new Error(`Không thể lấy hợp đồng cho hoạt động gần đây: ${error.message}`);
  }
  return data || [];
};

export const getRecentBookings = async (companyId: string, limitVal: number) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      booking_id,
      status,
      created_at
    `)
    .eq("company_id", companyId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limitVal);

  if (error) {
    throw new Error(`Không thể lấy yêu cầu dịch vụ cho hoạt động gần đây: ${error.message}`);
  }
  return data || [];
};

export const getRecentCoordinators = async (limitVal: number) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, full_name, created_at")
    .eq("role", "coordinator")
    .order("created_at", { ascending: false })
    .limit(limitVal);

  if (error) {
    throw new Error(`Không thể lấy điều phối viên cho hoạt động gần đây: ${error.message}`);
  }
  return data || [];
};
