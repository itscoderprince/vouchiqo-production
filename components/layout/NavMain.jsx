"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMerchantLock } from "@/components/shared/MerchantLockProvider";
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

export function NavMain({ groups, isMerchant = false }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { isProfileIncomplete, openModal } = useMerchantLock();

  const [openSubMenus, setOpenSubMenus] = useState({});

  const toggleSubMenu = (title) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleNavClick = (e, url) => {
    if (isMerchant && isProfileIncomplete) {
      if (!url || !url.startsWith("/merchant/profile")) {
        e.preventDefault();
        e.stopPropagation();
        openModal();
        toast.error(
          "Profile Incomplete! Please complete your store profile to unlock this feature.",
          { id: "profile-lock-toast" },
        );
      }
    }
  };

  return (
    <div className="space-y-1 font-sans text-left">
      {groups.map((group) => (
        <SidebarGroup key={group.title} className="p-0">
          {!isCollapsed && group.title !== "Navigation" && (
            <SidebarGroupLabel
              className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider block h-auto ${
                isMerchant ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {group.title}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => {
                const normalizedPath = pathname.replace(/\/$/, "");
                const normalizedUrl = item.url
                  ? item.url.replace(/\/$/, "")
                  : "";
                const hasSubItems = item.subItems && item.subItems.length > 0;

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
                      normalizedPath.startsWith(`${normalizedUrl}/`));
                }

                const isSubOpen =
                  openSubMenus[item.title] !== undefined
                    ? openSubMenus[item.title]
                    : isParentActive || item.defaultOpen === true;

                const Icon = item.icon;

                // CTA item (e.g. Post New Listing)
                if (item.isCta) {
                  const ctaClass = isParentActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold rounded-xl"
                    : "border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold bg-blue-50/80 shadow-2xs rounded-xl";

                  const ctaIconClass = isParentActive
                    ? "text-white"
                    : "text-blue-600";

                  return (
                    <SidebarMenuItem
                      key={item.title}
                      className="my-0.5"
                      data-tour="tour-post-new"
                    >
                      <Link
                        href={item.url}
                        onClick={(e) => handleNavClick(e, item.url)}
                        className={`flex w-full items-center gap-2.5 px-2.5 py-1.5 text-xs transition-all ${ctaClass} ${
                          isCollapsed ? "justify-center px-2" : "justify-start"
                        }`}
                      >
                        {Icon && (
                          <Icon
                            className={`h-4 w-4 shrink-0 transition-colors ${ctaIconClass}`}
                          />
                        )}
                        {!isCollapsed && (
                          <span className="text-xs font-bold">
                            {item.title}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuItem>
                  );
                }

                // Expandable sub-items menu (e.g. My Listings, Merchants)
                if (hasSubItems) {
                  const parentBtnClass = isParentActive
                    ? "!bg-blue-600 !text-white font-bold shadow-md shadow-blue-500/20 hover:!bg-blue-700 rounded-xl"
                    : "bg-blue-50/50 hover:bg-blue-100/70 text-slate-800 hover:text-blue-900 font-semibold border border-blue-100/60 rounded-xl transition-all shadow-2xs";

                  const parentIconClass = isParentActive
                    ? "!text-white"
                    : "text-blue-600/80 group-hover:text-blue-700";

                  const parentTextClass = isParentActive
                    ? "!text-white font-bold"
                    : "text-slate-800 font-semibold";

                  const chevronClass = isParentActive
                    ? "text-white"
                    : "text-slate-500";

                  return (
                    <SidebarMenuItem
                      key={item.title}
                      data-tour={item.tourId}
                      className="my-0.5"
                    >
                      <SidebarMenuButton
                        onClick={(e) => {
                          if (isMerchant && isProfileIncomplete) {
                            handleNavClick(e, item.url);
                          }
                          toggleSubMenu(item.title);
                        }}
                        isActive={false}
                        tooltip={isCollapsed ? item.title : undefined}
                        className={`w-full justify-between h-8.5 py-1 px-2.5 text-xs transition-all cursor-pointer ${parentBtnClass}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {Icon && (
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-colors ${parentIconClass}`}
                            />
                          )}
                          <span className={`text-xs ${parentTextClass}`}>
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && !isCollapsed && (
                            <span
                              className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full text-[9px] font-extrabold px-1.5 shrink-0 shadow-2xs ${
                                item.badgeColor || "bg-red-500 text-white"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {!isCollapsed && (
                            <ChevronDown
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${chevronClass} ${
                                isSubOpen ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </div>
                      </SidebarMenuButton>

                      {!isCollapsed && isSubOpen && (
                        <SidebarMenuSub className="mt-1 space-y-1 pl-2.5 border-l border-blue-200">
                          {item.subItems.map((sub) => {
                            const isSubActive = (() => {
                              const [subPath, subQuery] = sub.url.split("?");
                              const normalizedSubPath = subPath.replace(
                                /\/$/,
                                "",
                              );
                              const normalizedCurrentPath = pathname.replace(
                                /\/$/,
                                "",
                              );

                              if (normalizedCurrentPath !== normalizedSubPath)
                                return false;

                              if (!subQuery) {
                                return (
                                  !searchParams?.get("type") &&
                                  !searchParams?.get("status")
                                );
                              }

                              const subParams = new URLSearchParams(subQuery);
                              for (const [key, value] of subParams.entries()) {
                                if (searchParams?.get(key) !== value)
                                  return false;
                              }
                              return true;
                            })();

                            const SubIcon = sub.icon;

                            const subBtnClass = isSubActive
                              ? "!bg-blue-600 !text-white font-bold shadow-xs rounded-lg"
                              : "!bg-blue-50/40 hover:!bg-blue-100/70 !text-slate-700 hover:!text-blue-900 font-semibold border border-blue-100/50 rounded-lg shadow-2xs";

                            const subIconClass = isSubActive
                              ? "!text-white"
                              : "!text-blue-600/80";

                            const subTextClass = isSubActive
                              ? "!text-white font-bold"
                              : "!text-slate-700 font-semibold";

                            return (
                              <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={false}
                                  className={`h-7 py-0.5 px-2 text-xs transition-all ${subBtnClass}`}
                                >
                                  <Link
                                    href={sub.url}
                                    onClick={(e) => handleNavClick(e, sub.url)}
                                    className="flex items-center gap-2 w-full min-w-0"
                                  >
                                    {SubIcon && (
                                      <SubIcon
                                        className={`h-3.5 w-3.5 shrink-0 ${subIconClass}`}
                                      />
                                    )}
                                    <span className={`text-xs ${subTextClass}`}>
                                      {sub.title}
                                    </span>
                                    {sub.badge && !isCollapsed && (
                                      <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e85d04] text-[9px] font-black text-white px-1.5 shrink-0 shadow-2xs">
                                        {sub.badge}
                                      </span>
                                    )}
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

                // Normal sidebar navigation item
                const singleBtnClass = isParentActive
                  ? "!bg-blue-600 !text-white font-bold shadow-md shadow-blue-500/20 hover:!bg-blue-700 rounded-xl"
                  : "bg-blue-50/50 hover:bg-blue-100/70 text-slate-800 hover:text-blue-900 font-semibold border border-blue-100/60 rounded-xl transition-all shadow-2xs";

                const singleIconClass = isParentActive
                  ? "!text-white"
                  : "text-blue-600/80 group-hover:text-blue-700";

                const singleTextClass = isParentActive
                  ? "!text-white font-bold"
                  : "text-slate-800 font-semibold";

                const URL_TOUR_MAP = {
                  "/merchant/analytics": "tour-analytics",
                  "/merchant/billing": "tour-billing",
                  "/merchant/campaigns": "tour-campaigns",
                  "/merchant/notifications": "tour-notifications",
                  "/merchant/settings": "tour-settings",
                  "/faq": "sidebar-help",
                };

                const tourId = item.tourId || URL_TOUR_MAP[item.url];

                return (
                  <SidebarMenuItem
                    key={item.title}
                    data-tour={tourId}
                    className="my-0.5 relative"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={false}
                      tooltip={isCollapsed ? item.title : undefined}
                      className={`h-8.5 py-1 px-2.5 text-xs transition-all cursor-pointer group ${singleBtnClass}`}
                    >
                      <Link
                        href={item.url}
                        onClick={(e) => handleNavClick(e, item.url)}
                        className="flex items-center justify-between w-full relative"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {Icon && (
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-colors ${singleIconClass}`}
                            />
                          )}
                          {!isCollapsed && (
                            <span
                              className={`text-xs truncate ${singleTextClass}`}
                            >
                              {item.title}
                            </span>
                          )}
                        </div>
                        {item.badge && !isCollapsed && (
                          <span
                            className={`flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] px-2 shrink-0 ${
                              item.badgeColor ||
                              "bg-red-500 text-white font-extrabold shadow-xs shadow-red-500/40 animate-pulse"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.badge && isCollapsed && (
                          <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
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

