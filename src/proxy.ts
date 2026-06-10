import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getAllowedRolesByPath } from "./lib/auth/role-route";

const publicRoutes = ["/", "/login", "/register", "/verify", "/unauthorized"];

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(route);
  });
}

function shouldSkipProxy(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)
  );
}

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

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone();

  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);

  return NextResponse.redirect(loginUrl);
}

function redirectToUnauthorized(request: NextRequest) {
  const returnTo = getPreviousPath(request);

  const unauthorizedUrl = request.nextUrl.clone();

  unauthorizedUrl.pathname = "/unauthorized";
  unauthorizedUrl.search = "";
  unauthorizedUrl.searchParams.set("returnTo", returnTo);

  return NextResponse.redirect(unauthorizedUrl);
}

function isRoleAllowed(
  role: string | null | undefined,
  allowedRoles: string[],
) {
  if (!role) return false;

  return allowedRoles.some(
    (allowedRole) => allowedRole.toLowerCase() === role.toLowerCase(),
  );
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  /**
   * Bỏ qua API, Next assets, image/static files.
   */
  if (shouldSkipProxy(pathname)) {
    return NextResponse.next();
  }

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

  /**
   * Route public thì cho đi qua.
   * Ví dụ: /, /login, /register, /verify, /unauthorized
   */
  if (isPublicRoute(pathname)) {
    return response;
  }

  const allowedRoles = getAllowedRolesByPath(pathname);

  /**
   * Route không nằm trong protectedRoutes thì cho qua.
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

    return redirectToLogin(request);
  }

  /**
   * Chưa login thật sự thì về login.
   */
  if (!user || error) {
    return redirectToLogin(request);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("user_id", user.id)
    .maybeSingle();

  /**
   * Có user auth nhưng không có profile thì về login.
   */
  if (profileError || !profile) {
    return redirectToLogin(request);
  }

  /**
   * Account không active thì qua unauthorized.
   */
  if (profile.status !== "active") {
    return redirectToUnauthorized(request);
  }

  const role = String(profile.role);

  /**
   * Check role không phân biệt hoa thường.
   * Ví dụ: Coordinator và coordinator đều pass.
   */
  if (!isRoleAllowed(role, allowedRoles)) {
    return redirectToUnauthorized(request);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
