"use client";

import { getUserFromToken } from "@lib/auth/utils";
import { cookies } from "next/headers";
import ReportedContentsSection from "../ReportedContentsSection";

const ReportedCommentsPage = async ({ params }: { params: { id: string } }) => {

    const user = await getUserFromToken(cookies());
    if (!user) return null;

    const tid = params.id.split('-')[0];

    return <ReportedContentsSection tid={tid} uid={user.user_id} type="comment" />

}

export default ReportedCommentsPage;