import { parloculaAppURL } from "@lib/constants";
import { TypedFunction } from "@type/other";
import Ably from "ably";
import Push from "ably/push";
import { toast } from "sonner";

export const checkPushStatus = async (user_id: string) => {
  const client = new Ably.Realtime({
    authUrl: `${parloculaAppURL}/api/v1/ably`,
    pushServiceWorkerUrl: "/sw.js",
    clientId: user_id,
    plugins: { Push },
  });

  const list = await client.push.admin.deviceRegistrations.list({ clientId: user_id });
  if (list.items.length) return true;
  else return false;
}

export const enablePush = async (user_id: string, onSuccess?: TypedFunction, onError?: TypedFunction) => {
  const client = new Ably.Realtime({
    authUrl: `/api/v1/ably`,
    pushServiceWorkerUrl: "/sw.js",
    clientId: user_id,
    plugins: { Push },
  });

  await client.push.activate(() => {
    toast.success("Notification Enabled successfully");
    onSuccess?.();
  }, () => {
    toast.success("Unable to enable push notification.");
    onError?.();
  });
}

export const disablePush = async (user_id: string) =>
  await new Ably.Realtime({
    authUrl: `/api/v1/ably`,
    pushServiceWorkerUrl: "/sw.js",
    clientId: user_id,
    plugins: { Push },
  }).push.deactivate();
