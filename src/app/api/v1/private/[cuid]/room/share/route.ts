// Sharing a content to different rooms

import { postHandler } from "@lib/helpers/handlers";
import { checkIfParticipantExistsInMultipleRooms, getParticipantsOfRooms, handleNewMessages } from "@lib/helpers/redis/messaging";
import { sendNotificationForMessage } from "@lib/helpers/server";
import { sharedContentSchema } from "@lib/schemas";
import { getPoster, parloId } from "@lib/utils";
import { MessageModelType } from "@type/models";
import { SharedContentSchemaType } from "@type/schemas";

export const POST = postHandler<SharedContentSchemaType>({
    handler: async ({ data, user_id, username, profile }) => {

        console.log("GEtting participants");
        const participants = await getParticipantsOfRooms(data.rooms);

        console.log("participants", participants);
        const messages: (MessageModelType & { _id: string })[] = data.rooms.map(room_id => ({
            content: data.message || '',
            createdAt: Date.now(),
            user_id,
            username,
            sharedContent: data.contentPath,
            room_id,
            _id: parloId(),
        }));

        console.log("handlingNewMessage")
        await handleNewMessages(data.rooms, messages);

        console.log("Sending Notifications");
        await Promise.all(messages.map(
            (message, i) => sendNotificationForMessage(
                participants[i]?.filter(p => !(p.type === "invitee" || p.uid === user_id)).map(p => p.uid) || [],
                {
                    title: "New message",
                    body: `${username} shared a content in room.`,
                    icon: profile ? getPoster({ external: false, path: profile }) : undefined,
                    path: `/room/${message.room_id}`,
                    tag: `message-${message.room_id}`,
                },
                message
            )
        ));

        return {
            success: true,
            result: messages.reduce(
                (prev, cur) => ({ ...prev, [cur.room_id]: cur._id }),
                {} as Record<string, string>
            ),
            revalidateQueue: [],
        };
    },
    schema: sharedContentSchema,
    preCheck: async ({ data, user_id }) => {

        const { rooms } = data;

        const participants = await checkIfParticipantExistsInMultipleRooms(user_id, rooms);

        if (participants.length === rooms.length && participants.every(p => p))
            return { success: true }

        return { success: false, errCode: "unauthorized_access" }
    }
})