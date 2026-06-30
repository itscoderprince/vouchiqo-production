"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";

export function NavMain({ groups }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Keep track of which menu groups are expanded
  const [openGroups, setOpenGroups] = useState({
    Overview: true,
    Commerce: true,
    Apps: true,
    System: true,
  });

  const toggleGroup = (title) => {
    setOpenGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isOpen = openGroups[group.title] !== false;

        return (
          <div key={group.title} className="space-y-1">
            {/* Group Label / Collapse Button */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => toggleGroup(group.title)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors border-0 bg-transparent cursor-pointer"
              >
                <span className="flex-1 text-start">{group.title}</span>
                <ChevronRight
                  className={`size-3 transition-transform duration-200 text-slate-400 ${
                    isOpen ? "rotate-90" : "rotate-0"
                  }`}
                />
              </button>
            )}

            {/* Group Items container */}
            <div
              className={`transition-all duration-200 ease-in-out overflow-hidden ${
                isOpen || isCollapsed
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0 h-0"
              }`}
            >
              <div className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.url;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.title}
                      href={item.url}
                      className={`group relative flex items-center transition-all duration-200 ${
                        isCollapsed
                          ? "justify-center p-2 rounded-lg"
                          : "gap-3 rounded-lg px-3 py-2 text-sm font-medium"
                      } ${
                        isActive
                          ? "bg-[#f1f5f9] text-[#0f172a]"
                          : "text-slate-600 hover:bg-[#f8fafc] hover:text-[#0f172a]"
                      }`}
                    >
                      {Icon && (
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                            isActive
                              ? "text-[#0f172a]"
                              : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                      )}
                      {!isCollapsed && (
                        <span className="flex-1 text-left">{item.title}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
