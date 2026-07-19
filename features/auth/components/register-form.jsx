"use client";

import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/features/auth/hooks/use-register";
import { signIn } from "@/lib/auth-client";
import { AuthCard } from "./auth-card";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const { mutate: register, isPending } = useRegister();

  const handleGoogleSignIn = async () => {
    try {
      const res = await fetch("/api/auth/google-check");
      const { isConfigured } = await res.json();

      if (isConfigured) {
        await signIn.social({
          provider: "google",
          callbackURL: `/auth/callback?role=customer`,
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    const cleanPhone = phoneNumber.replace(/[\s-()]/g, "");
    if (!/^\+?\d{10,15}$/.test(cleanPhone)) {
      return toast.error("Please enter a valid mobile number (10–15 digits).");
    }
    if (!agreed) return toast.error("Please agree to the Terms of Service.");
    register({ email, password, name, phoneNumber: cleanPhone, role: "customer" });
  };

  return (
    <AuthCard title="Create your free account">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <InputGroup className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-250/70 dark:border-zinc-800 rounded-md h-10 px-2 transition-all has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-brand-blue/60">
            <InputGroupAddon>
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base md:text-sm placeholder:font-light placeholder:text-slate-400 dark:placeholder:text-slate-600 h-full font-normal"
              required
              autoFocus
            />
          </InputGroup>
        </div>

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
              className="text-base md:text-sm placeholder:font-light placeholder:text-slate-400 dark:placeholder:text-slate-600 h-full font-normal"
              required
            />
          </InputGroup>
        </div>

        <div className="space-y-1.5">
          <InputGroup className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-250/70 dark:border-zinc-800 rounded-md h-10 px-2 transition-all has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-brand-blue/60">
            <InputGroupAddon>
              <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </InputGroupAddon>
            <InputGroupInput
              type="tel"
              placeholder="Mobile Number (e.g. 9876543210)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-base md:text-sm placeholder:font-light placeholder:text-slate-400 dark:placeholder:text-slate-600 h-full font-normal"
              required
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
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-base md:text-sm placeholder:font-light placeholder:text-slate-400 dark:placeholder:text-slate-600 h-full font-normal"
              required
              minLength={8}
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

        <div className="space-y-1.5">
          <InputGroup className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-250/70 dark:border-zinc-800 rounded-md h-10 px-2 transition-all has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-brand-blue/60">
            <InputGroupAddon>
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </InputGroupAddon>
            <InputGroupInput
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-base md:text-sm placeholder:font-light placeholder:text-slate-400 dark:placeholder:text-slate-600 h-full font-normal"
              required
              minLength={8}
            />
            <InputGroupAddon align="inline-end" className="pr-0.5">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-450 p-1 focus:outline-none cursor-pointer border-0 bg-transparent"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="flex items-start gap-2.5 py-0.5">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(!!v)}
            className="mt-0.5 border-slate-350 dark:border-zinc-700 text-brand-blue focus:ring-brand-blue/20 rounded-sm w-3.5 h-3.5 cursor-pointer data-open:bg-brand-blue data-open:border-brand-blue"
          />
          <label
            htmlFor="agree"
            className="text-[11px] md:text-xs text-slate-500 dark:text-slate-455 leading-snug cursor-pointer select-none text-left font-normal animate-none"
          >
            I agree to the{" "}
            <Link href="/terms" className="text-brand-blue font-semibold">
              Terms
            </Link>{" "}
            &{" "}
            <Link href="/privacy" className="text-brand-blue font-semibold">
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-md py-2 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 border-0 h-auto cursor-pointer shadow-none disabled:opacity-50 disabled:pointer-events-none mt-1"
        >
          <span>{isPending ? "Creating Account..." : "Create Account"}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <hr className="border-t border-slate-100 dark:border-zinc-900 w-full" />
        <span className="absolute bg-white dark:bg-zinc-950 px-2.5 text-[9px] font-normal text-slate-400 dark:text-slate-500 tracking-wider uppercase">
          Or continue with
        </span>
      </div>

      {/* Google Sign In Button */}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full h-10 border border-slate-200 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-slate-600 dark:text-slate-355 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-all shadow-none cursor-pointer"
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
        Have an account?{" "}
        <Link
          href="/login"
          className="text-brand-blue hover:text-blue-700 font-semibold transition-colors ml-0.5"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
