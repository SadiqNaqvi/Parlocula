import { Navbar } from "@components"
import ReportSection from "@components/ReportSection"
import { getUserFromToken } from "@lib/auth/utils";
import { cookies } from "next/headers";

const ThreadReportPage = async ({ params }: { params: { id: string } }) => {

    const tid = params.id.split('-')[0];

    const user = await getUserFromToken(cookies());

    if (!user) return null;

    return (
        <>
            <Navbar navTitle="Reports on Thread" />
            <div className="mt-4">
                <ReportSection content_id={tid} isThread uid={user.user_id} />
            </div>
        </>
    )
}

export default ThreadReportPage;