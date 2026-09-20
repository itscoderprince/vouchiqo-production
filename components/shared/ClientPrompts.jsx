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

export default function ClientPrompts() {
  return (
    <>
      <GoogleOneTapPrompt />
      <PushNotificationPrompt />
    </>
  );
}
