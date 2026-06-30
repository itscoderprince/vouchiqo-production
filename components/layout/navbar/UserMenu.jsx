"use client";

import { LogOut, Settings, Ticket, User, UserCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const USER_MENU = [
  { icon: User, label: "My Profile", href: "/profile" },
  { icon: Ticket, label: "My Coupons", href: "/my-coupons" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: LogOut, label: "Sign Out", href: "/logout", danger: true },
];

export const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`p-1 rounded-full transition-colors cursor-pointer ${
          open
            ? "text-[#2563eb] bg-[#eff6ff]"
            : "text-gray-700 hover:text-[#2563eb] hover:bg-[#eff6ff]"
        }`}
        aria-label="User menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <UserCircle className="h-[26px] w-[26px]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 overflow-hidden">
          {USER_MENU.map(({ icon: Icon, label, href, danger }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors ${
                danger
                  ? "text-red-500 hover:bg-red-50"
                  : "text-gray-700 hover:bg-[#eff6ff] hover:text-[#2563eb]"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserMenu;
