import { handleGetReplacementGuards } from "@/features/shift/controller/shift.controller";

type RouteParams = {
  params: Promise<{
    shiftId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { shiftId } = await params;
  return handleGetReplacementGuards(request, { params: { shiftId } });
}
