import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Email is required" })
  .email({ message: "Enter a valid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, { message: "Name is required" })
      .max(60, { message: "Name must be less than 60 characters" }),
    lastName: z
      .string()
      .trim()
      .min(1, { message: "Surname is required" })
      .max(60, { message: "Surname must be less than 60 characters" }),
    email: emailSchema,
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(72, { message: "Password must be less than 72 characters" }),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Remember-me: when unchecked, the session is dropped once the browser tab session ends. */
const REMEMBER_KEY = "kaelo.remember-me";
const TAB_KEY = "kaelo.tab-alive";

export function setRememberMe(remember: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
  window.sessionStorage.setItem(TAB_KEY, "1");
}

export function shouldDropSession(): boolean {
  if (typeof window === "undefined") return false;
  const remembered = window.localStorage.getItem(REMEMBER_KEY) === "1";
  const sameTabSession = window.sessionStorage.getItem(TAB_KEY) === "1";
  return !remembered && !sameTabSession;
}

export function clearRememberMe() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REMEMBER_KEY);
  window.sessionStorage.removeItem(TAB_KEY);
}
