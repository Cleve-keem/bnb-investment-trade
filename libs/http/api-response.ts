import { NextResponse } from "next/server";

export class ApiResponse {
  static success<T>(data: T, message?: string) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      {
        status: 200,
      },
    );
  }

  static created<T>(data: T, message?: string) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      {
        status: 201,
      },
    );
  }

  static error(message: string, status = 400) {
    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status,
      },
    );
  }
}
