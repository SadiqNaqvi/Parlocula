// Get User Metadata {_id, username, profile}

import { getUserMetaFromCache } from "@lib/helpers/redis";

export const GET = async (r: any, { params: { ruid } }: { params: { ruid: string } }) => {
    try {
        return {
            success: true,
            result: await getUserMetaFromCache(ruid),
        }
    } catch (e: any) {
        console.log("Error occured while fetching user metadata", e.message);
        return { success: false, errCode: "unknown_error" };
    }
}