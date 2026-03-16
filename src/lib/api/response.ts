import { NextResponse } from "next/server";

import type { ApiResponse } from "@/lib/types/api";

export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      error: null,
      meta,
    },
    { status },
  );
}

export function fail(message: string, status = 400, meta?: Record<string, unknown>) {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      data: null,
      error: message,
      meta,
    },
    { status },
  );
}
