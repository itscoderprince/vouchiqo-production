"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signUp } from "@/lib/auth-client";

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, name, role }) =>
      signUp.email({
        email,
        password,
        name,
        data: { role },
      }),

    onSuccess: async ({ data, error }, variables) => {
      if (error) {
        toast.error(error.message ?? "Registration failed");
        return;
      }
      toast.success("Account created! Welcome to Vouchiqo 🎉");

      // Invalidate session so dashboards read fresh data
      await queryClient.invalidateQueries({ queryKey: ["session"] });

      const dest =
        variables.role === "merchant"
          ? "/merchant/dashboard"
          : "/";

      router.replace(dest);
    },

    onError: (err) =>
      toast.error(err?.message ?? "Something went wrong. Try again."),
  });
}
