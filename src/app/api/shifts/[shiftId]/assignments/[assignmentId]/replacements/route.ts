import { handleUpdateReplacementGuards } from "@/features/shift/controller/shift.controller";

type RouteParams = {
  params: Promise<{
    shiftId: string;
    assignmentId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const { shiftId, assignmentId } = await params;
  return handleUpdateReplacementGuards(request, { params: { shiftId, assignmentId } });
}
