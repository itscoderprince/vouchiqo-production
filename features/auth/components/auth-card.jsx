import { Loader2 } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/Footer";

/**
 * Shared auth page shell — brand header + card.
 * Pass `loading` to show a spinner while session is resolving
 * (prevents flash of form for already-logged-in users).
 */
export function AuthCard({ title, loading = false, children }) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text">
      {/* Sticky Navbar */}
      <Navbar />

      {/* Main page content centered */}
      <main className="flex-1 flex flex-col justify-center items-center min-h-[calc(100vh-76px)] py-12 px-3 sm:px-6 lg:px-8">
        <div className="w-full sm:mx-auto sm:max-w-md text-center space-y-1 mb-4">
          <h2 className="text-2xl font-bold text-brand-text tracking-tight">
            {title}
          </h2>
        </div>

        <div className="w-full sm:mx-auto sm:max-w-md">
          <div className="bg-brand-bg py-6 px-6 sm:px-10 border border-brand-border rounded-md shadow-sm space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand-subtext" />
              </div>
            ) : (
              children
            )}
          </div>
        </div>
      </main>

      {/* Full Homepage Footer */}
      <Footer />
    </div>
  );
}
