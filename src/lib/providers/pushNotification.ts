import { parloculaAppURL } from "@lib/constants";
import { TypedFunction } from "@type/other";
import Ably from "ably";
import Push from "ably/push";
import { toast } from "sonner";

let realtimeClient: Ably.Realtime | null = null;

const getAblyClient = (user_id: string) => {
  if (!realtimeClient) {
    realtimeClient = new Ably.Realtime({
      authUrl: `/api/v1/ably`,
      // authUrl: `${process.env.NODE_ENV === "production" ? parloculaAppURL : ""}/api/v1/ably`,
      pushServiceWorkerUrl: "/sw.js",
      clientId: user_id,
      plugins: { Push },
      autoConnect: true,
    });
  }
  return realtimeClient;
}

export const checkPushStatus = async (user_id: string) => {
  const client = new Ably.Realtime({
    authUrl: `${process.env.NODE_ENV === "production" ? parloculaAppURL : ""}/api/v1/ably`,
    clientId: user_id,
    autoConnect: true,
  });

  try {
    const list = await client.push.admin.deviceRegistrations.list({ clientId: user_id });
    if (list.items.length) return true;
    else return false;
  } catch (err) {
    console.warn("Error occured while checking push status", err);
    return false;
  }
}

export const enablePush = async (user_id: string, onSuccess?: TypedFunction, onError?: TypedFunction) => {

  const client = getAblyClient(user_id);

  await client.push.activate();

  // return new Promise<void>((resolve, reject) => {
  //   client.push.activate((err, deviceDetails) => {
  //     console.log(err, deviceDetails);
  //     if (err) {
  //       console.error("Error activating push:", err);
  //       toast.error("Failed to enable notification");
  //       onError?.();
  //       reject(err);
  //       return;
  //     }
  //     console.log("Device details:", deviceDetails);
  //     toast.success("Notification enabled.");
  //     onSuccess?.();
  //     resolve();
  //   });
  // });
}

export const disablePush = async (user_id: string) => {
  const client = getAblyClient(user_id);
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