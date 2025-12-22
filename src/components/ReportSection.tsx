"use client";

import { getReportsOnContent, getReportsOnThread } from "@lib/helpers/common";
import GenericWrapper from "./GenericWrapper";
import { getQueryKeys } from "@lib/utils";
import { ReportsType } from "@type/internal";
import { useOptionalState } from "@lib/hooks";
import { useRef } from "react";
import { ReportReasonType } from "@type/other";

type Props = {
    id: string,
    isThread: boolean,
    uid: string,
}

const getQueryProps = ({ id, isThread, uid }: Props) => {

    if (isThread) return {
        queryFn: getReportsOnThread,
        queryKeys: getQueryKeys("reports_cnid", { cnid: id }),
        args: [id, uid],
    }

    return {
        queryFn: getReportsOnContent,
        queryKeys: getQueryKeys("reports_cnid", { cnid: id }),
        args: [id],
    }
}

const ReportContentSection = ({ details }: { details: string[] }) => {

    if (!details || !details.length) return (
        <div className="forceCenter">No details are provided</div>
    )

    return (
        <ul>
            {details.map(detail => (
                <li key={detail} className="p-2 border-b border-gray40 last:border-transparent">{detail}</li>
            ))}
        </ul>
    )
}

type SectionProps = { content_id: string } &
    ({ isThread: true, uid: string } |
    { isThread?: false, uid?: string })

const ReportSection = ({ content_id, isThread, uid }: SectionProps) => {

    const reasons = useRef<ReportReasonType[]>([]);
    const reasonDetailsMap = useRef<Map<ReportReasonType, string[]>>()

    const Component = (data: { reports: ReportsType[] }) => {

        const [selectedReason, setSelectedReason] = useOptionalState(data?.reports[0]?._id)

        if (!data || !data.reports || data.reports.length) return (
            <section className="forceCenter">
                <p>Nothing to see here</p>
            </section>
        );

        const { reports } = data;

        reasons.current = reports.map(report => report._id);
        reasonDetailsMap.current = new Map(reports.map(report => [report._id, report.content]));

        return (
            <section>
                <ul className="flex my-4 overflow-x-auto noScroll gap-2">
                    {reasons.current.map(reason => (
                        <li
                            key={reason}
                            className={`w-fit rounded-xl border ${selectedReason === reason ? "border-primary" : "border-gray20"}`}
                        >
                            <button
                                onClick={() => setSelectedReason(reason)}
                                className="px-2 py-1">{reason}</button>
                        </li>
                    ))}
                </ul>
                <ReportContentSection details={reasonDetailsMap.current.get(selectedReason) ?? []} />
            </section>
        )
    }

    return <GenericWrapper
        getQueryProps={getQueryProps}
        props={{ id: content_id, isThread: Boolean(isThread), uid: uid || "" }}
        component={Component}
    />

}

export default ReportSection;