import { handleGetAllShiftsByWeek } from "@/features/shift/controller/shift.controller";

export async function GET(request: Request) {
  return handleGetAllShiftsByWeek(request);
}
