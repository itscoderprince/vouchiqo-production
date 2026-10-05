"use client";

import dynamic from "next/dynamic";

const GoogleOneTapPrompt = dynamic(
  () => import("@/components/shared/GoogleOneTapPrompt"),
  { ssr: false },
);
const PushNotificationPrompt = dynamic(
  () => import("@/components/shared/PushNotificationPrompt"),
  { ssr: false },
);
const Toaster = dynamic(
  () => import("react-hot-toast").then((mod) => mod.Toaster),
  { ssr: false },
);

export default function ClientPrompts() {
  return (
    <>
      <GoogleOneTapPrompt />
      <PushNotificationPrompt />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: "13px", fontWeight: 600 },
        }}
      />
    </>
  );
}
