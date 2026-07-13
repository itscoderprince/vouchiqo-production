"use client";

import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/features/auth/hooks/use-login";
import { signIn } from "@/lib/auth-client";
import { AuthCard } from "./auth-card";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending } = useLogin();

  const handleGoogleSignIn = async () => {
    try {
      const res = await fetch("/api/auth/google-check");
      const { isConfigured } = await res.json();

      if (isConfigured) {
        await signIn.social({
          provider: "google",
          callbackURL: "/auth/callback",
        });
      } else {
        toast("Dev Mode: Google OAuth not configured. Logging in as Demo...", {
          icon: "🔧",
        });
        login({ email: "customer@vouchiqo.com", password: "Password123!" });
      }
    } catch (err) {
      toast.error(err?.message ?? "Google authentication failed.");
    }
  };

  return (
    <AuthCard title="Log In">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login({ email, password });
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
              placeholder="name@company.com"
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
              href="/auth/forgot-password"
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
          className="btn-primary w-full py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-1 border-0 h-auto cursor-pointer shadow-none"
        >
          <span>{isPending ? "Logging in..." : "Log In"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <hr className="border-t border-brand-border w-full" />
        <span className="absolute bg-brand-bg px-3 text-[11px] font-medium text-brand-subtext">
          or log in with
        </span>
      </div>

      {/* Google Sign In Button */}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full h-10 border border-brand-border bg-brand-surface hover:bg-brand-bg text-brand-text hover:text-brand-navy flex items-center justify-center gap-2.5 rounded-md text-sm font-semibold transition-all shadow-none cursor-pointer"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.23 2.673 1.24 6.636l4.026 3.129Z"
          />
          <path
            fill="#FBBC05"
            d="M1.24 6.636A11.954 11.954 0 0 0 0 12c0 1.92.453 3.737 1.24 5.364L5.266 14.23A7.054 7.054 0 0 1 4.91 12c0-1.127.263-2.2.734-3.13L1.24 6.636Z"
          />
          <path
            fill="#4285F4"
            d="M12 24c3.245 0 5.973-1.073 7.964-2.927l-3.864-3A7.064 7.064 0 0 1 12 19.091c-3.69 0-6.809-2.49-7.927-5.86L1.24 17.36A11.996 11.996 0 0 0 12 24Z"
          />
          <path
            fill="#34A853"
            d="M23.52 12.273c0-.818-.073-1.609-.208-2.373H12v4.582h6.473c-.273 1.455-1.09 2.69-2.318 3.518l3.864 3c2.255-2.082 3.5-5.155 3.5-8.727Z"
          />
        </svg>
        <span>Google Account</span>
      </Button>

      <p className="text-center text-sm font-medium text-brand-subtext mt-4">
        Don't have an account?{" "}
        <Link
          href="/auth/register"
          className="text-brand-blue font-bold hover:underline"
        >
          Create one free
        </Link>
      </p>
    </AuthCard>
  );
}
