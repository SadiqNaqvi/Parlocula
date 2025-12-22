import { AblyEventParams, AblyEventType } from "@type/other";
import Ably, { Realtime, Rest } from "ably";
// import * as Ably from 'ably/promises';

let ably_realtime: Realtime | null = null;
let ably_rest: Rest | null = null;

export const getAblyOnClient = (client_id: string) => {
  if (!client_id) throw new Error("Client id is required to get ably.");

  if (!ably_realtime) {
    ably_realtime = new Ably.Realtime({
      authUrl: `${process.env.NEXT_PUBLIC_PARLOCULA_URL}/api/v1/ably`,
      clientId: client_id,
      autoConnect: true,
    });
  }

  return ably_realtime;
};

// export const getAblyRealtime = async () => {
//   if (!ably_realtime) {
//     ably_realtime = new Ably.Realtime(process.env.ABLY_API_KEY!);
//     await ably_realtime.connection.once("connected")
//   }
//   return ably_realtime;
// };

export const getAblyRest = () => {
  if (!ably_rest) ably_rest = new Ably.Rest(process.env.ABLY_API_KEY!);
  return ably_rest;
};

export const publishAblyEvent = async <T extends AblyEventType = AblyEventType>(event: T, data: AblyEventParams[T], users: string[]) => {

  const ably = getAblyRest();

  await Promise.all(users.map(uid => {
    // console.log(`sending event to ${uid}`);
    const channel = ably.channels.get(uid);
    return channel.publish(event, data);
  }));

}

export const getAblyRealtime = async (): Promise<Ably.Realtime> => {
  if (!ably_realtime) {
    ably_realtime = new Ably.Realtime(process.env.ABLY_API_KEY!);
    await new Promise<void>((resolve, reject) => {
      ably_realtime!.connection.once('connected', () => {
        console.log("Ably Realtime Connected");
        resolve();
      });
      ably_realtime!.connection.once('failed', (err) => {
        console.log("Error Occured while getting Ably RealTime");
        reject(err);
      });
    });
  }
  return ably_realtime;
};