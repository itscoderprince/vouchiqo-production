import {
  emailOTPClient,
  inferAdditionalFields,
  oneTapClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client — use this in all React components and hooks.
 *
 * Provides:
 *   authClient.signUp.email()
 *   authClient.signIn.email()
 *   authClient.signOut()
 *   authClient.useSession()         ← reactive session hook
 *   authClient.forgetPassword()
 *   authClient.resetPassword()
 *   authClient.oneTap()
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  plugins: [
    // Makes role + isActive fields available on the client session
    inferAdditionalFields({
      user: {
        role: {
          type: "string",
          defaultValue: "customer",
        },
        isActive: {
          type: "boolean",
          defaultValue: true,
        },
      },
    }),
    emailOTPClient(),
    oneTapClient({
      clientId:
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        process.env.GOOGLE_CLIENT_ID ||
        "",
      autoSelect: false,
      cancelOnTapOutside: true,
    }),
  ],
});

// Convenience named exports for common operations
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  forgetPassword,
  resetPassword,
} = authClient;
