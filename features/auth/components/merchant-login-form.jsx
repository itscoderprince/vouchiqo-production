"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-user";
import { signIn, signOut } from "@/lib/auth-client";
import { AuthCard } from "./auth-card";

export function MerchantLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, role, isLoaded } = useUser();
  const router = useRouter();

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
      const role = data?.user?.role ?? "customer";
      if (role !== "merchant") {
        toast.error("Access denied. This login page is for merchants only.");
        await signOut();
        return;
      }
      toast.success("Welcome back, Merchant Partner!");
      router.replace("/merchant/dashboard");
    },
    onError: (err) => {
      toast.error(err?.message ?? "Something went wrong. Try again.");
    },
  });

  const isPending = loginMutation.isPending;

  return (
    <AuthCard title="Merchant Partner Log In">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          loginMutation.mutate({ email, password });
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-brand-text">
            Email Address
          </Label>
          <InputGroup className="bg-brand-surface border border-brand-border rounded-md h-10 px-1">
            <InputGroupAddon>
              <Mail className="w-4 h-4 text-brand-subtext" />
            </InputGroupAddon>
            <InputGroupInput
              type="email"
              placeholder="rahulsharma@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-base md:text-sm placeholder-brand-subtext h-full"
              required
              autoFocus
            />
          </InputGroup>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-brand-text">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs md:text-sm text-brand-blue font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <InputGroup className="bg-brand-surface border border-brand-border rounded-md h-10 px-1">
            <InputGroupAddon>
              <Lock className="w-4 h-4 text-brand-subtext" />
            </InputGroupAddon>
            <InputGroupInput
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-base md:text-sm placeholder-brand-subtext h-full"
              required
            />
          </InputGroup>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold flex items-center justify-center gap-1 border-0 h-auto cursor-pointer shadow-none transition-all"
        >
          <span>{isPending ? "Logging in..." : "Log In as Merchant"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </form>

      <p className="text-center text-sm font-medium text-brand-subtext mt-4">
        Want to sell on Vouchiqo?{" "}
        <Link
          href="/merchant-register"
          className="text-brand-blue font-bold hover:underline"
        >
          Register your brand
        </Link>
      </p>
    </AuthCard>
  );
}
