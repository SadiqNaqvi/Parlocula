import { Navbar } from "@components"
import ReportSection from "@components/ReportSection"
import { getUserFromToken } from "@lib/auth/utils";
import { ParloPageProps } from "@type/other";
import { cookies } from "next/headers";

const ThreadReportPage = async ({ params }: ParloPageProps) => {

    const tid = (await params).id.split('-')[0];

    const user = await getUserFromToken(await cookies());

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