"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/shared";
import { BroadcastForm, BroadcastHistory } from "@/components/broadcast";
import { useAdminStore } from "@/store/useAdminStore";

export default function BroadcastPage() {
  const { broadcasts, isLoading, sendBroadcastMessage, getBroadcastHistory } =
    useAdminStore();

  useEffect(() => {
    getBroadcastHistory(20);
  }, [getBroadcastHistory]);

  const handleSend = async (
    title: string,
    message: string,
    target: "all" | "users" | "drivers" | "admins",
    notificationType: "push" | "email" | "both",
  ) => {
    await sendBroadcastMessage(title, message, target, notificationType);
    await getBroadcastHistory(20);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <PageHeader
        title="Broadcast"
        description="Send notifications to users and drivers"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <BroadcastForm onSend={handleSend} />
        <BroadcastHistory broadcasts={broadcasts} isLoading={isLoading} />
      </div>
    </div>
  );
}
