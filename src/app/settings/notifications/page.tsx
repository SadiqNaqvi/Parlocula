import { getUserFromToken } from "@lib/auth/utils";
import { checkPushStatus } from "@lib/providers/pushNotification";
import { cookies } from "next/headers";
import NotificationPage from "./NotificationPage";

const Page = async () => {
    const user = await getUserFromToken(await cookies());

    if (!user) return null;

    const status = await checkPushStatus(user.user_id);

    return <NotificationPage status={status} />

}

export default Page;