"use client";

import { InfiniteScroller, Navbar } from "@components";
import { LoadingSpinner, ReportedContentBar } from "@components/ui";
import { actionOnReportedContents } from "@lib/helpers/mutations";
import { getReportedContents } from "@lib/helpers/common";
import { getQueryClient } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { useMutation } from "@tanstack/react-query";
import { ReportedContent } from "@type/internal";
import { AvailableActionsForReport, ReportActionSchemaType } from "@type/schemas";
import { useState } from "react";
import appToast from "@lib/providers/toast";

type Props = {
    type: "post" | "comment",
    tid: string,
    uid: string,
}

const DetailsSection = ({ type }: Pick<Props, "type">) => {
    return (
        <section className="py-4">
            <ul className="space-y-2">
                <li>Below are the reported {type}s of this thread.</li>
                <li>Since you are the manager of this thread, it is your responsibility to take actions on these.</li>
                <li>You can either keep them, delete them or notify the author to update the {type} accordingly.</li>
                <li>Action (keep): The {type} stays and all the reports on it will be deleted.</li>
                <li>Action (delete): The {type} along with all the reports on it will be deleted.</li>
                <li>Action (warn): The author of the {type} will be warned about these reports. The {type} along with all the reports on it will stay until one of the managers decides to keep or delete it.</li>
                <li>It is adviced to give the author some time after warning them. But if the {type} breaks the rules of the thread/app, immediately delete the {type}.</li>
                <li>The decision can be changed until you click on save button above.</li>
            </ul>
        </section>
    )
}

const ReportedContentsSection = ({ tid, type, uid }: Props) => {

    const [decisionBuffer, setDecisionBuffer] = useState<Map<string, AvailableActionsForReport>>(new Map());

    const qkeys = getQueryKeys("reportedContents_type_tid", { type, tid });

    const { isPending, mutate } = useMutation({
        mutationFn: (data: ReportActionSchemaType) =>
            actionOnReportedContents(tid, uid, data),
        onSuccess: () => {
            getQueryClient().refetchQueries({ queryKey: qkeys })
        }
    });

    const handleDecision = (id: string, action: AvailableActionsForReport) => {
        if (decisionBuffer.size >= 50)
            appToast.error("Only 50 decisions are allowed to save at a time")
        setDecisionBuffer(decisionBuffer.set(id, action));
    }

    const Component = (content: ReportedContent) => {

        const report = { ...content, content_type: type } as ReportedContent;

        return (
            <ReportedContentBar content={report}>
                <section className="mt-4">
                    <div>
                        <button
                            className="bg-green-500/50 p-2"
                            onClick={() => handleDecision(content._id, "keep")}
                        >
                            Keep
                        </button>
                        <button
                            className="bg-orange-500/50 p-2"
                            onClick={() => handleDecision(content._id, "warn")}
                        >
                            Warn
                        </button>
                        <button
                            className="bg-red-500/50 p-2"
                            onClick={() => handleDecision(content._id, "delete")}
                        >
                            Delete
                        </button>
                    </div>
                    {decisionBuffer.has(content._id) && (
                        <p className="mt-2 text-center text-sm">Decision Taken: {decisionBuffer.get(content._id)}</p>
                    )}
                </section>
            </ReportedContentBar >
        )
    }

    const handleSave = () => {
        if (decisionBuffer.size < 1 || decisionBuffer.size > 50)
            appToast.error("At least 1 upto 50 decisions are allowed to save at a time.")

        const actions = decisionBuffer
            .entries()
            .map(([k, v]) => ({ id: k, action: v }))
            .toArray();

        mutate({ actions, type });
    }

    return (
        <>
            {isPending && (
                <div className="overflow-hidden fixed inset-0">
                    <LoadingSpinner />
                </div>
            )}

            <Navbar
                navTitle="Reported Posts"
                OptionButton={<button className="primary" onClick={handleSave}>Save</button>}
            />

            <DetailsSection type={type} />

            <InfiniteScroller
                Component={Component}
                fetchData={(p) => getReportedContents(tid, uid, type, p)}
                queryKeys={qkeys}
            />
        </>
    )


}

export default ReportedContentsSection;