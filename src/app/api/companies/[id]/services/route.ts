import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: companyId } = await params;
    const body = await request.json();
    const { serviceId, description, price } = body;

    if (!companyId || !serviceId || price === undefined) {
      return NextResponse.json(
        { error: "Thông tin không đầy đủ" },
        { status: 400 }
      );
    }

    const supabaseServer = await createClient();

    // Check if the service is already added for this company
    const { data: existing } = await supabaseServer
      .from("company_services")
      .select("*")
      .eq("company_id", companyId)
      .eq("service_id", serviceId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Dịch vụ này đã được đăng ký cho công ty" },
        { status: 400 }
      );
    }

    // Insert new company service
    const { data, error } = await supabaseServer
      .from("company_services")
      .insert({
        company_id: companyId,
        service_id: serviceId,
        description: description || "",
        price: Number(price)
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/companies/[id]/services] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: companyId } = await params;
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");

    if (!companyId || !serviceId) {
      return NextResponse.json(
        { error: "Thông tin không đầy đủ" },
        { status: 400 }
      );
    }

    const supabaseServer = await createClient();

    const { error } = await supabaseServer
      .from("company_services")
      .delete()
      .eq("company_id", companyId)
      .eq("service_id", serviceId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("[DELETE /api/companies/[id]/services] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
