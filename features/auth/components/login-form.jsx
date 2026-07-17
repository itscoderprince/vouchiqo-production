"use client";

import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useUser } from "@/hooks/use-user";
import { signIn } from "@/lib/auth-client";
import { AuthCard } from "./auth-card";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();
  const { user, role, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      if (role === "admin") {
        router.replace("/admin/dashboard");
      } else if (role === "merchant") {
        router.replace("/merchant/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [user, role, isLoaded, router]);

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
        toast.error(
          "Google sign-in is not available. Please use email and password.",
        );
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
        className="space-y-3.5"
      >
        <div className="space-y-1.5">
          <InputGroup className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-250/70 dark:border-zinc-800 rounded-md h-10 px-2 transition-all has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-brand-blue/60">
            <InputGroupAddon>
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </InputGroupAddon>
            <InputGroupInput
              type="email"
              placeholder="aaravsharma@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-base md:text-sm placeholder:font-light placeholder:text-slate-400 dark:placeholder:text-slate-655 h-full font-normal"
              required
              autoFocus
            />
          </InputGroup>
        </div>

        <div className="space-y-1.5">
          <InputGroup className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-250/70 dark:border-zinc-800 rounded-md h-10 px-2 transition-all has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-brand-blue/60">
            <InputGroupAddon>
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </InputGroupAddon>
            <InputGroupInput
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-base md:text-sm placeholder:font-light placeholder:text-slate-400 dark:placeholder:text-slate-655 h-full font-normal"
              required
            />
            <InputGroupAddon align="inline-end" className="pr-0.5">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-450 p-1 focus:outline-none cursor-pointer border-0 bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              className="border-slate-300 dark:border-zinc-700 text-brand-blue focus:ring-brand-blue/20 rounded-sm w-3.5 h-3.5 cursor-pointer data-open:bg-brand-blue data-open:border-brand-blue"
            />
            <Label
              htmlFor="remember"
              className="text-xs md:text-sm font-normal text-slate-500 dark:text-slate-400 cursor-pointer select-none"
            >
              Remember me
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-xs md:text-sm text-brand-blue dark:text-brand-blue font-normal transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-md py-2 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 border-0 h-auto cursor-pointer shadow-none disabled:opacity-50 disabled:pointer-events-none mt-1"
        >
          <span>{isPending ? "Signing In..." : "Sign In"}</span>
          {!isPending && <ArrowRight className="w-4 h-4" />}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <hr className="border-t border-slate-100 dark:border-zinc-900 w-full" />
        <span className="absolute bg-white dark:bg-zinc-950 px-2.5 text-[9px] font-normal text-slate-400 dark:text-slate-500 tracking-wider uppercase">
          Or Continue With
        </span>
      </div>

      {/* Google Sign In Button */}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full h-10 border border-slate-200 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-slate-600 dark:text-slate-350 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all shadow-none cursor-pointer"
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
        <span>Google</span>
      </Button>

      <p className="text-center text-xs font-normal text-slate-400 dark:text-slate-500 mt-4">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-brand-blue hover:text-blue-700 font-semibold transition-colors ml-0.5"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
