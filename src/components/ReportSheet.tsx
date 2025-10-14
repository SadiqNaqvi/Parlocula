import { contentReportOptions, threadReportOptions, userReportOptions } from "@lib/constants";
import { useState } from "react";
import Choice from "./form/Choice";
import { Form, Textarea } from "./form";

const ReportSheet = ({ id, type }: { type: "post" | "comment" | "user" | "thread", id: string }) => {

    const reportOptions = type === "user" ? userReportOptions : type === "thread" ? threadReportOptions : contentReportOptions;

    const [chosenOption, setChosenOption] = useState('');

    const submitChoice = (c: { report: string }) => {
        setChosenOption(c.report);
    }

    const submitReport = ({ details }: { details: string }) => {
        console.log({
            category: chosenOption,
            details
        });
    }

    if (!chosenOption) return (
        <section className="size-full">
            <p className="text-sm">Help us make Popcorn Paragon a safe place for everyone, including teens.</p>
            {type === "user" || type === "thread" && (
                <p className="text-sm mt-2 text-gray-500">
                    To help us understand the real problem, make sure to report the corrent thing. If a content (post or comment) voilates the flow of using the app, report the content instead.
                </p>
            )}
            <Form submit={submitChoice}>
                <div className="flex flex-wrap gap-2">
                    {reportOptions.map(o => (
                        <Choice type="checkbox" group="report" label={o} name={o} />
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