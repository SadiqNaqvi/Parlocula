import { deleteSession } from "@lib/auth";
import { updateRequest } from "@lib/helpers/common";
import { timeBasedReversion } from "@lib/helpers/deletion";
import { sessionInvalidationSchema } from "@lib/schemas";
import { User } from "@model";
import { SessionInvalidationServerSchemaType } from "@type/schemas";
import bcrypt from "bcrypt";


export const PATCH = updateRequest<SessionInvalidationServerSchemaType>({
    handler: async ({ data, session }) => {

        const { email, passKey, date } = data;

        const user = await User.findOne({ email }).exec().then(u => u?.toObject());

        if (!user)
            return { success: false, errCode: "resource_not_found" }
        else if (!bcrypt.compareSync(passKey, user.passkey))
            return { success: false, errCode: "unauthorized_access" }

        await deleteSession(user.session_id);

        if (date) await timeBasedReversion(user._id.toString(), date, session)

        return {
            success: true,
            result: null,
            revalidateQueue: [],
        }
    },

    schema: sessionInvalidationSchema,
})