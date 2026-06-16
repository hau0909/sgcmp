import { handleGetShiftContracts } from "@/features/shift/controller/shift.controller";

export async function GET() {
  return handleGetShiftContracts();
}
