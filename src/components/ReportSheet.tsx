"use client";

import { contentReportOptions, threadReportOptions, userReportOptions } from "@lib/constants";
import { checkIfReportExists } from "@lib/helpers/common";
import { useQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import { useState } from "react";
import { Form, Textarea } from "./form";
import Choice from "./form/Choice";
import { CheckIcon } from "@assets/Icons";
import { ReportTypeEnum } from "@type/schemas";
import { submitReportMutation } from "@lib/helpers/mutations";

const ReportSheet = ({ id, type, uid, ext_id }: { type: ReportTypeEnum, id: string, uid: string, ext_id: string | undefined }) => {

    const { data } = useQueryHook({
        queryFn: () => checkIfReportExists(id, uid, type),
        queryKeys: getQueryKeys("ifReportExists_cnid_type", { cnid: id, type }),
    });

    const [chosenOption, setChosenOption] = useState('');

    if (data) return (
        <section className="py-4 px-2 sm:px-4">
            <div className="my-4">
                <span className="inline p-4 bg-green-500/20 rounded-full">
                    <CheckIcon className="color-invert size-20" />
                </span>
            </div>
            <h4 className="text-lg">You have already reported this {type}.</h4>
            <div className="mt-4 space-y-2">
                <p>Please wait while your report gets reviewed. You will be inform shortly.</p>
                <p className="text-sm">Reason: {data.reason}</p>
                <p className="text-sm">Details: {data.details || "No details were provided"}</p>
            </div>

        </section>
    )

    const reportOptions = type === "user" ? userReportOptions : type === "thread" ? threadReportOptions : contentReportOptions;

    const submitChoice = (c: { report: string }) => {
        setChosenOption(c.report);
    }

    const submitReport = ({ details }: { details: string }) => {
        submitReportMutation(uid, id, type,
            {
                content_id: id,
                content_type: type,
                reason: chosenOption,
                details,
                ext_id,
            }
        )
    }

    if (!chosenOption) return (
        <section className="size-full">
            <p className="text-sm">Help us make Parlocula a safe place for everyone, no matter their age.</p>
            {type === "user" || type === "thread" && (
                <p className="text-sm mt-2 text-gray-500">
                    To help us understand the real problem, make sure to report the corrent thing. If a content (post or comment) voilates the flow of using the app, report the content instead.
                </p>
            )}
            <Form submit={submitChoice}>
                <div className="flex flex-wrap gap-2">
                    {reportOptions.map(o => (
                        <Choice key={o} type="checkbox" group="report" label={o} name={o} />
                    ))}
                    <Choice type="checkbox" group="report" label="Others" name="Others" />
                </div>
                <div className="mt-4 absolute w-full bottom-0 p-4 border-t border-gray30">
                    <button type="submit" className="primary w-full sm:w-fit sm:ml-auto">Next</button>
                </div>
            </Form>
        </section>
    )

    return (
        <section className="size-full">
            <h3 className="my-4 text-lg font-semibold">Selected: {chosenOption}</h3>
            <Form submit={submitReport}>
                <Textarea
                    name="details"
                    description={chosenOption === "Others" ? "Required" : "Optional"}
                    placeholder="Add details about your report. Please do not include any personal information or questions."
                />
            </Form>
        </section>
    )

}

export default ReportSheet;