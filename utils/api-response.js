import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { AppError } from "@/utils/app-error";
import { HTTP } from "@/utils/constants";

/**
 * Standard success response.
 * @param {*} data - Response payload
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 */
export function ok(data, message = "Success", status = HTTP.OK) {
  return NextResponse.json({ success: true, message, data }, { status });
}

/**
 * Standard 201 Created response.
 */
export function created(data, message = "Created successfully") {
  return ok(data, message, HTTP.CREATED);
}

/**
 * Standard 204 No Content response.
 */
export function noContent() {
  return new NextResponse(null, { status: HTTP.NO_CONTENT });
}

/**
 * Standard error response.
 * @param {string} message - Error message safe to show the client
 * @param {number} status - HTTP status code
 * @param {string|null} code - Machine-readable error code
 */
export function error(message, status = HTTP.INTERNAL_ERROR, code = null) {
  return NextResponse.json({ success: false, message, code }, { status });
}

/**
 * Central error handler — converts any thrown error into the right HTTP response.
 * Call this in catch blocks inside route handlers.
 *
 * @param {unknown} err - The caught error
 */
export function handleError(err) {
  // Known operational errors — safe to expose
  if (err instanceof AppError) {
    return error(err.message, err.statusCode, err.code);
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    return error(`${field} already exists`, HTTP.CONFLICT, "DUPLICATE_KEY");
  }

  // Mongoose document validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return error(message, HTTP.UNPROCESSABLE, "VALIDATION_ERROR");
  }

  // Zod parse errors
  if (err.name === "ZodError" || err.issues) {
    console.error(
      "Zod Validation Failed:",
      JSON.stringify(err.issues || err.errors || err, null, 2),
    );
    const issues = err.issues || err.errors || [];
    const first = issues[0];
    const message = first
      ? `${first.path.join(".")}: ${first.message}`
      : "Invalid input";
    return error(message, HTTP.BAD_REQUEST, "INVALID_INPUT");
  }

  // Unknown errors — don't expose internals
  logger.error({ err }, "Unhandled server error");
  return error("Something went wrong", HTTP.INTERNAL_ERROR, "INTERNAL_ERROR");
}
