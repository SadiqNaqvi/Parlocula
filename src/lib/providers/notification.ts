"use client";

import Ably from "ably";
import Push from "ably/push";
import { toast } from "sonner";
import { trycatch } from "../utils";
import { parloculaAppURL } from "@lib/constants";

export const checkPushStatus = () => {
  return Notification.permission;
};

export const enablePush = (user_id: string) =>
  trycatch(async () => {
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
  });

export const disablePush = (user_id: string) =>
  trycatch(() => {
    new Ably.Realtime({
      authUrl: `${parloculaAppURL}/api/v1/ably`,
      pushServiceWorkerUrl: "/sw.js",
      clientId: user_id,
      plugins: { Push },
    }).push
      .deactivate()
      .then(() => toast.success("UnRegistered successfully"));
  });
