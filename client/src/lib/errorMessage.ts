import { AxiosError } from "axios";
import type { ProblemDetails } from "./types";

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof AxiosError) {
    const problem = error.response?.data as ProblemDetails | undefined;
    if (problem?.errors) {
      const firstField = Object.values(problem.errors)[0];
      if (firstField?.length) return firstField[0];
    }
    if (problem?.title) return problem.title;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
