"use client";

import { InfiniteScroller } from "@components";
import { VerticleMovieCard } from "@components/ui";
import { fetchMoviesWithCompany, fetchMoviesWithNetwork, fetchShowsWithCompany, fetchShowsWithNetwork } from "@lib/contentFetcher";
import { PaginatedData, RefinedGeneralData, SortOptions } from "@type/external";
import { GeneralGetReturn } from "@type/internal";
import { useState } from "react";

type Sections = "movies_company" | "movies_network" | "shows_company" | "shows_network"

type Props = ({
    label: string,
    section: Sections,
    data?: undefined,
} | {
    label: string,
    section: "cast" | "crew",
    data: any[]
})[]

const funcMap: Record<Sections, (id: string, page?: number, sort_by?: SortOptions)
    => Promise<PaginatedData<RefinedGeneralData> | undefined>> =
{
    movies_company: fetchMoviesWithCompany,
    shows_company: fetchShowsWithCompany,
    movies_network: fetchMoviesWithNetwork,
    shows_network: fetchShowsWithNetwork,
}

const MediaFetcher = ({ sections, id }: { sections: Props, id: string, }) => {

    const [active, setActive] = useState(sections[0].section);
    const data = sections.find(el => el.section === active)?.data;

    const functionToFetch = async (p: number): Promise<GeneralGetReturn> => {
        if (active === "cast" || active === "crew")
            return { success: false, errCode: "unstable_internet" };
        const func = funcMap[active];
        const data = await func(id, p);
        if (data) return { success: true, result: data };
        return { success: false, errCode: "unstable_internet" }
    }

    const notFoundReasons = (): string => {
        switch (active) {
            case "cast": return "Looks like this person has never worked as a cast.";
            case "crew": return "Looks like this person has never worked as a crew member.";
            case "movies_company": return "Looks like this company has never produced a movie.";
            case "shows_company": return "Looks like this company has never produced a show.";
            case "movies_network": return "Looks like this netwrok has never produced a movie.";
            case "shows_network": return "Looks like this network has never produced a show.";
            default: return "";
        }
    }

    const NotFoundSection = (
        <div className="forceCenter flex-col">
            <h4 className="text-lg">Nothing could be found.</h4>
            <p className="text-sm">{notFoundReasons()}</p>
        </div>
    )

    return (
        <section className="mt-4 space-y-4">
            <ul className="flex gap-4 w-full">
                {sections.map(({ label, section }) => (
                    <li
                        key={section}
                        onClick={() => setActive(section)}
                        className={`p-2 pointer border-b-2 ${active === section ? "border-secondary" : "border-zinc-500"} flex-1 sm:flex-0 text-center capitalize`}
                    >
                        {label}
                    </li>
                ))}
            </ul>
            <div>
                <InfiniteScroller
                    className="flex flex-wrap gap-4"
                    Component={VerticleMovieCard}
                    fetchData={functionToFetch}
                    queryKeys={[active, id]}
                    initialData={data ? { data, total: data.length } : undefined}
                    initialPage={1}
                    NotFoundSection={NotFoundSection}
                />
            </div>
        </section>
    )
}

export default MediaFetcher;