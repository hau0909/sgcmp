import { handleRejectShiftSwapRequest } from "@/features/shift/controller/shift-swap.controller";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;
  return handleRejectShiftSwapRequest(requestId, request);
}
