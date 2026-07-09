import { VerificationStatus } from "../types";

export interface UpdateVerificationInput {
  status?: VerificationStatus;
  description?: string;
  notes?: string;
  images?: string[];
}

export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string } };

export const updateVerificationSchema = {
  safeParse(body: unknown): SafeParseResult<UpdateVerificationInput> {
    if (typeof body !== "object" || body === null) {
      return { success: false, error: { message: "Body phải là object." } };
    }

    const b = body as Record<string, unknown>;
    const validStatuses: VerificationStatus[] = ["pending", "approved", "rejected"];

    if (b.status !== undefined && !validStatuses.includes(b.status as VerificationStatus)) {
      return { success: false, error: { message: `Trạng thái không hợp lệ: ${b.status}` } };
    }

    if (b.description !== undefined && typeof b.description !== "string") {
      return { success: false, error: { message: "description phải là string." } };
    }

    if (b.notes !== undefined && typeof b.notes !== "string") {
      return { success: false, error: { message: "notes phải là string." } };
    }

    if (b.images !== undefined) {
      if (!Array.isArray(b.images)) {
        return { success: false, error: { message: "images phải là array." } };
      }
      for (const img of b.images) {
        if (typeof img !== "string") {
          return { success: false, error: { message: "Mỗi phần tử trong images phải là string URL." } };
        }
      }
    }

    return {
      success: true,
      data: {
        ...(b.status !== undefined && { status: b.status as VerificationStatus }),
        ...(b.description !== undefined && { description: b.description as string }),
        ...(b.notes !== undefined && { notes: b.notes as string }),
        ...(b.images !== undefined && { images: b.images as string[] }),
      },
    };
  },
};
