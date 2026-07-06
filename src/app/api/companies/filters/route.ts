import { handleGetCompanyFilters } from "@/features/company/controller/company.controller";
import { NextResponse, NextRequest, connection } from "next/server";

export async function GET(request: NextRequest) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const location = searchParams.get("location") || undefined;
    
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",") : undefined;
    
    const sortBy = searchParams.get("sortBy") || undefined;
    
    const minPriceVal = searchParams.get("minPrice");
    const minPrice = minPriceVal ? parseInt(minPriceVal, 10) : undefined;

    const maxPriceVal = searchParams.get("maxPrice");
    const maxPrice = maxPriceVal ? parseInt(maxPriceVal, 10) : undefined;
    
    const pageVal = searchParams.get("page");
    const page = pageVal ? parseInt(pageVal, 10) : undefined;
    
    const limitVal = searchParams.get("limit");
    const limit = limitVal ? parseInt(limitVal, 10) : undefined;

    const result = await handleGetCompanyFilters({
      search,
      location,
      tags,
      sortBy,
      minPrice,
      maxPrice,
      page,
      limit,
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const err = error as Error;
    console.error("[GET /api/companies/filters] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
