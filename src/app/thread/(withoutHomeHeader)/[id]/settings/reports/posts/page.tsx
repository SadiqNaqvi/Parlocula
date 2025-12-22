import { getUserFromToken } from "@lib/auth/utils";
import { cookies } from "next/headers";
import ReportedContentsSection from "../ReportedContentsSection";

const ReportedPostsPage = async ({ params }: { params: { id: string } }) => {

    const user = await getUserFromToken(cookies());
    if (!user) return null;

    const tid = params.id.split('-')[0];

    return <ReportedContentsSection tid={tid} uid={user.user_id} type="post" />
}

export default ReportedPostsPage;