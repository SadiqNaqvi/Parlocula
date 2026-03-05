import { parloculaAppURL } from "@lib/constants";
import { TypedFunction } from "@type/other";
import Ably from "ably";
import Push from "ably/push";
import { toast } from "sonner";

let realtimeClient: Ably.Realtime | null = null;

const getAblyClient = async (user_id: string, usePrefix: boolean) => {
  if (realtimeClient && realtimeClient.auth.clientId !== user_id) {
    realtimeClient.close();
    realtimeClient = null;
  }

  if (!realtimeClient) {
    realtimeClient = new Ably.Realtime({
      // authUrl: `/api/v1/ably`,
      authUrl: `${process.env.NODE_ENV === "production" && usePrefix ? parloculaAppURL : ""}/api/v1/ably`,
      clientId: user_id,
      pushServiceWorkerUrl: "/sw.js",
      plugins: { Push },
    });
  }

  await realtimeClient.connection.whenState("connected");

  return realtimeClient;
}

export const checkPushStatus = async (user_id: string) => {
  const client = new Ably.Realtime({
    authUrl: `${process.env.NODE_ENV === "production" ? parloculaAppURL : ""}/api/v1/ably`,
    clientId: user_id,
    pushServiceWorkerUrl: "/sw.js",
    plugins: { Push },
  });

  await client.connection.whenState("connected");

  try {
    const list = await client.push.admin.deviceRegistrations.list({ clientId: user_id });
    // console.log(client.device());
    console.log(list.items)
    if (list.items.length) return true;
    else return false;
  } catch (err) {
    console.warn("Error occured while checking push status", err);
    return false;
  }
}

export const enablePush = async (user_id: string, onSuccess?: TypedFunction, onError?: TypedFunction) => {
  try {

    console.log("entered enable push")

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast.error("Push notifications not supported");
      onError?.();
      return;
    }

    console.log("service navigator passed");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification Permission is not allowed");

      toast.error("Please allow notifications to continue");
      onError?.();
      return;
    }

    console.log("Notification Permission is allowed");

    const lala = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    console.log("Service worker registered", lala);

    const client = await getAblyClient(user_id, false);

    console.log("About to activate push notification");

    return new Promise<void>((resolve, reject) => {
      client.push.activate((err, deviceDetails) => {
        console.log(err, deviceDetails);
        if (err) {
          console.error("Error activating push:", err);
          toast.error("Failed to enable notification");
          onError?.();
          reject(err);
          return;
        }
        console.log("Device details:", deviceDetails);
        toast.success("Notification enabled.");
        onSuccess?.();
        resolve();
      });
    });

  } catch (e: any) {
    console.error("enablePush failed:", e);
    toast.error("Failed to enable notification");
    onError?.();
  }
}

export const disablePush = async (user_id: string) => {
  const client = await getAblyClient(user_id, false);
  return new Promise<void>((resolve, reject) => {

    client.push.activate(
      (err, deviceDetails) => {
        console.log(err, deviceDetails);
        if (err) {
          console.error("Error activating push:", err);
          toast.error("Failed to enable notification");
          reject(err);
          return;
        }
        console.log("Device details:", deviceDetails);
        toast.success("Notification enabled.");
        // onSuccess?.();
        resolve();
      }
    );
  });
}