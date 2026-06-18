import { handleGetGuardShiftsByDay } from "@/features/shift/controller/shift.controller";

export async function GET(request: Request) {
  return handleGetGuardShiftsByDay(request);
}
