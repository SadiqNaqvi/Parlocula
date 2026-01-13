"use client";

import { MockupCommentBar, MockupPostBar, MockupShelfBar, MockupTabs } from "@components/ui/mockup";
import { useState } from "react";

const sections = {
    posts: "Posts",
    "comments": "Comments",
    shelves: "Shelves",
}

type Section = keyof typeof sections;

const ContentMockup = () => {

    const [section, setSection] = useState<Section>("posts");

    if (section === "comments") return (
        <section className="mt-4 space-y-3">
            <MockupTabs tabs={sections} active={section} onClick={setSection} />
            {Array(3).fill(0).map((_, i) => (
                <MockupCommentBar key={i} />
            ))}
        </section>
    )

    else if (section === "shelves") return (
        <section className="mt-4 space-y-3">
            <MockupTabs tabs={sections} active={section} onClick={setSection} />
            {Array(6).fill(0).map((_, i) => (
                <MockupShelfBar key={i} />
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

export default ContentMockup;