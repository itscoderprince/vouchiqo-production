"use client";

import { useZodForm } from "@/hooks/use-zod-form";
import { registerSchema } from "../schemas/auth-schemas";
import { useRegister } from "./use-register";

/**
 * Custom React hook managing state, mobile sanitization, and form submission for RegisterForm.
 */
export function useRegisterForm() {
  const { mutate: registerUser, isPending } = useRegister();

  const form = useZodForm({
    schema: registerSchema,
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      agreed: false,
    },
  });

  const onSubmit = (data) => {
    const cleanPhone = data.phoneNumber.replace(/[\s-()]/g, "");
    registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
      phoneNumber: cleanPhone,
      role: "customer",
    });
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    setValue: form.setValue,
    watch: form.watch,
    errors: form.formState.errors,
    isPending,
  };
}
