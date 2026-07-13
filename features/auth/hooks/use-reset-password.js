"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { resetPassword } from "@/lib/auth-client";

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ password, token }) =>
      resetPassword({ newPassword: password, token }),

    onSuccess: ({ error }) => {
      if (error) {
        toast.error(
          error.message ?? "Failed to reset password. Link may have expired.",
        );
        return;
      }
      toast.success("Password updated! Please sign in.");
      router.push("/login");
    },

    onError: (err) =>
      toast.error(err?.message ?? "Something went wrong. Try again."),
  });
}
