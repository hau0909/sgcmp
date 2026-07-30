import { handleGetAdminPendingTasks } from "@/features/dashboard/controller/dashboard.controller";
import { NextResponse, connection } from "next/server";

export async function GET(request: Request) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "vi";

    const result = await handleGetAdminPendingTasks(locale);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/dashboard/admin/pending-task] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
