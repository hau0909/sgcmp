import { handleGetEligibleShiftsForSwap } from "@/features/shift/controller/shift.controller";

export async function GET() {
  return handleGetEligibleShiftsForSwap();
}
