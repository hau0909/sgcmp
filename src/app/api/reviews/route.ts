import { NextResponse } from 'next/server';
import { handleCreateReview } from '@/features/review/controller/review.controller';
import { CreateReviewPayload } from '@/features/review/types';

export async function POST(request: Request) {
  try {
    const body: CreateReviewPayload = await request.json();
    const review = await handleCreateReview(body);
    
    return NextResponse.json(
      { message: 'Review submitted successfully', review },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('API /reviews POST Error:', error);
    return NextResponse.json(
      { message: error?.message || 'Internal Server Error' },
      { status: 400 }
    );
  }
}
