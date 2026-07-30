import { NextRequest, NextResponse, connection } from "next/server";
import { handleGetCurrentUpcomingShiftsToday } from "@/features/dashboard/controller/dashboard.controller";

export async function GET(request: NextRequest) {
    await connection();
    try {
        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get("companyId") || undefined;
        const result = await handleGetCurrentUpcomingShiftsToday(companyId);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const err = error as Error;
        console.error("[GET /api/dashboard/coordinator/current-upcoming-shifts] Error:", err);
        return NextResponse.json(
            { error: err?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
