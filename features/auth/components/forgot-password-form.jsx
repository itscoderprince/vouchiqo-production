"use client";

import { ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/features/auth/hooks/use-forgot-password";
import { AuthCard } from "./auth-card";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const { mutate: sendReset, isPending, isSuccess } = useForgotPassword();

  return (
    <AuthCard title="Recover your password">
      {isSuccess ? (
        <div className="text-center space-y-4 py-4">
          <div className="mx-auto w-12 h-12 bg-brand-success/10 text-brand-success rounded-full flex items-center justify-center border border-brand-success/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-brand-text">
              Check your inbox
            </h3>
            <p className="text-xs text-brand-subtext">
              Reset link sent to{" "}
              <strong className="text-brand-text">{email}</strong>.
            </p>
          </div>
          <Link
            href="/login"
            className="btn-tertiary text-xs py-2 px-6 flex items-center justify-center gap-1.5 w-full border border-brand-border rounded-lg"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendReset({ email });
          }}
          className="space-y-5"
        >
          <p className="text-xs text-brand-subtext">
            Enter your email and we'll send a password reset link.
          </p>
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
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs placeholder-brand-subtext h-full"
                required
                autoFocus
              />
            </InputGroup>
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-0 h-auto cursor-pointer shadow-none"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPending ? "Sending..." : "Send Reset Link"}</span>
          </Button>
          <Link
            href="/login"
            className="flex items-center justify-center gap-1 text-xs font-bold text-brand-blue hover:underline py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </form>
      )}
    </AuthCard>
  );
}
