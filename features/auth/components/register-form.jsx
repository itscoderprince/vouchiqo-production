"use client";

import { ArrowRight, Lock, Mail, Store, User } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogin } from "@/features/auth/hooks/use-login";
import { useRegister } from "@/features/auth/hooks/use-register";
import { signIn } from "@/lib/auth-client";
import { AuthCard } from "./auth-card";

export function RegisterForm() {
  const [role, setRole] = useState("customer");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const { mutate: register, isPending } = useRegister();
  const { mutate: login } = useLogin();

  const handleGoogleSignIn = async () => {
    try {
      const res = await fetch("/api/auth/google-check");
      const { isConfigured } = await res.json();

      if (isConfigured) {
        await signIn.social({
          provider: "google",
          callbackURL: `/auth/callback?role=${role}`,
        });
      } else {
        const demoEmail =
          role === "merchant"
            ? "merchant@vouchiqo.com"
            : "customer@vouchiqo.com";
        const demoPassword =
          role === "merchant" ? "Merchant@123!" : "Password123!";

        toast(
          `Dev Mode: Google OAuth not configured. Logging in as Demo ${role}...`,
          {
            icon: "🔧",
          },
        );
        login({ email: demoEmail, password: demoPassword });
      }
    } catch (err) {
      toast.error(err?.message ?? "Google authentication failed.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) return toast.error("Please agree to the Terms of Service.");
    register({ email, password, name: name || businessName, role });
  };

  return (
    <AuthCard title="Create your free account">
      <Tabs value={role} onValueChange={setRole}>
        <TabsList className="grid w-full grid-cols-2 bg-brand-surface p-1 border border-brand-border h-10">
          <TabsTrigger
            value="customer"
            className="flex items-center gap-2 text-xs font-bold data-[state=active]:bg-brand-bg data-[state=active]:text-brand-navy data-[state=active]:shadow-sm"
          >
            <User className="w-4 h-4" /> Customer
          </TabsTrigger>
          <TabsTrigger
            value="merchant"
            className="flex items-center gap-2 text-xs font-bold data-[state=active]:bg-brand-bg data-[state=active]:text-brand-navy data-[state=active]:shadow-sm"
          >
            <Store className="w-4 h-4" /> Merchant
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="space-y-4">
        {role === "merchant" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-brand-text uppercase">
              Brand Name
            </Label>
            <InputGroup className="bg-brand-surface border border-brand-border rounded-lg h-10 px-1">
              <InputGroupAddon>
                <Store className="w-4 h-4 text-brand-subtext" />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                placeholder="e.g. Starbucks"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="text-base md:text-sm placeholder-brand-subtext h-full"
                required
              />
            </InputGroup>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-brand-text uppercase">
            {role === "merchant" ? "Contact Name" : "Full Name"}
          </Label>
          <InputGroup className="bg-brand-surface border border-brand-border rounded-lg h-10 px-1">
            <InputGroupAddon>
              <User className="w-4 h-4 text-brand-subtext" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder={role === "merchant" ? "John Doe" : "Sarah Jenkins"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base md:text-sm placeholder-brand-subtext h-full"
              required
              autoFocus
            />
          </InputGroup>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-brand-text uppercase">
            Email
          </Label>
          <InputGroup className="bg-brand-surface border border-brand-border rounded-lg h-10 px-1">
            <InputGroupAddon>
              <Mail className="w-4 h-4 text-brand-subtext" />
            </InputGroupAddon>
            <InputGroupInput
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-base md:text-sm placeholder-brand-subtext h-full"
              required
            />
          </InputGroup>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-brand-text uppercase">
            Password
          </Label>
          <InputGroup className="bg-brand-surface border border-brand-border rounded-lg h-10 px-1">
            <InputGroupAddon>
              <Lock className="w-4 h-4 text-brand-subtext" />
            </InputGroupAddon>
            <InputGroupInput
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-base md:text-sm placeholder-brand-subtext h-full"
              required
              minLength={8}
            />
          </InputGroup>
        </div>

        <div className="flex items-start gap-2.5 py-1">
          <Checkbox
            id="agree"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(!!v)}
            className="mt-0.5 border-brand-border text-brand-blue"
          />
          <label
            htmlFor="agree"
            className="text-xs md:text-sm text-brand-subtext leading-snug cursor-pointer select-none text-left"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-brand-blue font-semibold hover:underline"
            >
              Terms
            </Link>{" "}
            &{" "}
            <Link
              href="/privacy"
              className="text-brand-blue font-semibold hover:underline"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-1 border-0 h-auto cursor-pointer shadow-none"
        >
          <span>
            {isPending ? "Creating Account..." : "Create Free Account"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <hr className="border-t border-brand-border w-full" />
        <span className="absolute bg-brand-bg px-3 text-[10px] uppercase font-bold text-brand-subtext tracking-wider">
          Or continue with
        </span>
      </div>

      {/* Google Sign In Button */}
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full h-10 border border-brand-border bg-brand-surface hover:bg-brand-bg text-brand-text hover:text-brand-navy flex items-center justify-center gap-2.5 rounded-lg text-sm font-bold transition-all shadow-none cursor-pointer"
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
        <span>Continue with Google</span>
      </Button>

      <p className="text-center text-sm font-semibold text-brand-subtext">
        Have an account?{" "}
        <Link
          href="/auth/login"
          className="text-brand-blue font-bold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
