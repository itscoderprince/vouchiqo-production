"use client";

import { ArrowRight, Lock, ShieldAlert, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { signIn, signOut } from "@/lib/auth-client";
import { AuthCard } from "./auth-card";

export function AdminLoginForm() {
  const [username, setUsername] = useState(
    process.env.NEXT_PUBLIC_ADMIN_USERNAME || ""
  );
  const [password, setPassword] = useState(
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ""
  );

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => signIn.email({ email, password }),
    onSuccess: async ({ data, error }) => {
      if (error) {
        toast.error(error.message ?? "Invalid credentials");
        return;
      }
      const role = data?.user?.role ?? "customer";
      if (role !== "admin") {
        toast.error("Access denied. Only administrators can log in here.");
        await signOut();
        return;
      }
      toast.success("Access granted. Welcome, Admin!");
      window.location.href = "/admin/dashboard";
    },
    onError: (err) => {
      toast.error(err?.message ?? "Something went wrong. Try again.");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin";
    
    let loginEmail = username.trim();
    if (loginEmail === adminUsername || !loginEmail.includes("@")) {
      loginEmail = `${loginEmail}@vouchiqo.com`;
    }
    
    loginMutation.mutate({ email: loginEmail, password });
  };

  const isPending = loginMutation.isPending;

  return (
    <AuthCard title="Administrator Portal Log In">
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4 flex items-start gap-2 text-xs text-amber-800 text-left">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          This system is restricted to authorized Vouchiqo administrators. Unauthorized access is strictly prohibited.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-brand-text">
            Admin Username
          </Label>
          <InputGroup className="bg-brand-surface border border-brand-border rounded-md h-10 px-1">
            <InputGroupAddon>
              <User className="w-4 h-4 text-brand-subtext" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-base md:text-sm placeholder-brand-subtext h-full"
              required
              autoFocus
            />
          </InputGroup>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-brand-text">
            Secure Password
          </Label>
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
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-semibold flex items-center justify-center gap-1 border-0 h-auto cursor-pointer shadow-none transition-all"
        >
          <span>{isPending ? "Authenticating..." : "Admin Log In"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </form>
    </AuthCard>
  );
}
