"use client";

import Ably from "ably";
import Push from "ably/push";
import { toast } from "sonner";
import { trycatch } from "../utils";
import { parloculaAppURL } from "@lib/constants";

export const checkPushStatus = () => {
  return Notification.permission;
};

export const enablePush = async (user_id: string) => {
  const permission = await Notification.requestPermission();
  if (permission === "denied") {
    toast.error("Notification Permission denied");
    return;
  }

  const client = new Ably.Realtime({
    authUrl: `${parloculaAppURL}/api/v1/ably`,
    pushServiceWorkerUrl: "/sw.js",
    clientId: user_id,
    plugins: { Push },
  });

  await client.push.activate();
  toast.success("Notification Enabled successfully");
}

export const disablePush = async (user_id: string) =>
  await new Ably.Realtime({
    authUrl: `${parloculaAppURL}/api/v1/ably`,
    pushServiceWorkerUrl: "/sw.js",
    clientId: user_id,
    plugins: { Push },
  }).push
    .deactivate()
    .then(() => toast.success("Notification disabled successfully"));
