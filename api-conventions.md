# Quy chuẩn Thiết kế và Phát triển API (API Conventions)

Tài liệu này mô tả chi tiết kiến trúc phân tầng (Layered Architecture) chuẩn của dự án hiện tại, các tầng (states/layers) xử lý, trách nhiệm của từng tầng, định dạng dữ liệu trả về (return type) và cách xử lý lỗi (exception handling).

---

## 🗺️ Luồng Đi Của Dữ Liệu (Data Flow)

Luồng xử lý của một API được chia thành 2 phần chính: **Client-side** và **Server-side**.

### 1. Client-Side Flow
```
Component (UI) ──> Client API (fetcher) ──> HTTP Request
```

### 2. Server-Side Flow
```
HTTP Request ──> Route (Next.js) ──> Controller ──> Service ──> Repository ──> Database (Supabase)
```

---

## 🏛️ Chi Tiết Các Tầng (Layers) & Chức Năng Của Hàm

### Tầng 1: Client API (Client-side)
*   **Vị trí thư mục:** `src/features/[feature_name]/api/` (Ví dụ: `src/features/subscription/api/subscription.api.ts`)
*   **Trách nhiệm:** 
    *   Định nghĩa các hàm gọi HTTP request từ client lên Next.js API.
    *   Sử dụng hàm helper `fetcher` từ `src/lib/fetcher.ts` để gọi API.
*   **Các hàm tiêu biểu:** `requestGetAllPlans()`, `requestCreateSubscription()`,...
*   **Quy chuẩn viết hàm:**
    ```typescript
    import { fetcher } from "@/lib/fetcher";

    export async function requestGetAllPlans() {
      return await fetcher("/api/subscriptions/plans", {
        method: "GET",
      });
    }
    ```

---

### Tầng 2: Route Handler (Server-side)
*   **Vị trí thư mục:** `src/app/api/[path]/route.ts` (Ví dụ: `src/app/api/subscriptions/plans/route.ts`)
*   **Trách nhiệm:** 
    *   Lắng nghe các HTTP request (GET, POST, PUT, DELETE,...).
    *   Nhận và kiểm tra sơ bộ các thông tin từ HTTP Request (Query params, Body payloads, Headers).
    *   Sử dụng khối `try/catch` bọc toàn bộ logic gọi Controller để xử lý ngoại lệ cấp cao nhất.
    *   Trả về HTTP Response (`NextResponse.json`) kèm theo HTTP Status Code phù hợp.
*   **Các hàm tiêu biểu:** `GET()`, `POST()`, `PUT()`, `DELETE()`.
*   **Quy chuẩn viết hàm:**
    ```typescript
    import { handleGetAllPlans } from "@/features/subscription/controller/subscription.controller";
    import { NextResponse } from "next/server";

    export async function GET() {
      try {
        const result = await handleGetAllPlans();
        return NextResponse.json({ plans: result }, { status: 200 });
      } catch (error) {
        console.error("[GET /api/subscriptions/plans] Error:", error);
        return NextResponse.json(
          { error: "Internal Server Error" },
          { status: 500 }
        );
      }
    }
    ```

---

### Tầng 3: Controller (Server-side)
*   **Vị trí thư mục:** `src/features/[feature_name]/controller/` (Ví dụ: `src/features/subscription/controller/subscription.controller.ts`)
*   **Trách nhiệm:**
    *   Đóng vai trò là cầu nối điều phối (Orchestration) giữa tầng Route và tầng Service.
    *   Tách biệt logic HTTP của Next.js khỏi nghiệp vụ (Business logic).
    *   Nhận tham số dạng thuần (primitive types/interfaces), chuyển tiếp cho Service.
*   **Các hàm tiêu biểu:** `handleGetAllPlans()`, `handleCreatePlan()`,...
*   **Quy chuẩn viết hàm (Đảm bảo Type-safety):**
    ```typescript
    import { Plan } from "@/types/Plan";
    import { getAllPlansService } from "../service/subscription.service";

    export const handleGetAllPlans = async (): Promise<Plan[]> => {
      const result = await getAllPlansService();
      return result;
    };
    ```

---

### Tầng 4: Service (Server-side)
*   **Vị trí thư mục:** `src/features/[feature_name]/service/` (Ví dụ: `src/features/subscription/service/subscription.service.ts`)
*   **Trách nhiệm:**
    *   Chứa toàn bộ các logic nghiệp vụ (Business Logic).
    *   Thực hiện kiểm tra tính hợp lệ của dữ liệu (Validation), tính toán, phân quyền nghiệp vụ.
    *   Gọi các hàm từ Repository để tương tác với cơ sở dữ liệu.
*   **Các hàm tiêu biểu:** `getAllPlansService()`, `verifySubscriptionService()`,...
*   **Quy chuẩn viết hàm (Đảm bảo Type-safety):**
    ```typescript
    import { Plan } from "@/types/Plan";
    import { getAllPlans } from "../repository/subscription.repository";

    export const getAllPlansService = async (): Promise<Plan[]> => {
      const result = await getAllPlans();
      return result;
    };
    ```

---

### Tầng 5: Repository (Server-side)
*   **Vị trí thư mục:** `src/features/[feature_name]/repository/` (Ví dụ: `src/features/subscription/repository/subscription.repository.ts`)
*   **Trách nhiệm:**
    *   Tương tác trực tiếp với cơ sở dữ liệu (Database Client - Supabase).
    *   Thực hiện các thao tác CRUD (Create, Read, Update, Delete) thuần túy.
    *   **Không** chứa logic nghiệp vụ.
*   **Các hàm tiêu biểu:** `getAllPlans()`, `getPlanById()`, `insertPlan()`,...
*   **Quy chuẩn viết hàm (Xử lý Exception & Safe fallback):**
    *   Nếu có lỗi từ Database client (`error` của Supabase), sử dụng `throw error` để ném lỗi lên tầng trên.
    *   Sử dụng toán tử dự phòng (Fallback) như `|| []` hoặc `|| null` để đảm bảo kiểu dữ liệu trả về đồng nhất và an toàn cho các tầng trên xử lý.
    ```typescript
    import { supabase } from "@/lib/supabase";
    import { Plan } from "@/types/Plan";

    export const getAllPlans = async (): Promise<Plan[]> => {
      const { data, error } = await supabase.from("plans").select("*");

      if (error) {
        throw error; // Đẩy exception lên các tầng trên
      }

      return (data as Plan[]) || []; // Trả về mảng rỗng nếu data bị null
    };
    ```

---

## ⚠️ Nguyên Tắc Vàng Khi Viết API Trong Dự Án

1.  **Đồng nhất tên hàm (Naming Conventions):**
    *   Repository: `[verb][Noun]` (Ví dụ: `getAllPlans`)
    *   Service: `[verb][Noun]Service` (Ví dụ: `getAllPlansService`)
    *   Controller: `handle[Verb][Noun]` (Ví dụ: `handleGetAllPlans`)
    *   Client API: `request[Verb][Noun]` (Ví dụ: `requestGetAllPlans`)
2.  **Khai báo Type rõ ràng:** 
    *   Luôn khai báo kiểu dữ liệu trả về (`Promise<T>`) ở các tầng Repository, Service và Controller để TypeScript hỗ trợ check type lúc build time.
3.  **Quản lý Lỗi (Exception Handling):**
    *   Repository: `throw error` trực tiếp nếu Database gặp sự cố.
    *   Service & Controller: Không lạm dụng `try/catch` bừa bãi trừ khi cần bắt lỗi để ghi đè (override) dữ liệu lỗi hoặc thực hiện logic fallback cụ thể.
    *   Route: Luôn có `try/catch` bọc bên ngoài cùng để ghi log (`console.error`) và phản hồi lỗi an toàn về phía client (HTTP Status `500` cho lỗi hệ thống, `400` cho lỗi validation, `404` cho lỗi không tìm thấy...).
