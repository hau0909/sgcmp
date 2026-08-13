import {
  handleCreateShiftSwapRequest,
  handleGetCompanySwapRequests,
} from "@/features/shift/controller/shift-swap.controller";

export async function GET() {
  return handleGetCompanySwapRequests();
}

export async function POST(request: Request) {
  return handleCreateShiftSwapRequest(request);
}
