"use client";

import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useUser } from "@/hooks/use-user";
import { signIn, signOut } from "@/lib/auth-client";
import { AuthCard } from "./auth-card";

export function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { user, role, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user && role === "admin") {
      router.replace("/admin/dashboard");
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
      if (role !== "admin") {
        toast.error("Access denied. Only administrators can log in here.");
        await signOut();
        return;
      }
      toast.success("Access granted. Welcome, Admin!");
      router.replace("/admin/dashboard");
    },
    onError: (err) => {
      toast.error(err?.message ?? "Something went wrong. Try again.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    const loginEmail = trimmed.includes("@")
      ? trimmed
      : `${trimmed}@vouchiqo.com`;
    loginMutation.mutate({ email: loginEmail, password });
  };

  const isPending = loginMutation.isPending;

  return (
    <AuthCard title="Admin Log In">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="space-y-1.5">
          <InputGroup className="bg-slate-50 dark:bg-zinc-900/50 border border-slate-250/70 dark:border-zinc-800 rounded-md h-10 px-2 transition-all has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-brand-blue/60">
            <InputGroupAddon>
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            </InputGroupAddon>
            <InputGroupInput
              type="text"
              placeholder="Admin Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-brand-blue hover:bg-blue-600 active:scale-[0.98] text-white rounded-md py-2 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 border-0 h-auto cursor-pointer shadow-none disabled:opacity-50 disabled:pointer-events-none mt-1"
        >
          <span>{isPending ? "Authenticating..." : "Admin Log In"}</span>
          {!isPending && <ArrowRight className="w-4 h-4" />}
        </Button>
      </form>
    </AuthCard>
  );
}
