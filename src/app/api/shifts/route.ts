import { handleCreateWorkShift } from "@/features/shift/controller/shift.controller";

export async function POST(request: Request) {
  return handleCreateWorkShift(request);
}
