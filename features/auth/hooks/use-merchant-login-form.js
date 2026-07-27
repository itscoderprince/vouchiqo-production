"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/use-user";
import { useZodForm } from "@/hooks/use-zod-form";
import { signIn, signOut } from "@/lib/auth-client";
import { merchantLoginSchema } from "../schemas/auth-schemas";

/**
 * Custom hook isolating the form state and query logic for MerchantLoginForm.
 */
export function useMerchantLoginForm() {
  const { user, role, isLoaded } = useUser();
  const router = useRouter();

  const form = useZodForm({
    schema: merchantLoginSchema,
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isLoaded && user && role === "merchant") {
      router.replace("/merchant/dashboard");
    }
  }, [user, role, isLoaded, router]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => signIn.email({ email, password }),
    onSuccess: async ({ data, error }) => {
      if (error) {
        toast.error(error.message ?? "Invalid credentials");
        return;
      }
      let effectiveRole = data?.user?.role;
      if (effectiveRole !== "merchant") {
        const checkRes = await fetch("/api/merchants/me").catch(() => null);
        if (checkRes?.ok) {
          effectiveRole = "merchant";
        }
      }

      if (effectiveRole !== "merchant") {
        toast.error("Access denied. This login page is for merchants only.");
        await signOut();
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem("vouchiqo_is_merchant", "true");
      }
      toast.success("Welcome back, Merchant Partner!");
      router.replace("/merchant/dashboard");
    },
    onError: (err) => {
      toast.error(err?.message ?? "Something went wrong. Try again.");
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate({ email: data.email, password: data.password });
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    isPending: loginMutation.isPending,
  };
}
