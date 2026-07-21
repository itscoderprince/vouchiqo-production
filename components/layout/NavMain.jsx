"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({ groups }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const [openSubMenus, setOpenSubMenus] = useState({
    "My Listings": true,
  });

  const toggleSubMenu = (title) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="space-y-2.5">
      {groups.map((group) => (
        <SidebarGroup key={group.title} className="p-0">
          {!isCollapsed && group.title !== "Navigation" && (
            <SidebarGroupLabel className="px-2 py-0.5 text-[11px] font-bold text-sidebar-foreground/60 uppercase tracking-wider block h-auto">
              {group.title}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => {
                const normalizedPath = pathname.replace(/\/$/, "");
                const normalizedUrl = item.url ? item.url.replace(/\/$/, "") : "";
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isSubOpen = openSubMenus[item.title] !== false;

                // Single active item logic: only one item is active at a time
                let isParentActive = false;
                if (hasSubItems) {
                  isParentActive = item.subItems.some((sub) => {
                    const subBaseUrl = sub.url.split("?")[0].replace(/\/$/, "");
                    return normalizedPath === subBaseUrl;
                  });
                } else if (normalizedUrl) {
                  isParentActive =
                    normalizedPath === normalizedUrl ||
                    (normalizedUrl !== "" &&
                      normalizedUrl !== "/merchant/dashboard" &&
                      normalizedUrl !== "/admin/dashboard" &&
                      normalizedUrl !== "/customer/dashboard" &&
                      normalizedPath.startsWith(normalizedUrl + "/"));
                }

                const Icon = item.icon;

                if (item.isCta) {
                  return (
                    <SidebarMenuItem key={item.title} className="my-0.5 px-0.5">
                      <Link
                        href={item.url}
                        className={`flex w-full items-center gap-2 rounded-lg font-medium px-2 py-1.5 text-[13px] transition-colors ${
                          isParentActive
                            ? "bg-[#e85d04] text-white font-semibold shadow-xs"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        } ${isCollapsed ? "justify-center px-1.5" : "justify-start"}`}
                        style={
                          isParentActive
                            ? { backgroundColor: "rgb(232, 93, 4)", color: "#ffffff" }
                            : undefined
                        }
                      >
                        {Icon && (
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isParentActive
                                ? "text-white"
                                : "text-orange-600 dark:text-orange-400"
                            }`}
                          />
                        )}
                        {!isCollapsed && (
                          <span
                            className={
                              isParentActive
                                ? "text-white font-semibold"
                                : "text-orange-600 dark:text-orange-400 font-semibold"
                            }
                          >
                            {item.title}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuItem>
                  );
                }

                if (hasSubItems) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => toggleSubMenu(item.title)}
                        isActive={false}
                        tooltip={isCollapsed ? item.title : undefined}
                        className={`w-full justify-between h-8.5 py-1 px-2 text-[13px] font-medium transition-colors ${
                          isParentActive
                            ? "text-orange-600 dark:text-orange-400 font-semibold"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {Icon && (
                            <Icon
                              className={`h-4 w-4 shrink-0 ${
                                isParentActive
                                  ? "text-orange-600 dark:text-orange-400"
                                  : ""
                              }`}
                            />
                          )}
                          <span>{item.title}</span>
                        </div>
                        {!isCollapsed && (
                          <ChevronDown
                            className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                              isParentActive
                                ? "text-orange-600 dark:text-orange-400"
                                : "text-sidebar-foreground/50"
                            } ${isSubOpen ? "rotate-180" : ""}`}
                          />
                        )}
                      </SidebarMenuButton>

                      {!isCollapsed && isSubOpen && (
                        <SidebarMenuSub className="mt-0.5 space-y-0.5">
                          {item.subItems.map((sub) => {
                            const isSubActive = (() => {
                              const [subPath, subQuery] = sub.url.split("?");
                              const normalizedSubPath = subPath.replace(/\/$/, "");
                              const normalizedCurrentPath = pathname.replace(/\/$/, "");

                              if (normalizedCurrentPath !== normalizedSubPath) return false;

                              if (!subQuery) {
                                return !searchParams?.get("type") && !searchParams?.get("status");
                              }

                              const subParams = new URLSearchParams(subQuery);
                              for (const [key, value] of subParams.entries()) {
                                if (searchParams?.get(key) !== value) return false;
                              }
                              return true;
                            })();

                            const SubIcon = sub.icon;
                            return (
                              <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isSubActive}
                                  className={`h-6.5 py-0.5 px-2 text-[12px] transition-colors ${
                                    isSubActive
                                      ? "bg-[#e85d04] text-white hover:bg-[#e85d04] hover:text-white font-semibold"
                                      : "font-normal"
                                  }`}
                                  style={
                                    isSubActive
                                      ? { backgroundColor: "rgb(232, 93, 4)", color: "#ffffff" }
                                      : undefined
                                  }
                                >
                                  <Link href={sub.url} className="flex items-center gap-2">
                                    {SubIcon && (
                                      <SubIcon
                                        className={`h-3.5 w-3.5 shrink-0 ${
                                          isSubActive
                                            ? "!text-white text-white"
                                            : "opacity-75 text-sidebar-foreground"
                                        }`}
                                        style={
                                          isSubActive
                                            ? { color: "#ffffff" }
                                            : undefined
                                        }
                                      />
                                    )}
                                    <span className={isSubActive ? "!text-white text-white font-semibold" : ""}>
                                      {sub.title}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isParentActive}
                      tooltip={isCollapsed ? item.title : undefined}
                      className={`h-8.5 py-1 px-2 text-[13px] font-medium transition-colors ${
                        isParentActive
                          ? "bg-[#e85d04] text-white hover:bg-[#e85d04] hover:text-white"
                          : ""
                      }`}
                      style={
                        isParentActive
                          ? { backgroundColor: "rgb(232, 93, 4)", color: "#ffffff" }
                          : undefined
                      }
                    >
                      <Link href={item.url} className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {Icon && (
                            <Icon
                              className={`h-4 w-4 shrink-0 ${
                                isParentActive ? "!text-white text-white" : ""
                              }`}
                              style={
                                isParentActive
                                  ? { color: "#ffffff" }
                                  : undefined
                              }
                            />
                          )}
                          <span className={isParentActive ? "!text-white text-white font-semibold" : ""}>
                            {item.title}
                          </span>
                        </div>
                        {item.badge && !isCollapsed && (
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  );
}
