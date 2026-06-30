"use client";

import { LogOut, Settings, Ticket, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { signOut, useSession } from "@/lib/auth-client";

const USER_MENU = [
  { icon: User, label: "My Profile", href: "/profile" },
  { icon: Ticket, label: "My Coupons", href: "/customer/claimed" },
  { icon: Settings, label: "Settings", href: "/profile/settings" },
];

export const UserMenu = () => {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async (e) => {
    e.preventDefault();
    setOpen(false);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed out successfully!");
            router.push("/");
            router.refresh();
          },
        },
      });
    } catch (err) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  // Render a consistent loading skeleton during SSR and initial client hydration
  if (!mounted || isPending) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
    );
  }

  // Guest State: Render Sign In Button
  if (!session) {
    return (
      <Link
        href="/auth/login"
        className="text-[12px] font-extrabold text-[#FF7A18] hover:bg-[#FF7A18]/5 transition-all px-3.5 py-2 rounded-xl border border-[#FF7A18]/30 flex items-center gap-1.5 uppercase tracking-wider whitespace-nowrap"
      >
        <User className="h-3.5 w-3.5" />
        Sign In
      </Link>
    );
  }

  // Authenticated State: Render User Icon & Dropdown Menu
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`rounded-full transition-all focus:outline-none cursor-pointer flex items-center justify-center p-0.5 border-2 ${
          open
            ? "border-[#2563eb] bg-[#eff6ff]"
            : "border-transparent hover:border-gray-200"
        }`}
        aria-label="User menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User profile"}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="h-7 w-7 rounded-full bg-[#f1f5f9] text-[#475569] font-bold text-[11px] flex items-center justify-center uppercase">
            {getInitials(session.user.name)}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 overflow-hidden text-left">
          {/* User Profile Header */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-[#f8fafc]">
            <p className="text-[12px] font-black text-brand-navy truncate">
              {session.user.name || "Member"}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
              {session.user.email}
            </p>
          </div>

          {/* Menu Items */}
          {USER_MENU.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#eff6ff] hover:text-[#2563eb] transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer text-left"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
