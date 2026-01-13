import { generateToken, getSession, storeSession } from "@lib/auth";
import { updateHandler } from "@lib/helpers/handlers";
import { User } from "@model";
import { cookies } from "next/headers";

// Toggling Content Filter setting
export const PATCH = updateHandler({
    handler: async ({ user_id, session }) => {

        await User.findByIdAndUpdate(user_id,
            { $set: { filterContent: { $not: "$filterContent" } } },
            { session }
        );

        const cookieStore = await cookies();

        const sid = cookieStore.get("sid")?.value ?? "";

        const { result, success } = await getSession(sid);
        
        if (!success || !result)
            return { success: false, errCode: "unknown_error" };

        const sessionPayload = { ...result, filterContent: !result.filterContent }
        const { email, expireOn, ...tokenPayload } = sessionPayload;

        cookieStore.set("token", await generateToken(tokenPayload), {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
        });

        const stored = await storeSession(sid, sessionPayload);

        if (!stored) return { success: false, errCode: "data_storing_fail" }

        return {
            success: true,
            result: null,
            revalidateQueue: [`currentUser-${user_id}`]
        }

    }
});