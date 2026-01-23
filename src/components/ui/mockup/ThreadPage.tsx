"use client";

import { MockupCommentBar, MockupPostBar, MockupTabs } from "@components/ui/mockup";
import { useState } from "react";

const sections = {
    posts: "Posts",
    comments: "Comments",
}

type Section = keyof typeof sections;

const ThreadPageMockup = () => {

    const [section, setSection] = useState<Section>("posts");

    if (section === "comments") return (
        <section className="mt-4 space-y-3">
            <MockupTabs tabs={sections} active={section} onClick={setSection} />
            {Array(3).fill(0).map((_, i) => (
                <MockupCommentBar key={i} />
            ))}
        </section>
    )

    return (
        <section className="mt-4 space-y-3">
            <MockupTabs tabs={sections} active={section} onClick={setSection} />
            {Array(3).fill(0).map((_, i) => (
                <MockupPostBar key={i} />
            ))}
        </section>
    )

}

export default ThreadPageMockup;