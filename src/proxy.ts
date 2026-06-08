import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAllowedRolesByPath, type UserRole } from "./lib/auth/role-route";

function getPreviousPath(request: NextRequest) {
  const referer = request.headers.get("referer");

  if (!referer) {
    return "/";
  }

  try {
    const previousUrl = new URL(referer);
    const currentUrl = request.nextUrl;

    /**
     * Chỉ cho quay lại cùng domain.
     */
    if (previousUrl.origin !== currentUrl.origin) {
      return "/";
    }

    /**
     * Tránh quay lại chính route đang bị chặn.
     */
    if (previousUrl.pathname === currentUrl.pathname) {
      return "/";
    }

    /**
     * Tránh returnTo về chính trang unauthorized.
     */
    if (previousUrl.pathname === "/unauthorized") {
      return "/";
    }

    return `${previousUrl.pathname}${previousUrl.search}`;
  } catch {
    return "/";
  }
}

function redirectToUnauthorized(request: NextRequest) {
  const returnTo = getPreviousPath(request);

  const unauthorizedUrl = request.nextUrl.clone();

  unauthorizedUrl.pathname = "/unauthorized";
  unauthorizedUrl.search = "";
  unauthorizedUrl.searchParams.set("returnTo", returnTo);

  return NextResponse.redirect(unauthorizedUrl);
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const allowedRoles = getAllowedRolesByPath(pathname);

  /**
   * Route không cần protect.
   */
  if (!allowedRoles) {
    return response;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  /**
   * Refresh token lỗi thì xóa cookie Supabase.
   */
  if (error?.code === "refresh_token_not_found") {
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.startsWith("sb-")) {
        response.cookies.delete(cookie.name);
      }
    });
  }

  /**
   * Chưa login thật sự thì về login.
   */
  if (!user || error) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(loginUrl);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    const loginUrl = request.nextUrl.clone();

    loginUrl.pathname = "/login";

    return NextResponse.redirect(loginUrl);
  }

  /**
   * Account không active thì qua unauthorized,
   * kèm returnTo là trang trước đó.
   */
  if (profile.status !== "active") {
    return redirectToUnauthorized(request);
  }

  const role = String(profile.role).toLowerCase() as UserRole;

  /**
   * Sai role thì qua unauthorized,
   * kèm returnTo là trang trước đó.
   */
  if (!allowedRoles.includes(role)) {
    return redirectToUnauthorized(request);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
