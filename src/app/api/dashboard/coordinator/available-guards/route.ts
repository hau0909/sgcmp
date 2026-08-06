import { NextRequest, NextResponse, connection } from "next/server";
import { handleGetAvailableGuards } from "@/features/dashboard/controller/dashboard.controller";

export async function GET(request: NextRequest) {
    await connection();
    try {
        const { searchParams } = new URL(request.url);
        const companyId = searchParams.get("companyId") || undefined;
        const clientDate = searchParams.get("clientDate") || undefined;

        const result = await handleGetAvailableGuards(companyId, clientDate);

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const err = error as Error;
        console.error("[GET /api/dashboard/coordinator/available-guards] Error:", err);
        return NextResponse.json(
            { error: err?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
