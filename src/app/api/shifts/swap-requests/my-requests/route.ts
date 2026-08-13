import { handleGetGuardSwapRequests } from "@/features/shift/controller/shift-swap.controller";

export async function GET() {
  return handleGetGuardSwapRequests();
}
