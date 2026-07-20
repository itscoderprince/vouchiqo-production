"use client";

import { ArrowRight, Lock, Mail, Store } from "lucide-react";
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
import { AuthCard } from "./auth-card";

export function MerchantRegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const { mutate: register, isPending } = useRegister();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) return toast.error("Please agree to the Terms of Service.");
    register({ email, password, name, role: "merchant" });
  };

  return (
    <AuthCard title="Merchant Partner Registration">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm font-medium text-brand-text">
            <Store className="w-3.5 h-3.5 text-brand-blue" />
            Brand Name
          </Label>
          <InputGroup className="bg-brand-surface border border-brand-border rounded-md h-10 px-1">
            <InputGroupAddon>
              <Store className="w-4 h-4 text-brand-subtext" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="e.g. FabIndia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base md:text-sm placeholder-brand-subtext h-full"
              required
              autoFocus
            />
          </InputGroup>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm font-medium text-brand-text">
            <Mail className="w-3.5 h-3.5 text-brand-blue" />
            Business Email
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
            />
          </InputGroup>
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm font-medium text-brand-text">
            <Lock className="w-3.5 h-3.5 text-brand-blue" />
            Password
          </Label>
          <InputGroup className="bg-brand-surface border border-brand-border rounded-md h-10 px-1">
            <InputGroupAddon>
              <Lock className="w-4 h-4 text-brand-subtext" />
            </InputGroupAddon>
            <InputGroupInput
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-base md:text-sm placeholder-brand-subtext h-full"
              required
            />
          </InputGroup>
        </div>

        <div className="flex items-center space-x-2 pt-1.5">
          <Checkbox
            id="terms"
            checked={agreed}
            onCheckedChange={(checked) => setAgreed(!!checked)}
            className="w-4 h-4 rounded-sm border-brand-border"
          />
          <label
            htmlFor="terms"
            className="text-xs text-brand-subtext font-medium select-none cursor-pointer"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="text-brand-blue font-bold hover:underline"
            >
              Merchant Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-brand-blue font-bold hover:underline"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-semibold flex items-center justify-center gap-1 border-0 h-auto cursor-pointer shadow-none transition-all"
        >
          <span>
            {isPending ? "Creating account..." : "Register Merchant Account"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </form>

      <p className="text-center text-sm font-medium text-brand-subtext mt-4">
        Already registered?{" "}
        <Link
          href="/merchant-login"
          className="text-brand-blue font-bold hover:underline"
        >
          Log in here
        </Link>
      </p>
    </AuthCard>
  );
}
