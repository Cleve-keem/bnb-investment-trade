import { ZodError } from "zod";
import { ApiResponse } from "@/libs/http/api-response";
import { AppError } from "./app-error";

export class ErrorHandler {
  static handle(error: unknown) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Validation failed";
      return ApiResponse.error(message, 400);
    }

    if (error instanceof AppError) {
      return ApiResponse.error(error.message, error.statusCode);
    }

    console.error(error);
    return ApiResponse.error("Internal server error.", 500);
  }
}