"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import Topbar from "@/components/layout/Topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-user";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ title, user, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, isLoaded, isLoggedIn } = useUser();

  useEffect(() => {
    if (isLoaded) {
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      // If user is trying to access merchant routes but is not a verified merchant yet
      if (pathname.startsWith("/merchant")) {
        if (role !== "merchant" && role !== "admin" && pathname !== "/merchant/profile") {
          router.push("/merchant/profile");
        }
      }

      // If user is trying to access admin routes but is not an admin
      if (pathname.startsWith("/admin")) {
        if (role !== "admin") {
          router.push("/");
        }
      }
    }
  }, [isLoaded, isLoggedIn, role, pathname, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface text-brand-text">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-blue" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider style={{ "--sidebar-width": "220px" }}>
        <div className="min-h-screen flex bg-brand-surface text-brand-text w-full">
          <AppSidebar />
          <SidebarInset className="bg-brand-surface flex-1 flex flex-col min-w-0">
            <Topbar title={title} user={user} />
            <main className="p-6 space-y-6 w-full flex-grow">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
