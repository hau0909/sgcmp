import { handleGetGuardAvailability } from "@/features/shift/controller/shift.controller";

export const POST = async (request: Request) => {
  return handleGetGuardAvailability(request);
};
