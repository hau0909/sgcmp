import { NextResponse } from 'next/server';
import { handleGetReviewsByCompany } from '@/features/review/controller/review.controller';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
    }

    const reviews = await handleGetReviewsByCompany(companyId);
    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/reviews/company] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
